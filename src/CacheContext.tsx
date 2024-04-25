import React, { Context, createContext, ReactNode, useContext } from 'react'
import { ApiCache } from './cache'

interface ApiCacheContextData {
  getCache<T>(id: string): T

  setCache<T>(id: string, data: T, cacheExpiry?: number): T

  baseApiUrl?: string
}

const ApiCacheContext: Context<ApiCacheContextData> = createContext<ApiCacheContextData>({
  getCache: (id: string): any => id,
  setCache: (_id: string, data: any) => data,
})

const ApiContextProvider = ({ children, baseApiUrl }: { children: ReactNode; baseApiUrl?: string }) => {
  const cache = ApiCache.getInstance()

  const handleSetCache = (id: string, data: any, cacheExpiry?: number) => {
    cache.setCachedResponse(id, data, cacheExpiry)
    return data
  }

  const handleGetCache = (id: string) => {
    return cache.getCachedResponse(id) as any
  }

  return (
    <ApiCacheContext.Provider value={{ getCache: handleGetCache, setCache: handleSetCache, baseApiUrl }}>
      {children}
    </ApiCacheContext.Provider>
  )
}

const useApiContext = () => useContext(ApiCacheContext)

export { ApiContextProvider, ApiCacheContext, useApiContext }
