'use server'

export default async function RegistrationUser(name: string, password: string, email: string) {
  const response = await fetch('http://authentication-service:8080/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      username: name,
      password,
      email
    }),
  })

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage = data?.error || data?.message || 'Ошибка сервера';
    throw new Error(errorMessage);
  }

  return data
}