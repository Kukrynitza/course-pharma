'use server'

import { MessageType } from '@/companenents/Message/Message'


interface MessageApiItem {
  id: number | string
  prompt?: string
  response?: string
  requestTime?: string | number
  imageBase64?: string | null
}

export default async function loadMessages(chatId: number): Promise<MessageType[]> {
  if (!chatId) return []

  const url = `http://orchestration-service:8084/api/chat/${chatId}`

  try {
    const response = await fetch(url, { method: 'GET', cache: 'no-store' })

    if (!response.ok) {
      console.error('Ошибка при загрузке сообщений:', response.status)
      return []
    }

    const data = await response.json()

    return data.map((msg: MessageApiItem) => {
      let text = '';

      if (msg.prompt && msg.response) {
        text = `Вопрос: ${msg.prompt} \n\n Ответ: ${msg.response}`;
      } else {
        text = msg.prompt || msg.response || '';
      }
      return {
        id: msg.id?.toString(),
        text,
        isOwn: false,
        timestamp: new Date(msg.requestTime || Date.now()),
        image: msg.imageBase64 ? `data:image/jpeg;base64,${msg.imageBase64}` : undefined,
        audio: undefined
      }
    })
  } catch (e) {
    console.error('Ошибка загрузки сообщений:', e)
    return []
  }
}
