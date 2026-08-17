import { useEffect, useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Icon } from '@/components/Icon'
import { TabBar } from '@/components/TabBar'
import { authApi, UserInfo } from '@/api/auth'
import './index.scss'

const menus = [
  ['◷', '阅读记录'],
  ['☆', '我的收藏'],
  ['▤', '我的文章'],
  ['◴', '浏览历史'],
  ['□', '意见反馈'],
  ['ⓘ', '关于 DinQorAI'],
]

function showToast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

export default function Profile() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authApi.isLoggedIn()) return
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
  }, [])

  const handleWechatLogin = async () => {
    if (loading) return
    setLoading(true)
    try {
      const loginResult = await Taro.login()
      if (!loginResult.code) {
        showToast('获取微信登录凭证失败')
        return
      }
      const response = await authApi.wechatLogin(loginResult.code)
      setUser(response.userInfo)
      showToast('登录成功')
    } catch (e) {
      showToast(e instanceof Error ? e.message : '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // 登出接口失败也清除本地凭证
    }
    setUser(null)
    showToast('已退出登录')
  }

  return (
    <View className="page profile">
      <View className="setting">⚙</View>
      <View className="profile-head">
        <View className="profile-avatar">{user ? user.nickname?.charAt(0) || 'X' : 'X'}</View>
        {user ? (
          <View>
            <Text className="profile-name">{user.nickname}</Text>
            <Text className="profile-role">{user.email || '微信小程序用户'}</Text>
          </View>
        ) : (
          <View>
            <Text className="profile-name">未登录</Text>
            <Text className="profile-role">登录后可同步收藏与阅读记录</Text>
          </View>
        )}
      </View>
      {user ? (
        <Button className="login-btn" onClick={handleLogout}>
          退出登录
        </Button>
      ) : (
        <Button className="login-btn" onClick={handleWechatLogin} loading={loading}>
          微信一键登录
        </Button>
      )}
      <View className="stats">
        <View>
          <Text>{user ? '-' : '--'}</Text>
          <Text>文章</Text>
        </View>
        <View>
          <Text>{user ? '-' : '--'}</Text>
          <Text>收藏</Text>
        </View>
        <View>
          <Text>{user ? '-' : '--'}</Text>
          <Text>阅读记录</Text>
        </View>
      </View>
      <View className="menu-card">
        {menus.map(m => (
          <View className="menu-row" key={m[1]}>
            <Text className="menu-icon">{m[0]}</Text>
            <Text>{m[1]}</Text>
            <Text>›</Text>
          </View>
        ))}
      </View>
      <TabBar active="user" />
    </View>
  )
}