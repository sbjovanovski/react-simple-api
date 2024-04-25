class ApiCache<T = void> {
  private apiResponses: Map<string, T> = new Map()
  private static instance: ApiCache

  // Ensure that there is only one instance of the cache in the application
  static getInstance(): ApiCache {
    if (this.instance) {
      return this.instance
    }
    this.instance = new ApiCache()
    return this.instance
  }

  getCachedResponse(id: string): T | undefined {
    return this.apiResponses.get(id)
  }

  setCachedResponse(id: string, data: T, cacheExpiry?: number): T {
    this.apiResponses.set(id, data)
    if (cacheExpiry) {
      setTimeout((): void => {
        this.deleteCachedResponse(id)
      }, cacheExpiry)
    }
    return data
  }

  private deleteCachedResponse(id: string): void {
    this.apiResponses.delete(id)
  }
}

export { ApiCache }
