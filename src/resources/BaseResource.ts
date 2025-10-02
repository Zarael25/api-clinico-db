/**
 * Descripción:
 *   Clase genérica BaseResource que sirve como base para los recursos (resources)
 *   encargados de transformar entidades de la base de datos en respuestas JSON
 *   estandarizadas. Facilita la conversión de una entidad, colecciones o
 *   resultados paginados.
 *
 * Características:
 *   - Lanza error si la entidad (instance) no existe.
 *   - Define un método item() que debe implementarse en las subclases para
 *     especificar cómo se transforma la entidad en un recurso.
 *   - Ofrece métodos estáticos para:
 *       • collection() → transformar arrays de entidades.
 *       • paged() → transformar resultados paginados.
 *   - Utiliza ApiError para manejo de errores consistentes.
 *
 * Uso:
 *   class UsuarioResource extends BaseResource<UsuarioDocument, UsuarioDTO>() {
 *     public item() {
 *       return {
 *         id: this.instance._id,
 *         nombre: this.instance.nombre,
 *         email: this.instance.email,
 *       }
 *     }
 *   }
 *
 *   // Ejemplos:
 *   new UsuarioResource(usuario).item()
 *   UsuarioResource.collection(listaUsuarios)
 *   UsuarioResource.paged(paginacionUsuarios)
 */

import ApiError from '../errors/ApiError'

import type { PaginationResult } from '../types'

function BaseResource<A, E>() {
  return class Resource {
    public instance: A
    public constructor(instance: A | null) {
      // Si no existe la entidad, lanzar error 404
      if (!instance) {
        throw new ApiError({
          name: 'NOT_FOUND_ERROR',
          message: 'Entity not found',
          status: 404,
          code: 'ERR_NF',
        })
      }
      this.instance = instance
    }


    
    //Transformar una entidad en un objeto de respuesta
    //(Debe ser implementado en las subclases)
    public item(): E {
      throw new ApiError({
        name: 'METHOD_NOT_IMPLEMENTED',
        message: 'Method item() must be implemented in resource entity class',
        status: 400,
        code: 'NOT_IMPL',
      })
    }

    //Transformar un arreglo de entidades en una colección de recursos
    public static collection(entities: Array<A>): Array<E> | undefined {
      if (!entities) {
        return
      }
      return entities.map(instance => {
        const resource = new this(instance)
        return resource.item()
      })
    }

    //Transformar un resultado paginado de entidades en un recurso paginado
    public static paged(
      paginatedResult: PaginationResult<A>,
    ): PaginationResult<E> | undefined {
      if (!paginatedResult || !paginatedResult.docs) {
        return
      }

      const {
        docs,
        totalDocs,
        limit,
        totalPages,
        page,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
      } = paginatedResult

      //Transformar los documentos de la página actual
      const paginatedDocs = docs.map(instance => {
        const resource = new this(instance)
        return resource.item()
      })

      
      return {
        docs: paginatedDocs,
        totalDocs,
        limit,
        totalPages,
        page,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
      }
    }
  }
}

export default BaseResource
