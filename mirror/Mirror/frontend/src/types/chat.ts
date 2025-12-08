export interface ChatType {
  id: string
  name: string
  createdAt: string
  userId: number
  isEmpty?: boolean
}

export interface ChatHistory {
  chatId: string
  messages: Message[]
}

export interface Message {
  image?: string
  audio?: string
  id: string
  text: string
  timestamp: string
  isUser: boolean
}