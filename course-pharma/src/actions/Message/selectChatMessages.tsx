'use server'
import database from '@/modules/database'

export default async function selectChatMessages(id: number) {
  const result = await database
    .selectFrom('messages')
    .innerJoin('chats', 'chats.id', 'messages.chat')
    .select([
      'messages.id',
      'messages.text',
      'messages.answer',
      'messages.chat',
      'messages.createdAt'
    ])
    .where('chats.id', '=', id)
    .orderBy('messages.createdAt asc')
    .execute()
return result?.map((element) => {
  const date = new Date(element.createdAt)
  const time = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  const dateStr = date.toLocaleDateString('ru-RU')
  return {
    ...element,
    createdAt: `${time} ${dateStr}`
  }
})
}