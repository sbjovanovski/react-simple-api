import { useEffect, useState } from 'react'
import { ApiCache } from './cache'

/*
Usage:
GET
const {data, isLoading, isError, error} = useApi<ResponseType, BodyType>('https://api.example.com', Method.GET)

POST, PUT, PATCH
const {data, isLoading, isError, error} = useApi<ResponseType, BodyType>('https://api.example.com', Method.POST, {firstName: "Test"})
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
  error: Error | null
}

const useApi = <TResponse, TData>(
  apiUrl: string,
  method: Method,
  body?: BodyInit & TData,
  headers?: HeadersInit,
): UseApiResponse<TResponse> => {
  const cache = new ApiCache<TResponse>()

  const [state, setState] = useState<UseApiResponse<TResponse>>({
    data: undefined,
    error: null,
    isError: false,
    isLoading: true,
  })

  const triggerAPI = async () => {
    try {
      const response = await fetch(apiUrl, {
        method,
        body,
        headers,
      })
      const cachedResponse = cache.getCachedResponse(response)
      if (cachedResponse) {
        setState({
          data: cachedResponse,
          error: null,
          isError: false,
          isLoading: false,
        })
      } else {
        const responseData = await response.json()
        setState({
          data: responseData,
          error: null,
          isError: false,
          isLoading: false,
        })
        cache.setCachedResponse(response, responseData)
      }
    } catch (error: unknown) {
      setState({
        data: undefined,
        error: error as Error,
        isLoading: false,
        isError: true,
      })
    }
  }

  useEffect(() => {
    triggerAPI()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}

export { useApi, Method }
