'use server'

import { ChatHistory } from '@/types/chat'

export default async function loadChatHistory(chatId: string | number): Promise<ChatHistory> {
  if (!chatId) return { chatId: '', messages: [] }

  const url = `http://orchestration-service:8084/api/chat/${chatId}`

  let response: Response
  try {
    response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
    })
  } catch (e) {
    console.error('Ошибка запроса конкретного чата:', e)
    return { chatId: String(chatId), messages: [] }
  }

  if (!response.ok) {
    console.error('Ошибка сервера при получении чата', response.status)
    return { chatId: String(chatId), messages: [] }
  }

  let data: ChatHistory = { chatId: String(chatId), messages: [] }
  try {
    data = await response.json()
  } catch (e) {
    console.error('Ошибка парсинга JSON чата:', e)
  }

  return data
}
