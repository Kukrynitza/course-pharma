import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
// import database from './modules/database'
import verifyJwt from '@/sorse/verifyJwt'

const adminPages = ['/admin']
const userPages = ['/VLAD']
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token && userPages.includes(pathname) || !token && adminPages.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.nextUrl))
  }
  // if (token) {
  //   const payload = await verifyJwt(token) as { id: string}
  //   if (adminPages.includes(pathname) && payload.role !== 'admin') {
  //     return NextResponse.redirect(new URL('/', request.nextUrl))
  //   }

  //   return NextResponse.next()
  // }
}
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
}
