export interface Chat {
  id: number
  name: string
  user: number
  updateAt: string
}

export interface Message {
  id: number
  text: string 
  answer: boolean
  chat?: number
  createdAt: string
}

export interface User {
  id: number
  login: string
  password: string
}