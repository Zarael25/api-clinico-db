// Types for Errors
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

export type ValidationError = {
  error: {
    name: string
    message: string
    code: ErrorCode
    errors: Array<{ message: string }>
  }
  code_response: number
}

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
