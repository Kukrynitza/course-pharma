'use server'
import database from '@/modules/database'

export default async function selectChats(id: number) {
    const result = await database
    .selectFrom('chats')
    .select([
      'chats.id',
      'chats.name',
      'chats.user',
      'chats.updateAt'
    ])
    .where('chats.user', '=', id)
    .orderBy('chats.updateAt', 'desc')
    .execute()
  return result?.map((element) => {
  const date = new Date(element.updateAt)
  const time = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  const dateStr = date.toLocaleDateString('ru-RU')
  return {
    ...element,
    updateAt: `${time} ${dateStr}`
  }
})
}
