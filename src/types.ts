enum APIMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

interface UseApiResponse<T> {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  isRetrying: boolean
  error: Error | null
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
