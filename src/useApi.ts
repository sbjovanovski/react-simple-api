import { useCallback, useEffect, useState } from 'react'
import { useApiContext } from './CacheContext'
import { areObjectsEqual, createRequest, normalizeError } from './utils'
import { UseApiResponse, UseApiParams } from './types'

/*
Usage:
GET
const {data, isLoading, isError, error} = useApi<ResponseType, PostDataType>({
    apiId: 'some-api'
    apiUrl: 'https://api.example.com',
    method: Method.GET
})

POST, PUT, PATCH
const {data, isLoading, isError, error} = useApi<ResponseType, PostDataType>({
    apiId: 'some-api'
    apiUrl: 'https://api.example.com',
    method: Method.POST,
    data: {firstName: "Test"}
})
 */

const useApi = <TResponse, TData = void, TError = void>({
  apiId,
  apiUrl,
  method,
  data,
  headers = {},
  cacheExpiry,
  retry,
  onSuccess,
  onError,
  pollInterval,
  enabled = true,
}: UseApiParams<TResponse, TData, TError>): UseApiResponse<TResponse, TError> => {
  const { getCache, setCache, baseApiUrl } = useApiContext()
  let retryTimes: number = retry || 0

  const [state, setState] = useState<Omit<UseApiResponse<TResponse, TError>, 'triggerApi'>>({
    data: undefined,
    error: null,
    isError: false,
    isLoading: true,
    isRetrying: false,
  })

  const finalUrl: string = baseApiUrl ? baseApiUrl + apiUrl : apiUrl

  const apiIdentifier: string = apiId ?? JSON.stringify({ finalUrl, method, data })

  const isCacheOutdated = (cachedData: TResponse, newResponseData: TResponse): boolean => {
    return !areObjectsEqual<TResponse>(cachedData, newResponseData)
  }

  const triggerAPI = useCallback(async (): Promise<void> => {
    try {
      // check if there is cached response
      const cachedResponse: TResponse = getCache<TResponse>(apiIdentifier)
      if (cachedResponse) {
        // return the cached response immediately
        setState((prevState) => ({
          ...prevState,
          data: cachedResponse,
          error: null,
          isError: false,
          isLoading: false,
          isRetrying: false,
          ...(process.env.NODE_ENV !== 'production'
            ? {
                cached: true,
              }
            : {}),
        }))
      }

      // get the new data from the API
      const response: Response = await createRequest({
        apiUrl: finalUrl,
        requestInfo: {
          method,
          body: JSON.stringify(data),
          headers,
        },
      })
      const responseText: string = await response.text()
      const responseData: TResponse = responseText && responseText.length > 0 ? JSON.parse(responseText) : {}

      // if API fails, throw error
      if (!response.ok) {
        throw responseData
      }

      // compare the old cached data vs the new data
      // if the cached data is old, replace it with the new response data
      onSuccess?.(responseData)
      if (isCacheOutdated(cachedResponse, responseData)) {
        setState((prevState) => ({
          ...prevState,
          data: responseData,
          error: null,
          isError: false,
          isLoading: false,
          isRetrying: false,
        }))
        setCache<TResponse>(apiIdentifier, responseData, cacheExpiry)
      }
    } catch (error: unknown | TError) {
      // if retry is specified, trigger the API call again, until retryTimes is 0
      if (retryTimes && retryTimes > 0) {
        retryTimes--
        setState((prevState) => ({
          ...prevState,
          data: undefined,
          error: null,
          isError: false,
          isLoading: true,
          isRetrying: true,
        }))
        triggerAPI()
      } else {
        const normalError = normalizeError(error)
        onError?.(normalError)
        setState((prevState) => ({
          ...prevState,
          data: undefined,
          error: normalError,
          isLoading: false,
          isError: true,
          isRetrying: false,
        }))
      }
    }
  }, [enabled, apiIdentifier])

  useEffect(() => {
    if (enabled) {
      triggerAPI()
    }
  }, [apiIdentifier, enabled, triggerAPI])

  useEffect(() => {
    if (pollInterval && pollInterval > 0 && enabled) {
      const interval = setInterval(triggerAPI, pollInterval)
      return () => clearInterval(interval)
    }
    return
  }, [pollInterval, enabled, triggerAPI])

  const refetchAPI = useCallback(() => {
    triggerAPI()
  }, [triggerAPI])

  return { ...state, triggerApi: refetchAPI }
}

export { useApi }
