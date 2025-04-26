import { renderHook, waitFor } from '@testing-library/react'
import { cache, cacheContextWrapper, generateFailedFetch, generateSuccessFetch, getCache, setCache } from './mocks'
import { useApi } from '../useApi'
import { APIMethod, UseApiParams, UseApiResponse } from '../types'
import clearAllMocks = jest.clearAllMocks

interface SuccessResponse {
  success: boolean
  content?: any
}

interface MockedApiResponse<T> extends UseApiResponse<T> {
  cached?: boolean
}

jest.mock('../CacheContext.tsx', () => ({
  useApiContext: () => ({
    getCache,
    setCache,
  }),
}))

describe('Fetch Success', () => {
  beforeEach(() => {
    clearAllMocks()
  })
  it('should fetch data and store it to cache successfully', async () => {
    generateSuccessFetch()

    const apiParams: UseApiParams<SuccessResponse, any, any> = {
      apiId: 'test',
      apiUrl: 'example.com/api',
      method: APIMethod.GET,
    }

    const { result } = renderHook<MockedApiResponse<SuccessResponse>, UseApiParams<SuccessResponse, any, any>>(
      () => useApi<SuccessResponse, any, any>(apiParams),
      {
        wrapper: cacheContextWrapper,
      },
    )

    expect(getCache).toHaveBeenCalledWith(apiParams.apiId)
    expect(getCache).toHaveBeenCalledTimes(1)
    expect(cache.has(apiParams.apiId)).toBe(false)
    await waitFor(() => {
      expect(result?.current?.data?.success).toBe(true)
      expect(result.current?.cached).toBe(undefined)
    })
    expect(setCache).toHaveBeenCalledWith(apiParams.apiId, { success: true }, undefined)
    expect(setCache).toHaveBeenCalledTimes(1)
  })
})

it('should try to fetch API for 5 times before it throws an error', async () => {
  generateFailedFetch()
  const INITIAL_CALL = 1
  const RETRY_CALLS = 4
  const spyOnFetch = jest.spyOn(global, 'fetch')
  const apiParams: UseApiParams<SuccessResponse, any, any> = {
    apiId: 'test',
    apiUrl: 'example.com/api',
    method: APIMethod.GET,
    retry: RETRY_CALLS,
  }

  const { result } = renderHook<MockedApiResponse<SuccessResponse>, UseApiParams<SuccessResponse, any, any>>(
    () => useApi<SuccessResponse, any, any>(apiParams),
    {
      wrapper: cacheContextWrapper,
    },
  )
  await waitFor(() => {
    expect(spyOnFetch).toHaveBeenCalledTimes(INITIAL_CALL + RETRY_CALLS)
    expect(result.current.error).toEqual({ message: 'Error message' })
  })
})
