'use server'
import database from '@/modules/database'

export default async function selectUsersLogin() {
  const result = await database
    .selectFrom('users')
    .select('users.login')
    .execute()
    return result.map(element => element.login)
}
