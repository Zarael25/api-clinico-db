// routes/v1/atencionMedica/controller.ts
import { Request, Response, NextFunction } from 'express'
import AtencionMedica from '../../../database/models/AtencionMedica'
import Estudiante from '../../../database/models/Estudiante'
import PdfPrinter from 'pdfmake'
import path from 'path'

// 📌 Crear una nueva atención médica
export const createAtencionMedica = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 🔐 Usuario autenticado
    const user = req.user as any
    const userId = user?._id
    const roles = user?.roles || []

    // 🚫 Validar roles permitidos
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

    const { estudiante, motivo_consulta, diagnostico, tratamiento, sugerir_baja, medicamentosAdministrados } = req.body

    // Crear atención médica
    const nuevaAtencion = await AtencionMedica.create({
      estudiante,
      user: userId, // siempre viene del token
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





// 📌 Listar atenciones de un estudiante
export const getAtencionesByEstudiante = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { estudianteId } = req.params

    const atenciones = await AtencionMedica.find({ estudiante: estudianteId })
      .populate('user', 'nombre correo') // solo campos básicos del profesional
      .populate('medicamentosAdministrados.medicamento', 'nombre_comercial presentacion')
      .sort({ fecha: -1 }) // más recientes primero

    res.json(atenciones)
  } catch (err) {
    next(err)
  }
}

// 📌 Obtener detalle de una atención por ID (solo admin y enfermeria)
export const getAtencionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any
    const roles = user?.roles || []

    // 🚫 Validar roles permitidos
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



export const getAtencionesByFecha = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fecha } = req.query

    if (!fecha) {
      return res.status(400).json({ message: 'Debe enviar una fecha en formato YYYY-MM-DD' })
    }

    const inicio = new Date(`${fecha}T00:00:00.000Z`)
    const fin = new Date(`${fecha}T23:59:59.999Z`)

    // Traigo las atenciones (sin populate de estudiante porque está en otra DB)
    const atenciones = await AtencionMedica.find({
      fecha: { $gte: inicio, $lte: fin }
    })
      .populate('user', 'nombre correo')
      .populate('medicamentosAdministrados.medicamento', 'nombre_comercial presentacion')
      .lean() // 👈 convierte a objetos planos
      .exec()

    // Extraigo los IDs de estudiantes
    const idsEstudiantes = atenciones.map(a => a.estudiante).filter(Boolean)

    // Consulto estudiantes en su propia conexión
    const estudiantes = await Estudiante.find({ _id: { $in: idsEstudiantes } })
      .select('nombre appaterno apmaterno carnet rude tutores gestiones')
      .lean()

    // Combino estudiantes con sus atenciones
    const estudiantesMap = new Map(estudiantes.map(e => [String(e._id), e]))

    const resultado = atenciones.map(a => ({
      ...a,
      estudiante: estudiantesMap.get(String(a.estudiante)) || null
    }))

    res.json(resultado)
  } catch (err) {
    next(err)
  }
}


// Configuración de fuentes para pdfmake
const fonts = {
  Roboto: {
    normal: path.resolve(__dirname, '../../../fonts/Roboto-Regular.ttf'),
    bold: path.resolve(__dirname, '../../../fonts/Roboto-Medium.ttf'),
    italics: path.resolve(__dirname, '../../../fonts/Roboto-Italic.ttf'),
    bolditalics: path.resolve(__dirname, '../../../fonts/Roboto-MediumItalic.ttf'),
  },
}

const printer = new PdfPrinter(fonts)

// 📌 Generar reporte PDF de atenciones
export const generarReportePDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { anio, mes, dia } = req.query

    // 🎯 Construyo el filtro dinámico
    const filtro: any = {}
    if (anio && mes && dia) {
      const inicio = new Date(Number(anio), Number(mes) - 1, Number(dia))
      const fin = new Date(Number(anio), Number(mes) - 1, Number(dia), 23, 59, 59)
      filtro.fecha = { $gte: inicio, $lte: fin }
    } else if (anio && mes) {
      const inicio = new Date(Number(anio), Number(mes) - 1, 1)
      const fin = new Date(Number(anio), Number(mes), 0, 23, 59, 59)
      filtro.fecha = { $gte: inicio, $lte: fin }
    } else if (anio) {
      filtro.fecha = { $gte: new Date(`${anio}-01-01`), $lte: new Date(`${anio}-12-31`) }
    }

    // 🔎 Busco atenciones
    const atenciones = await AtencionMedica.find(filtro)
      .populate('user', 'nombre')
      .populate('medicamentosAdministrados.medicamento', 'nombre_comercial presentacion')
      .lean()

    // Estudiantes
    const idsEstudiantes = atenciones.map(a => a.estudiante).filter(Boolean)
    const estudiantes = await Estudiante.find({ _id: { $in: idsEstudiantes } })
      .select('nombre appaterno apmaterno gestiones')
      .lean()

    const estudiantesMap = new Map(estudiantes.map(e => [String(e._id), e]))

    // 📄 Tabla principal
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

      // 👇 cast rápido para user
      const profesional = (a.user as any)?.nombre || '—'

      // 👇 cast rápido para medicamentos
      const meds = Array.isArray(a.medicamentosAdministrados)
        ? a.medicamentosAdministrados.map(m => {
            const med = m.medicamento as any
            return med?.nombre_comercial || '—'
          })
        : []

      // Contar medicamentos
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

    // 📊 Resumen de medicamentos
    const medsBody: any[] = []
    medsBody.push([
      { text: 'Medicamento', style: 'tableHeader' },
      { text: 'Cantidad', style: 'tableHeader' },
    ])
    Object.entries(medicamentosContador).forEach(([nombre, cantidad]) => {
      medsBody.push([nombre, cantidad])
    })

    // 📄 Definición del documento
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
            // 👇 combinamos auto + flexibles
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
      defaultStyle: { font: 'Roboto', fontSize: 9 }, // 👈 tamaño chico
    }


    // Enviar PDF
    const pdfDoc = printer.createPdfKitDocument(docDefinition)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=reporte.pdf')
    pdfDoc.pipe(res)
    pdfDoc.end()
  } catch (err) {
    next(err)
  }
}
