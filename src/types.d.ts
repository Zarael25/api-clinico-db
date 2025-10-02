/**
 * Descripción:
 *   Tipos TypeScript globales para manejo de errores y paginación.
 *   Incluyen la enumeración de nombres y códigos de error estandarizados,
 *   además de interfaces para validar resultados paginados y errores de validación.
 *
 * Características:
 *   - ErrorName: catálogo de nombres de error semánticos (ej: UNAUTHORIZED_ERROR).
 *   - ErrorCode: catálogo de códigos cortos asociados a cada error (ej: ERR_UNAUTH).
 *   - ValidationError: estructura uniforme para devolver errores de validación de datos.
 *   - PagedParams: define los parámetros opcionales para consultas paginadas.
 *   - PaginationResult<T>: tipado genérico para devolver resultados con metadatos de paginación.
 *
 * Uso:
 *   - throw new ApiError({ name: 'NOT_FOUND_ERROR', code: 'ERR_NF', ... })
 *   - const params: PagedParams = { limit: 20, page: 2, sortBy: 'createdAt-desc' }
 *   - const result: PaginationResult<User> = await repo.getPaged(params)
 */

// ---------------- Tipos para Errores ----------------
export type ErrorName =
  | 'CONFIGURATION_ERROR'
  | 'MODEL_NOT_FOUND_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'CONNECTION_ERROR'
  | 'METHOD_NOT_IMPLEMENTED'
  | 'FILTER_BY_ERROR'
  | 'REFERENCE_ERROR'
  | 'VALIDATION_ERROR'
  | 'INVALID_DATA_ERROR'
  | 'STATIONS_NOT_IN_ROUTE'
  | 'UNAUTHORIZED_ERROR'
  | 'NO_TOKEN_PROVIDED'
  | 'TOKEN_EXPIRED_ERROR'
  | 'FORBIDDEN_ERROR'
  | 'LOCKED_USER'  

export type ErrorCode =
  | 'ERR_CFG'
  | 'ERR_MNF'
  | 'ERR_NF'
  | 'ERR_REMOTE'
  | 'NOT_IMPL'
  | 'ERR_FTB'
  | 'ERR_REF'
  | 'ERR_VALID'
  | 'ERR_INV'
  | 'ERR_SNR'
  | 'ERR_UNAUTH'
  | 'ERR_NT'
  | 'ERR_TE'
  | 'ERR_FORB'
  | 'ERR_LOCKED'


// ---------------- Error de Validación ----------------
export type ValidationError = {
  error: {
    name: string
    message: string
    code: ErrorCode
    errors: Array<{ message: string }>
  }
  code_response: number
}

// ---------------- Tipos de Paginación ----------------
export interface PagedParams {
  limit?: number
  page?: number
  sortBy?: string
  filterBy?: string
}

export interface PaginationResult<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}
