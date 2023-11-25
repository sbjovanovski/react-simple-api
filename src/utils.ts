const generateIdentifier = (id: string | string[]): string => {
  if (Array.isArray(id)) {
    return JSON.stringify(id)
  }
  return id
}

const areObjectsEqual = <T>(obj1: T, obj2: T): boolean => {
  const stringObj1 = JSON.stringify(obj1)
  const stringObj2 = JSON.stringify(obj2)

  return stringObj1 === stringObj2
}

const generateRequestHeaders = (headers?: Record<string, string>) => {
  return new Headers({
    'Content-Type': 'application/json',
    ...(headers || {}),
  })
}

export { areObjectsEqual, generateIdentifier, generateRequestHeaders }
