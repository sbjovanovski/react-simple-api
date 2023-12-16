import { renderHook, waitFor } from '@testing-library/react'
import { cacheContextWrapper, generateSuccessFetch, setCache } from './mocks'
import { useApi } from '../useApi'
import { APIMethod, UseApiParams, UseApiResponse } from '../types'
import clearAllMocks = jest.clearAllMocks
import * as cacheContext from '../CacheContext'

interface SuccessResponse {
  success: boolean
  content?: any
}

interface MockedApiResponse<T> extends UseApiResponse<T> {
  cached?: boolean
}

const getCache = jest.fn(() => ({ success: true }))

jest.mock('../CacheContext.tsx', () => ({
  useApiContext: () => ({
    getCache,
    setCache,
  }),
}))

it('should not trigger an API call if `manualTrigger` is true', () => {
  generateSuccessFetch()
  const spyOnFetch = jest.spyOn(global, 'fetch')
  const apiParams: UseApiParams<SuccessResponse, any, any> = {
    apiId: 'test',
    apiUrl: 'example.com/api',
    method: APIMethod.GET,
    manualTrigger: true,
  }

  renderHook<MockedApiResponse<SuccessResponse>, UseApiParams<SuccessResponse, any, any>>(
    () => useApi<SuccessResponse, any, any>(apiParams),
    {
      wrapper: cacheContextWrapper,
    },
  )

  expect(spyOnFetch).not.toHaveBeenCalled()
})

describe('Fetch Success', () => {
  beforeEach(() => {
    clearAllMocks()
  })

  it('should retrieve data from cache', async () => {
    generateSuccessFetch()

    const apiParams: UseApiParams<SuccessResponse, any, any> = {
      apiId: 'test',
      apiUrl: 'example.com/api',
      method: APIMethod.GET,
    }

    // retrieve from cache
    const { result } = renderHook<MockedApiResponse<SuccessResponse>, UseApiParams<SuccessResponse, any, any>>(
      () => useApi<SuccessResponse, any, any>(apiParams),
      {
        wrapper: cacheContextWrapper,
      },
    )

    await waitFor(() => {
      expect(result?.current?.data?.success).toBe(true)
      expect(result.current?.cached).toBe(true)
      expect(setCache).not.toHaveBeenCalled()
    })
  })

  it('should return new data from API when network response is different from cached response', async () => {
    const spyOnGetCache = jest.spyOn(cacheContext.useApiContext(), 'getCache')
    const content = { firstName: 'Test', lastName: 'Example' }
    generateSuccessFetch(content)

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

    expect(spyOnGetCache).toHaveBeenCalledWith(apiParams.apiId)

    // initially returns cached data
    // content is undefined since it doesn't exist in the cache
    expect(result.current.cached).toBe(true)
    expect(result.current.data?.content).toBe(undefined)

    await waitFor(() => {
      // after comparing cache data vs network data
      // the cached value is undefined
      // the new data is returned, including the content
      expect(result.current?.data?.content).toEqual(content)
      expect(result.current.cached).toBe(undefined)
      expect(setCache).toHaveBeenCalledWith(apiParams.apiId, { success: true, content }, undefined)
    })
  })
})
