enum Method {
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
  method: Method
  data?: TData
  headers?: Record<string, string>
  cacheExpiry?: number
  retry?: number
}

export { Method, UseApiResponse, UseApiParams }
