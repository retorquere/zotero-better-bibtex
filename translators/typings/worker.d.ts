namespace BBTWorker {
  type Config = {
    platform: string
    preferences: Record<string, any>
    options: Record<string, any>
    items: ISerializedItem[]
    cslItems?: any[]
  }
}
