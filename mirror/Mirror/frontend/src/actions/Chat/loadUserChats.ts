'use server'

interface User {
  userId: number
  token: string
}

interface ChatResponse {
  id: string
  name: string
  userId: number
  createdAt: string
  isEmpty?: boolean
}

interface ChatApiItem {
  id: number | string
  title: string
  createdAt: string
  userId: number
}


export default async function loadUserChats(userId: number): Promise<ChatResponse[]> {
  if (!userId) return []

  const url = new URL(`http://orchestration-service:8084/api/chat/list`)
  url.searchParams.append('userId', userId.toString())

  let response: Response
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-store'
    })
  } catch (e) {
    console.error('Ошибка запроса списка чатов:', e)
    return []
  }

  if (!response.ok) {
    console.error('Ошибка сервера при получении чатов', response.status)
    return []
  }

  let data: ChatApiItem[] = []
  try {
    data = await response.json()
  } catch (e) {
    console.error('Ошибка парсинга JSON:', e)
  }

  return data.map((chat: ChatApiItem) => ({
    id: chat.id.toString(),
    name: decodeURIComponent(chat.title), 
    createdAt: chat.createdAt,
    userId: chat.userId,
    isEmpty: false
  }))
}
