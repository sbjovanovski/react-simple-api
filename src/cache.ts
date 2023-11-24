class ApiCache<T> {
    private apiResponses: Map<string, T> = new Map()

    getCachedResponse(id: string): T | undefined {
        return this.apiResponses.get(id)
    }

    setCachedResponse(id: string, data: T): T {
        this.apiResponses.set(id, data)
        return data
    }
}

export {ApiCache}
