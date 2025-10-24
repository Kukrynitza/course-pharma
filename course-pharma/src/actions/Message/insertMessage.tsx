'use server'
import database from '@/modules/database'

interface Message {
  id: number
  text: string
  answer: boolean
  createdAt: string
  chat?: number
}

export default async function insertMessage(message: Message) {
  if(message.chat){
    database
      .insertInto('messages')
      .values({
        text: message.text,
        answer: message.answer,
        chat: message.chat
      })
      .execute()
  }
  else {
    database
      .insertInto('messages')
      .values({
        text: message.text,
        answer: message.answer
      })
      .execute()
  }
}
