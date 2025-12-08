'use server'

interface User {
  userId: number
  token: string
}

interface CreateChatResponse {
  chatId?: number
  error?: string
  message?: string
  [key: string]: unknown
}

export default async function createNewChat(user: User, title: string) {
  if (!title?.trim()) throw new Error('Название чата обязательно')

const url = new URL('http://orchestration-service:8084/api/chat/create')
url.searchParams.append('userId', user.userId.toString())
url.searchParams.append('title', encodeURIComponent(title.trim()))

  let response: Response
  try {
    response = await fetch(url.href, {
      method: 'POST'
    })
  } catch (e) {
    console.error('fetch error:', e)
    throw new Error('Не удалось связаться с бэкендом')
  }

  let data: CreateChatResponse | null = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const msg = data?.error ?? data?.message ?? 'Неизвестная ошибка сервера'
    console.error('backend error:', response.status, msg)
    throw new Error(msg)
  }

  if (!data?.chatId) {
    throw new Error('Сервер не вернул chatId')
  }

  return { chatId: Number(data.chatId) }
}