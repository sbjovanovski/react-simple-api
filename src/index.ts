import { useEffect, useState } from 'react'
import { useApiContext, ApiContextProvider } from './CacheContext'
import { areObjectsEqual, generateRequestHeaders } from './utils'

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

enum Method {
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
  method: Method
  data?: TData
  headers?: Record<string, string>
  cacheExpiry?: number
  retry?: number
}

const useApi = <TResponse, TData>({
  apiId,
  apiUrl,
  method,
  data,
  headers,
  cacheExpiry,
  retry,
}: UseApiParams<TData>): UseApiResponse<TResponse> => {
  const { getCache, setCache } = useApiContext()
  let retryTimes: number = retry || 0

  const [state, setState] = useState<UseApiResponse<TResponse>>({
    data: undefined,
    error: null,
    isError: false,
    isLoading: true,
    isRetrying: false,
  })

  const apiIdentifier: string = apiId || JSON.stringify({ apiUrl, method, data })

  const requestHeaders = generateRequestHeaders(headers)

  const cachedVsNewData = (cachedData: TResponse, response: Response): void => {
    response.json().then((newData: TResponse): void => {
      if (!areObjectsEqual<TResponse>(cachedData, newData)) {
        setState({
          data: newData,
          error: null,
          isError: false,
          isLoading: false,
          isRetrying: false,
        })
      }
    })
  }

  const triggerAPI = async (): Promise<void> => {
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
        const response: Response = await fetch(apiUrl, {
          method,
          body: JSON.stringify(data),
          headers: requestHeaders,
        })
        cachedVsNewData(cachedResponse, response)
      } else {
        const response: Response = await fetch(apiUrl, {
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
        triggerAPI()
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

export { useApi, Method, ApiContextProvider, UseApiParams }
