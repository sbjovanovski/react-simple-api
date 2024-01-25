import { useEffect, useState } from 'react'
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

let interval: ReturnType<typeof setInterval>

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
  manualTrigger,
}: UseApiParams<TResponse, TData, TError>): UseApiResponse<TResponse, TError> => {
  const { getCache, setCache, baseApiUrl } = useApiContext()
  let retryTimes: number = retry || 0

  const [state, setState] = useState<UseApiResponse<TResponse, TError>>({
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    isRetrying: false,
    triggerApi: async (): Promise<void> => {},
  })

  const finalUrl: string = baseApiUrl ? baseApiUrl + apiUrl : apiUrl

  const apiIdentifier: string = apiId || JSON.stringify({ finalUrl, method, data })

  const cachedVsNewData = (
    cachedData: TResponse,
    newResponse: TResponse,
    onSuccess?: (response: TResponse) => void,
  ): void => {
    if (!areObjectsEqual<TResponse>(cachedData, newResponse)) {
      onSuccess?.(newResponse)
      setState({
        data: newResponse,
        error: null,
        isError: false,
        isLoading: false,
        isRetrying: false,
        triggerApi: triggerAPI,
      })
      setCache<TResponse>(apiId, newResponse, cacheExpiry)
    }
  }

  const triggerAPI = async (): Promise<void> => {
    try {
      const cachedResponse: TResponse = getCache<TResponse>(apiIdentifier)
      if (cachedResponse) {
        // return the cached response immediately
        setState({
          data: cachedResponse,
          error: null,
          isError: false,
          isLoading: false,
          isRetrying: false,
          triggerApi: triggerAPI,
          ...(process.env.NODE_ENV !== 'production'
            ? {
                cached: true,
              }
            : {}),
        })

        // get the new data from the API
        const response: Response = await createRequest(finalUrl, {
          method,
          body: JSON.stringify(data),
          headers,
        })
        const responseData = await response.json()
        if (!response.ok) {
          throw responseData
        } else {
          // compare the old cached data vs the new data
          // if the new data is different from the cached data
          // update the cache with the new data and return the new data
          cachedVsNewData(cachedResponse, responseData, onSuccess)
        }
      } else {
        // if cached data doesn't exist, get new data from the API
        const response: Response = await createRequest(finalUrl, {
          method,
          body: JSON.stringify(data),
          headers,
        })
        const responseData = await response.json()
        if (!response.ok) {
          throw responseData
        } else {
          // add the data in the cache and return it
          setState({
            data: responseData,
            error: null,
            isError: false,
            isLoading: false,
            isRetrying: false,
            triggerApi: triggerAPI,
          })
          setCache<TResponse>(apiIdentifier, responseData, cacheExpiry)
          onSuccess?.(responseData)
        }
      }
    } catch (error: unknown | TError) {
      // if retry is specified, trigger the API call again, until retryTimes is 0
      if (retryTimes && retryTimes > 0) {
        retryTimes--
        setState({
          data: undefined,
          error: null,
          isError: false,
          isLoading: true,
          isRetrying: true,
          triggerApi: triggerAPI,
        })
        triggerAPI()
      } else {
        const normalError = normalizeError(error)
        onError?.(normalError)
        setState({
          data: undefined,
          error: normalError,
          isLoading: false,
          isError: true,
          isRetrying: false,
          triggerApi: triggerAPI,
        })
      }
    }
  }

  useEffect(() => {
    if (!manualTrigger) {
      setState({
        data: undefined,
        error: null,
        isError: false,
        isLoading: true,
        isRetrying: false,
        triggerApi: triggerAPI,
      })

      triggerAPI()

      if (pollInterval) {
        interval = setInterval(triggerAPI, pollInterval)
      }
    }

    return () => {
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiId, pollInterval])

  return state
}

export { useApi }
