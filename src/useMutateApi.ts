import { useState } from 'react'
import { UseApiResponse, UseApiParams } from './types'
import { createRequest, isObject, normalizeError } from './utils'
import { useApiContext } from './CacheContext'

interface UseMutateApiState<TResponse, TError> extends Omit<UseApiResponse<TResponse, TError>, 'triggerApi'> {}

interface UseMutateApiResponse<TResponse, TData, TError> extends UseMutateApiState<TResponse, TError> {
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
  const { baseApiUrl } = useApiContext()
  let retryTimes: number = retry || 0

  const [state, setState] = useState<UseMutateApiState<TResponse, TError>>({
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    isRetrying: false,
  })

  const finalUrl: string = baseApiUrl ? baseApiUrl + apiUrl : apiUrl

  const mutate = async (data: TData): Promise<void> => {
    const isDataJSONObject = isObject(data)
    let body = data

    if (isDataJSONObject) {
      body = JSON.stringify(data) as TData
    }

    setState(
      (prevState: UseMutateApiState<TResponse, TError>): UseMutateApiState<TResponse, TError> => ({
        ...prevState,
        isLoading: true,
      }),
    )
    try {
      const response: Response = await createRequest({
        apiUrl: finalUrl,
        requestInfo: {
          method,
          body: body as BodyInit,
          headers,
        },
        withContentTypeJSON: isDataJSONObject,
      })
      const responseText: string = await response.text()
      const responseData: TResponse = responseText && responseText.length > 0 ? JSON.parse(responseText) : {}
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
