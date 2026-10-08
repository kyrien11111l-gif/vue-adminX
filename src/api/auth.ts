import type { LoginCredentials, LoginResult } from '@/types'
import { request } from '@/services'

export function login(credentials: LoginCredentials): Promise<LoginResult> {
  return request.post<LoginResult, LoginCredentials>('/login', {
    data: credentials
  })
}
