class ApiCache<T> {
  private apiResponses: Map<string, T> = new Map()

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
