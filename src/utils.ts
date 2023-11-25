const areObjectsEqual = <T>(obj1: T, obj2: T): boolean => {
  const stringObj1 = JSON.stringify(obj1)
  const stringObj2 = JSON.stringify(obj2)

  return stringObj1 === stringObj2
}

const generateRequestHeaders = (headers?: Record<string, string>) => {
  return new Headers({
    'content-Type': 'application/json',
    ...(headers || {}),
  })
}

export { areObjectsEqual, generateRequestHeaders }
