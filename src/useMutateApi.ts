import { useState } from 'react'
import { UseApiResponse, UseApiParams } from './types'
import { createRequest } from './utils'

interface UseMutateApiResponse<TResponse, TError> extends UseApiResponse<TResponse, TError> {
  mutate: <TData>(data: TData) => Promise<void>
}

interface UseMutationApiParams<TResponse> extends Omit<UseApiParams<any>, 'data' | 'apiId' | 'cacheExpiry'> {
  onSuccess?: (response: TResponse) => void
}

const useMutateApi = <TResponse, TError = void>({
  apiUrl,
  headers,
  method,
  retry,
  onSuccess,
}: UseMutationApiParams<TResponse>): UseMutateApiResponse<TResponse, TError> => {
  let retryTimes: number = retry || 0

  const [state, setState] = useState<UseApiResponse<TResponse, TError>>({
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    isRetrying: false,
  })

  const mutate = async <TData>(data: TData): Promise<void> => {
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
      onSuccess?.(responseData)
      setState({
        data: responseData,
        error: null,
        isError: false,
        isLoading: false,
        isRetrying: false,
      })
    } catch (error: unknown) {
      if (retryTimes && retryTimes > 0) {
        retryTimes--
        setState({
          data: undefined,
          error: null,
          isError: false,
          isLoading: true,
          isRetrying: true,
        })
        mutate<TData>(data)
      } else {
        setState({
          data: undefined,
          error: error as TError,
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
