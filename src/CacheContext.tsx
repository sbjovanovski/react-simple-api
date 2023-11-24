import React, { createContext, ReactNode, useContext } from 'react'
import { ApiCache } from './cache'

interface ApiCacheContextData {
  getCache<T>(id: string): T
  setCache<T>(id: string, data: T): T
}

const ApiCacheContext = createContext<ApiCacheContextData>({
  getCache: (_id: string): any => _id,
  setCache: (_id: string, data: any) => data,
})

const ApiContextProvider = ({ children }: { children: ReactNode }) => {
  const cache = new ApiCache()

  const handleSetCache = (id: string, data: any) => {
    cache.setCachedResponse(id, data)
    return data
  }

  const handleGetCache = (id: string) => {
    return cache.getCachedResponse(id) as any
  }

  return (
    <ApiCacheContext.Provider value={{ getCache: handleGetCache, setCache: handleSetCache }}>
      {children}
    </ApiCacheContext.Provider>
  )
}

const useApiContext = () => useContext(ApiCacheContext)

export { ApiContextProvider, ApiCacheContext, useApiContext }
