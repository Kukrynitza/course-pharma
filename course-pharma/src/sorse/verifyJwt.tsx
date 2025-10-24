'use server'
import { jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET_KEY
if (!secretKey) {
  throw new Error('JWT_SECRET_KEY is not set')
}

const key = new TextEncoder().encode(secretKey)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function verifyJwt(token: string): Promise<any> {
  const { payload } = await jwtVerify(token, key, {
    algorithms: ['HS256']
  })

  return payload
}
