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
  triggerApi: () => Promise<void>
}

interface UseApiParams<TResponse, TData, TError> {
  apiId: string
  apiUrl: string
  method: APIMethod
  data?: TData
  headers?: Record<string, string>
  cacheExpiry?: number
  retry?: number
  onSuccess?: (response: TResponse) => void
  onError?: (error: TError) => void
  pollInterval?: number
  /**
   * @deprecated Use `enabled` instead
   */
  manualTrigger?: boolean
  enabled?: boolean
}

export { APIMethod, UseApiResponse, UseApiParams }
