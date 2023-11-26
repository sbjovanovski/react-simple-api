import { useState } from 'react'
import { UseApiResponse, UseApiParams } from './types'
import { areObjectsEqual, createRequest } from './utils'
import { useApiContext } from './CacheContext'

interface UseMutateApiResponse<T> extends UseApiResponse<T> {
  mutate: <TData>(data: TData) => Promise<void>
}

interface UseMutationApiParams<TResponse> extends Omit<UseApiParams<any>, 'data'> {
  onSuccess: (response: TResponse) => void
}

const useMutateApi = <TResponse>({
  apiId,
  apiUrl,
  headers,
  method,
  cacheExpiry,
  retry,
  onSuccess,
}: UseMutationApiParams<TResponse>): UseMutateApiResponse<TResponse> => {
  const { getCache, setCache } = useApiContext()
  let retryTimes: number = retry || 0

  const [state, setState] = useState<UseApiResponse<TResponse>>({
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    isRetrying: false,
  })

  const apiIdentifier: string = apiId || JSON.stringify({ apiUrl, method })

  const cachedVsNewData = (
    cachedData: TResponse,
    response: Response,
    onSuccess: (responseData: TResponse) => void,
  ): void => {
    response.json().then((newData: TResponse): void => {
      if (!areObjectsEqual<TResponse>(cachedData, newData)) {
        setState({
          data: newData,
          error: null,
          isError: false,
          isLoading: false,
          isRetrying: false,
        })
        onSuccess(newData)
      }
    })
  }

  const mutate = async <TData>(data: TData): Promise<void> => {
    try {
      const cachedResponse: TResponse = getCache<TResponse>(apiIdentifier)
      if (cachedResponse) {
        setState({
          data: cachedResponse,
          error: null,
          isError: false,
          isLoading: false,
          isRetrying: false,
        })
        onSuccess(cachedResponse)
        const response: Response = await createRequest(apiUrl, {
          method,
          body: JSON.stringify(data),
          headers,
        })
        cachedVsNewData(cachedResponse, response, onSuccess)
      } else {
        const response: Response = await createRequest(apiUrl, {
          method,
          body: JSON.stringify(data),
          headers,
        })
        const responseData = await response.json()
        setState({
          data: responseData,
          error: null,
          isError: false,
          isLoading: false,
          isRetrying: false,
        })
        setCache<TResponse>(apiIdentifier, responseData, cacheExpiry)
        onSuccess(responseData)
      }
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
          error: error as Error,
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
