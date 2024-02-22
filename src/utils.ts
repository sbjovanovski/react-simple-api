const areObjectsEqual = <T>(obj1: T, obj2: T): boolean => {
  const stringObj1 = JSON.stringify(obj1)
  const stringObj2 = JSON.stringify(obj2)

  return stringObj1 === stringObj2
}

type RequestHeaders = HeadersInit & { 'content-type': string }

const createRequest = async ({
  apiUrl,
  requestInfo,
  withContentTypeJSON = true,
}: {
  apiUrl: string
  requestInfo: RequestInit | undefined
  withContentTypeJSON?: boolean
}): Promise<Response> => {
  const headers: RequestHeaders = (requestInfo?.headers as RequestHeaders) || {}

  if (withContentTypeJSON) {
    headers['content-type'] = 'application/json'
  }

  return await fetch(apiUrl, {
    ...requestInfo,
    headers: new Headers(headers),
  })
}

const normalizeError = (error: any) => {
  if (error?.response) {
    return error?.response?.data?.errors || error?.response?.data || error?.response
  }
  return error
}

export { areObjectsEqual, createRequest, normalizeError }
