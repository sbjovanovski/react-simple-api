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
}: UseApiParams<TResponse, TData, TError>): UseApiResponse<TResponse, TError> => {
  const { getCache, setCache } = useApiContext()
  let retryTimes: number = retry || 0

  const [state, setState] = useState<UseApiResponse<TResponse, TError>>({
    data: undefined,
    error: null,
    isError: false,
    isLoading: true,
    isRetrying: false,
  })

  const apiIdentifier: string = apiId || JSON.stringify({ apiUrl, method, data })

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
        })

        // get the new data from the API
        const response: Response = await createRequest(apiUrl, {
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
        const response: Response = await createRequest(apiUrl, {
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
          })
          setCache<TResponse>(apiIdentifier, responseData, cacheExpiry)
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
        })
      }
    }
  }

  useEffect(() => {
    setState({
      data: undefined,
      error: null,
      isError: false,
      isLoading: true,
      isRetrying: false,
    })
    triggerAPI()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiId])

  return state
}

export { useApi }
