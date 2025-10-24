'use server'
import { SignJWT } from 'jose'

const secretKey = process.env.JWT_SECRET_KEY
if (!secretKey) {
  throw new Error('JWT_SECRET_KEY is not set')
}
interface User {
  id: number
}

const key = new TextEncoder().encode(secretKey)

export default async function jwt(payload: User): Promise<string> {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 2 * 24 * 60 * 60

  return new SignJWT({ id: payload.id})
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(key)
}
