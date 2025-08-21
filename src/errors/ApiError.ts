import BaseError from './BaseError'

import type { ErrorName, ErrorCode } from '../types'

class ApiError extends BaseError<ErrorName, ErrorCode> {}
export default ApiError
