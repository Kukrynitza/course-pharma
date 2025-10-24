'use server'
import database from '@/modules/database'

interface Chat {
  name: string
  user: number
}

export default async function insertUser(chat: Chat) {
  const data = await database
    .insertInto('chats')
    .values({
      name: chat.name,
      user: chat.user
    })
    .returning(['id', 'name', 'user', 'updateAt'])
    .executeTakeFirst()
    if(data){
      const date = new Date(data.updateAt)
      const time = date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      const dateStr = date.toLocaleDateString('ru-RU')
    const result = {...data, updateAt: `${time} ${dateStr}`}
    return result
    }
}
