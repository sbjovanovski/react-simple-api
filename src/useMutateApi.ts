import { useState } from 'react'
import { UseApiResponse, UseApiParams } from './types'
import { createRequest, normalizeError } from './utils'

interface UseMutateApiResponse<TResponse, TData, TError> extends UseApiResponse<TResponse, TError> {
  mutate: (data: TData) => Promise<void>
}

interface UseMutationApiParams<TResponse, TData, TError>
  extends Omit<UseApiParams<TResponse, TData, TError>, 'data' | 'apiId' | 'cacheExpiry'> {}

const useMutateApi = <TResponse, TData = void, TError = void>({
  apiUrl,
  headers,
  method,
  retry,
  onSuccess,
  onError,
}: UseMutationApiParams<TResponse, TData, TError>): UseMutateApiResponse<TResponse, TData, TError> => {
  let retryTimes: number = retry || 0

  const [state, setState] = useState<UseApiResponse<TResponse, TError>>({
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    isRetrying: false,
  })

  const mutate = async (data: TData): Promise<void> => {
    setState(
      (prevState: UseApiResponse<TResponse, TError>): UseApiResponse<TResponse, TError> => ({
        ...prevState,
        isLoading: true,
      }),
    )
    try {
      const response: Response = await createRequest(apiUrl, {
        method,
        body: JSON.stringify(data),
        headers,
      })
      const responseData = await response.json()
      if (!response.ok) {
        throw responseData
      } else {
        onSuccess?.(responseData)
        setState({
          data: responseData,
          error: null,
          isError: false,
          isLoading: false,
          isRetrying: false,
        })
      }
    } catch (error: unknown | TError) {
      if (retryTimes && retryTimes > 0) {
        retryTimes--
        setState({
          data: undefined,
          error: null,
          isError: false,
          isLoading: true,
          isRetrying: true,
        })
        mutate(data)
      } else {
        const normalError = normalizeError(error)
        onError?.(normalError)
        setState({
          data: undefined,
          error: normalError,
          isLoading: false,
          isError: true,
          isRetrying: false,
        })
      }
    }
  }

  return { ...state, mutate }
}

export { useMutateApi }
