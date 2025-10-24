import { CamelCasePlugin, type GeneratedAlways, Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'


export interface UserTable {
  id: GeneratedAlways<number>
  login: string
  password: string
  createdAt: GeneratedAlways<Date>
}

export interface ChatTable {
  id: GeneratedAlways<number>
  name: string
  user: number
  updateAt: GeneratedAlways<Date>
}

export interface MessageTable {
  id: GeneratedAlways<number>
  text: string 
  answer: boolean
  chat?: number
  createdAt: GeneratedAlways<Date>
}

export interface Database {
  users: UserTable
  messages: MessageTable
  chats: ChatTable
}

const database = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_CONNECTION_STRING
    })
  }),
  plugins: [
    new CamelCasePlugin({
      maintainNestedObjectKeys: true
    })
  ]
})

export default database
