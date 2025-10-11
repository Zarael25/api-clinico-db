/**
 * Descripción:
 *   Controladores para la gestión de atenciones médicas.
 *   Incluyen registro de atenciones, consultas por estudiante o fecha,
 *   obtención de detalle por ID y generación de reportes PDF.
 *
 * Características:
 *   - createAtencionMedica: valida permisos y registra nueva atención.
 *   - getAtencionesByEstudiante: lista atenciones de un estudiante con datos relacionados.
 *   - getAtencionById: devuelve detalle de una atención validando permisos.
 *   - getAtencionesByFecha: lista atenciones de un día específico con info de estudiantes.
 *   - generarReportePDF: genera reporte PDF con tabla de atenciones y resumen de medicamentos.
 *
 * Uso:
 *   router.post('/atenciones', verifyToken, inRoles(['admin','enfermeria']), createAtencionMedica)
 *   router.get('/atenciones/estudiante/:estudianteId', verifyToken, getAtencionesByEstudiante)
 *   router.get('/atenciones/:id', verifyToken, getAtencionById)
 *   router.get('/atenciones', verifyToken, getAtencionesByFecha)
 *   router.get('/atenciones/reporte/pdf', verifyToken, generarReportePDF)
 */

import { Request, Response, NextFunction } from 'express'
import AtencionMedica from '../../../database/models/AtencionMedica'
import Estudiante from '../../../database/models/Estudiante'
import PdfPrinter from 'pdfmake'
import path from 'path'

// ------------------ Crear Atención Médica ------------------
export const createAtencionMedica = async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const user = req.user as any
    const userId = user?._id
    const roles = user?.roles || []

    // Validar roles permitidos
    const rolesPermitidos = ['admin', 'enfermeria']
    const tienePermiso = roles.some((rol: string) => rolesPermitidos.includes(rol))

    if (!tienePermiso) {
      return res.status(403).json({
        error: {
          name: 'FORBIDDEN_ERROR',
          message: 'No tienes permiso para registrar atenciones médicas.',
          code: 'ERR_FORB',
        },
        code_response: 0,
      })
    }

    // Crear nueva atención médica
    const { estudiante, motivo_consulta, diagnostico, tratamiento, sugerir_baja, medicamentosAdministrados } = req.body

    
    const nuevaAtencion = await AtencionMedica.create({
      estudiante,
      user: userId, 
      motivo_consulta,
      diagnostico,
      tratamiento,
      sugerir_baja,
      medicamentosAdministrados,
    })

    res.status(201).json(nuevaAtencion)
  } catch (err) {
    next(err)
  }
}





// ------------------ Atenciones por Estudiante ------------------
export const getAtencionesByEstudiante = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { estudianteId } = req.params

    const atenciones = await AtencionMedica.find({ estudiante: estudianteId })
      .populate('user', 'nombre correo') // incluir nombre y correo del profesional
      .populate('medicamentosAdministrados.medicamento', 'nombre_comercial presentacion')
      .sort({ fecha: -1 }) // orden descendente

    res.json(atenciones)
  } catch (err) {
    next(err)
  }
}


// ------------------ Atenciones por ID ------------------
export const getAtencionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any
    const roles = user?.roles || []

    // Validar permisos
    const rolesPermitidos = ['admin', 'enfermeria']
    const tienePermiso = roles.some((rol: string) => rolesPermitidos.includes(rol))

    if (!tienePermiso) {
      return res.status(403).json({
        error: {
          name: 'FORBIDDEN_ERROR',
          message: 'No tienes permiso para ver el detalle de la atención.',
          code: 'ERR_FORB',
        },
        code_response: 0,
      })
    }

    const { id } = req.params

    const atencion = await AtencionMedica.findById(id)
      .populate('user', 'nombre correo')
      .populate(
        'medicamentosAdministrados.medicamento',
        'nombre_comercial nombre_generico presentacion'
      )

    if (!atencion) {
      return res.status(404).json({ message: 'Atención no encontrada' })
    }

    res.json(atencion)
  } catch (err) {
    next(err)
  }
}


// ------------------ Atenciones por Fecha (filtradas por niveles) ------------------
export const getAtencionesByFecha = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ message: 'Debe enviar una fecha en formato YYYY-MM-DD' });
    }

    // Construir rango de fechas del día
    const inicio = new Date(`${fecha}T00:00:00-04:00`);
    const fin = new Date(`${fecha}T23:59:59-04:00`);

    // Obtener usuario autenticado
    const user = req.user as any;
    const nivelesUsuario: string[] = user?.niveles || [];
    const rolesUsuario: string[] = user?.roles || [];

    // Filtro base por fecha
    const filtroAtencion: any = {
      fecha: { $gte: inicio, $lte: fin },
    };

    // 1️⃣ Buscar todas las atenciones del día
    const atenciones = await AtencionMedica.find(filtroAtencion)
      .populate('user', 'nombre correo')
      .populate('medicamentosAdministrados.medicamento', 'nombre_comercial presentacion')
      .lean()
      .exec();

    if (atenciones.length === 0) {
      return res.json([]);
    }

    // 2️⃣ Obtener los estudiantes involucrados en esas atenciones
    const idsEstudiantes = atenciones.map((a) => a.estudiante).filter(Boolean);

    // 3️⃣ Construir filtro de estudiantes
    const filtroEstudiantes: any = { _id: { $in: idsEstudiantes } };

    // Si el usuario no es admin, filtrar por niveles
    if (!rolesUsuario.includes('admin') && nivelesUsuario.length > 0) {
      filtroEstudiantes['gestiones.nivel'] = { $in: nivelesUsuario };
    }

    // 4️⃣ Buscar los estudiantes accesibles
    const estudiantes = await Estudiante.find(filtroEstudiantes)
      .select('nombre appaterno apmaterno carnet rude tutores gestiones')
      .lean();

    // 5️⃣ Mapear estudiantes accesibles
    const estudiantesMap = new Map(estudiantes.map((e) => [String(e._id), e]));

    // 6️⃣ Armar respuesta final (solo atenciones cuyos estudiantes son visibles)
    const resultado = atenciones
      .filter((a) => estudiantesMap.has(String(a.estudiante)))
      .map((a) => ({
        ...a,
        estudiante: estudiantesMap.get(String(a.estudiante)) || null,
      }));

    return res.json(resultado);
  } catch (err) {
    next(err);
  }
};



// ------------------ Configuración PDF ------------------
const fonts = {
  Roboto: {
    normal: path.resolve(__dirname, '../../../fonts/Roboto-Regular.ttf'),
    bold: path.resolve(__dirname, '../../../fonts/Roboto-Medium.ttf'),
    italics: path.resolve(__dirname, '../../../fonts/Roboto-Italic.ttf'),
    bolditalics: path.resolve(__dirname, '../../../fonts/Roboto-MediumItalic.ttf'),
  },
}

const printer = new PdfPrinter(fonts)

// ------------------ Generar Reporte PDF ------------------
export const generarReportePDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
  
    const rolesPermitidos = ['admin', 'enfermeria', 'administracion']
    const usuario = (req.user as any) 

    // Verificar permisos de usuario
    if (!usuario || !usuario.roles?.some((rol: string) => rolesPermitidos.includes(rol))) {
      return res.status(403).json({ message: 'No tiene permisos para generar el reporte.' })
    }

    const { anio, mes, dia } = req.query
    const filtro: any = {}

    // Construir filtro de fecha dinámico
    if (anio && mes && dia) {
      const inicio = new Date(Number(anio), Number(mes) - 1, Number(dia))
      const fin = new Date(Number(anio), Number(mes) - 1, Number(dia), 23, 59, 59)
      filtro.fecha = { $gte: inicio, $lte: fin }
    } else if (anio && mes) {
      const inicio = new Date(Number(anio), Number(mes) - 1, 1)
      const fin = new Date(Number(anio), Number(mes), 0, 23, 59, 59)
      filtro.fecha = { $gte: inicio, $lte: fin }
    } else if (anio) {
      filtro.fecha = {
        $gte: new Date(`${anio}-01-01`),
        $lte: new Date(`${anio}-12-31`),
      }
    }

    // Consultar atenciones
    const atenciones = await AtencionMedica.find(filtro)
      .populate('user', 'nombre')
      .populate('medicamentosAdministrados.medicamento', 'nombre_comercial presentacion')
      .lean()


    // Obtener estudiantes relacionados
    const idsEstudiantes = atenciones.map(a => a.estudiante).filter(Boolean)
    const estudiantes = await Estudiante.find({ _id: { $in: idsEstudiantes } })
      .select('nombre appaterno apmaterno gestiones')
      .lean()

    const estudiantesMap = new Map(estudiantes.map(e => [String(e._id), e]))

    // ---------------- Construir cuerpo del reporte ----------------
    const body: any[] = []
    body.push([
      { text: 'Nº', style: 'tableHeader' },
      { text: 'Fecha', style: 'tableHeader' },
      { text: 'Estudiante', style: 'tableHeader' },
      { text: 'Curso', style: 'tableHeader' },
      { text: 'Nivel', style: 'tableHeader' },
      { text: 'Motivo', style: 'tableHeader' },
      { text: 'Diagnóstico', style: 'tableHeader' },
      { text: 'Medicamento', style: 'tableHeader' },
      { text: 'Profesional', style: 'tableHeader' },
    ])

    let contador = 1
    const medicamentosContador: Record<string, number> = {}

    atenciones.forEach(a => {
      const est = estudiantesMap.get(String(a.estudiante))
      const fecha = new Date(a.fecha).toLocaleDateString('es-BO')
      const estudiante = est ? `${est.nombre} ${est.appaterno ?? ''}` : '—'
      const curso = est?.gestiones?.[0]?.curso || '—'
      const nivel = est?.gestiones?.[0]?.nivel || '—'
      const motivo = a.motivo_consulta
      const diagnostico = a.diagnostico

      
      const profesional = (a.user as any)?.nombre || '—'

      // Listado de medicamentos administrados      
      const meds = Array.isArray(a.medicamentosAdministrados)
        ? a.medicamentosAdministrados.map(m => {
            const med = m.medicamento as any
            return med?.nombre_comercial || '—'
          })
        : []

      // Contador de medicamentos
      meds.forEach(nombre => {
        if (nombre) medicamentosContador[nombre] = (medicamentosContador[nombre] || 0) + 1
      })

      body.push([
        contador++,
        fecha,
        estudiante,
        curso,
        nivel,
        motivo,
        diagnostico,
        meds.join(', ') || '—',
        profesional,
      ])
    })

    // Resumen de medicamentos
    const medsBody: any[] = []
    medsBody.push([
      { text: 'Medicamento', style: 'tableHeader' },
      { text: 'Cantidad', style: 'tableHeader' },
    ])
    Object.entries(medicamentosContador).forEach(([nombre, cantidad]) => {
      medsBody.push([nombre, cantidad])
    })

    // ---------------- Definición del documento PDF ----------------
    const docDefinition: any = {
      pageSize: 'LETTER',
      pageMargins: [30, 40, 30, 40],

      content: [
        { text: 'Reporte de Atenciones Médicas', style: 'header' },
        { text: `Generado: ${new Date().toLocaleString('es-BO')}`, style: 'subheader' },
        { text: '\n' },
        { text: 'Lista de Atenciones', style: 'section' },
        {
          table: {
            headerRows: 1,
            
            widths: ['auto', 'auto', 80, 'auto', 'auto', '*', '*', '*', 'auto'],
            body,
          },
          layout: 'lightHorizontalLines',
          fontSize: 8,
        },
        { text: '\n' },
        { text: 'Medicamentos Utilizados', style: 'section' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 60],
            body: medsBody,
          },
          layout: 'lightHorizontalLines',
        },
      ],
      styles: {
        header: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        subheader: { fontSize: 11, italics: true, alignment: 'center', margin: [0, 0, 0, 10] },
        section: { fontSize: 13, bold: true, margin: [0, 10, 0, 5] },
        tableHeader: { bold: true, fillColor: '#eeeeee' },
      },
      defaultStyle: { font: 'Roboto', fontSize: 9 },
    }


    // Generar y enviar PDF
    const pdfDoc = printer.createPdfKitDocument(docDefinition)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=reporte.pdf')
    pdfDoc.pipe(res)
    pdfDoc.end()
  } catch (err) {
    next(err)
  }
}
