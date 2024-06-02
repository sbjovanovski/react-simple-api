import React from 'react'
import { ReactNode } from 'react'

const generateSuccessFetch = (content?: any): void => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, content }),
      text: () => Promise.resolve(JSON.stringify({ success: true, content })),
    }),
  ) as jest.Mock
}

const generateFailedFetch = (): void => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ message: 'Error message' }),
      text: () => Promise.resolve(JSON.stringify({ message: 'Error message' })),
    }),
  ) as jest.Mock
}

const ApiContext = React.createContext({})

const getCache = jest.fn()
const setCache = jest.fn()

const cache = new Map()

const cacheContextWrapper = ({ children }: { children?: ReactNode }) => (
  <ApiContext.Provider value={{ getCache, setCache, cache }}>{children}</ApiContext.Provider>
)

export { cacheContextWrapper, generateSuccessFetch, generateFailedFetch, getCache, setCache, cache }
