import { request, saveTokenPair, tokenStorage } from './http'

export type UserInfo = {
  username: string
  nickname: string
  avatar: string
  role: string
  email: string | null
  createdAt: string
}

export type TokenResponse = {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  userInfo: UserInfo
}

export const authApi = {
  /** 微信小程序登录：Taro.login() 的 code 换取平台 token（首次自动注册） */
  wechatLogin: async (code: string) => {
    const response = await request<TokenResponse>('/api/auth/wechat-login', {
      method: 'POST',
      data: { code },
    })
    saveTokenPair(response)
    return response
  },
  /** 账号密码登录（用户名或邮箱） */
  login: async (account: string, password: string) => {
    const response = await request<TokenResponse>('/api/auth/login', {
      method: 'POST',
      data: { type: 'password', account, password },
    })
    saveTokenPair(response)
    return response
  },
  /** 邮箱注册（注册即登录） */
  register: async (email: string, password: string, name: string) => {
    const response = await request<TokenResponse>('/api/auth/register', {
      method: 'POST',
      data: { email, password, name },
    })
    saveTokenPair(response)
    return response
  },
  /** 如已登录，返回当前用户信息 */
  me: () => request<UserInfo>('/api/auth/me', { method: 'GET' }),
  /** 更新昵称 / 头像 */
  updateProfile: (data: { nickname?: string; avatar?: string }) =>
    request<UserInfo>('/api/auth/profile', { method: 'PUT', data }),
  /** 登出当前设备 */
  logout: async () => {
    try {
      await request<void>('/api/auth/logout', { method: 'POST' })
    } finally {
      tokenStorage.clear()
    }
  },
  isLoggedIn: () => Boolean(tokenStorage.getAccessToken()),
}
