import { useApi } from './useApi'
import { useState } from 'react'
import { UseApiResponse, UseApiParams } from './types'

interface UseMutateApiResponse<T> extends UseApiResponse<T> {
  mutate: () => void
}

const useMutateApi = <TResponse, TData>(apiParams: UseApiParams<TData>): UseMutateApiResponse<TResponse> => {
  const [state, setState] = useState<UseApiResponse<TResponse>>({
    data: undefined,
    error: null,
    isError: false,
    isLoading: true,
    isRetrying: false,
  })

  const Mutate = () => {
    const state: UseApiResponse<TResponse> = useApi<TResponse, TData>(apiParams)
    setState(state)
  }

  return { ...state, mutate: Mutate }
}

export { useMutateApi }
