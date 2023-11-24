import {useEffect, useState} from 'react'
import {useApiContext, ApiContextProvider} from "./CacheContext";

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
    apiId: string,
    apiUrl: string,
    method: Method,
    data?: TData,
    headers?: HeadersInit,
): UseApiResponse<TResponse> => {
    const {getCache, setCache} = useApiContext()

    const [state, setState] = useState<UseApiResponse<TResponse>>({
        data: undefined,
        error: null,
        isError: false,
        isLoading: true,
    })

    apiId = apiId || JSON.stringify({apiUrl, method, data})

    const triggerAPI = async () => {
        try {
            const response = await fetch(apiUrl, {
                method,
                body: JSON.stringify(data),
                headers
            })
            const cachedResponse = getCache<TResponse>(apiId)
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
                setCache<TResponse>(apiId, responseData)
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

export {useApi, Method, ApiContextProvider}