enum APIMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

interface UseApiResponse<T, TError = void> {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  isRetrying: boolean
  error: TError | null
}

interface UseApiParams<TData> {
  apiId: string
  apiUrl: string
  method: APIMethod
  data?: TData
  headers?: Record<string, string>
  cacheExpiry?: number
  retry?: number
}

export { APIMethod, UseApiResponse, UseApiParams }
