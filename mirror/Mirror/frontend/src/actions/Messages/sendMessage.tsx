'use server'

export interface SendMessageResponse {
  chatId: number
  response?: string
  error?: string
}

export default async function sendMessage(
  chatId: number,
  userId: number,
  text?: string,
  image?: File,
  audio?: Blob
): Promise<SendMessageResponse> {
  if (!chatId || !userId) throw new Error('Не указан chatId или userId')

  const hasImage = !!image
  const hasAudio = !!audio
  const hasText = !!text?.trim()

  let url = ''
  let formData: FormData

  if (hasAudio) {
    url = 'http://orchestration-service:8084/api/chat/new/voice'
    formData = new FormData()
    formData.append('chatId', chatId.toString())
    formData.append('userId', userId.toString())
    formData.append('image', new Blob(), 'empty.jpg')
    formData.append('voice', audio, 'voice.webm')
  } else if (hasImage) {
    url = 'http://orchestration-service:8084/api/chat/new/image'
    formData = new FormData()
    formData.append('file', image)
    formData.append('chatId', chatId.toString())
    formData.append('userId', userId.toString())
    if (hasText) formData.append('prompt', text!)
  } else if (hasText) {
    url = 'http://orchestration-service:8084/api/chat/new/image' 
    formData = new FormData()
    formData.append('file', new Blob(), 'empty.jpg')
    formData.append('chatId', chatId.toString())
    formData.append('userId', userId.toString())
    formData.append('prompt', text!)
  } else {
    throw new Error('Нет данных для отправки')
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      cache: 'no-store'
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Ошибка при отправке сообщения:', errText)
      return { chatId, error: errText }
    }

    const data = await response.json()
    return { chatId, response: data.response }
  } catch (e: unknown) {
  console.error('Ошибка отправки сообщения:', e)

  const message =
    e instanceof Error ? e.message : 'Неизвестная ошибка'

  return { chatId, error: message }
}
}
