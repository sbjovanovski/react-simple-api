class ApiCache<T> {
  private apiResponses: Map<Response, T> = new Map()

  getCachedResponse(response: Response): T | undefined {
    return this.apiResponses.get(response)
  }

  setCachedResponse(response: Response, data: T): T {
    this.apiResponses.set(response, data)
    return data
  }
}

export { ApiCache }
