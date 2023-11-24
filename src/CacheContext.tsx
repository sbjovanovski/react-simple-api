import React, {createContext, ReactNode, useContext} from "react";
import {ApiCache} from './cache'

interface ApiCacheContextData {
    getCache: <T extends any>(id: string) => T
    setCache: <T extends any>(id: string, data: T) => T
}

const ApiCacheContext = createContext<ApiCacheContextData>({
    getCache: <T extends any>(_id: string): T => ({} as T),
    setCache: <T extends any>(_id: string, data: T): T => data
})

const ApiContextProvider = ({children}: { children: ReactNode }) => {
    const cache = new ApiCache()

    const handleSetCache = <T extends any>(id: string, data: T): T => {
        cache.setCachedResponse(id, data)
        return data
    }

    const handleGetCache = <T extends any>(id: string): T => {
        return cache.getCachedResponse(id) as T
    }

    return (
        <ApiCacheContext.Provider value={{getCache: handleGetCache, setCache: handleSetCache}}>
            {children}
        </ApiCacheContext.Provider>
    )
}

const useApiContext = () => useContext(ApiCacheContext)

export {ApiContextProvider, ApiCacheContext, useApiContext}