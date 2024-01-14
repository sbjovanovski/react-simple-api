# react-simple-api

Query and cache API data

### Install

```
npm install react-simple-api
```

or

```
yarn add react-simple-api
```

### Usage

In the index.tsx

```
import { ApiContextProvider } from 'react-simple-api'
import { App } from './App

ReactDOM.render(
    <React.StrictMode>
        <ApiContextProvider>
            <App/>
        </ApiContextProvider>
    </React.StrictMode>,
    document.getElementById('root')
)
```

Query data

```
import { useApi, APIMethod } from 'react-simple-api'

interface Cat {
    type: string
    user: string
}

const {
        data,
        isLoading,
        isRetrying
        isError,
        error
    } = useApi<Cat[], {}>({
        apiId: 'cat-api', 
        apiUrl: 'https://cat-fact.herokuapp.com/facts', 
        method: APIMethod.GET,
        retry: 4
    })
```

### Types

```
enum APIMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

useApi = <TResponse, TData>({
  apiId: string // cache identifier,
  apiUrl: string,
  method: APIMethod,
  data?: TData,
  headers?: Record<string, string>
  cacheExpiry?: number // cache expiry in milliseconds
  retry?: number // the number of times to retry before it throws an error
}) => ({
  data: TResponse | undefined
  isLoading: boolean
  isRetrying: boolean
  isError: boolean
  error: Error | null
})
```
