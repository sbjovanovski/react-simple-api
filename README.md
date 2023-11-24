# react-simple-api
Query and cache API data

### Install
```
npm install react-simple-query
```
or
```
yarn add react-simple-query
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
import { useApi, Method } from 'react-simple-api'

interface Cat {
    type: string
    user: string
}

const {
        data,
        isLoading,
        isError,
        error
    } = useApi<Cat[], {}>('cat-api', 'https://cat-fact.herokuapp.com/facts', Method.GET)
```
### Types
```
enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

useApi = <TResponse, TData>(
  apiId: string,
  apiUrl: string,
  method: Method,
  data?: TData,
  headers?: HeadersInit,
) => ({
  data: TResponse | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
})
```
