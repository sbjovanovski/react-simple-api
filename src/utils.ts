const areObjectsEqual = <T>(obj1: T, obj2: T): boolean => {
  const stringObj1 = JSON.stringify(obj1)
  const stringObj2 = JSON.stringify(obj2)

  return stringObj1 === stringObj2
}

const createRequest = async (apiUrl: string, requestInfo: RequestInit | undefined): Promise<Response> =>
  await fetch(apiUrl, {
    ...requestInfo,
    headers: new Headers({
      'content-type': 'application/json',
      ...requestInfo?.headers,
    }),
  })

const normalizeError = (error: any) => {
  if (error?.response) {
    return error?.response?.data?.errors || error?.response?.data || error?.response
  }
  return error
}

export { areObjectsEqual, createRequest, normalizeError }
