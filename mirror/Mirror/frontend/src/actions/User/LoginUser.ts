'use server'

export default async function LoginUser(login: string, password: string) {
  const response = await fetch('http://authentication-service:8080/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: login, password }),
  })

  let data
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const errorMessage = data?.error || data?.message || 'Неверный логин или пароль'
    throw new Error(errorMessage)
  }

  if (!data.token || !data.userId) {
    throw new Error('Неверный формат ответа сервера')
  }

  return {
    token: data.token as string,
    userId: data.userId as number,
  }
}