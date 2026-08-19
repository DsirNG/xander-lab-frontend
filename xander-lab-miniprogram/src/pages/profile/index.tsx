import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { Icon } from '@/components/Icon'
import { TabBar } from '@/components/TabBar'
import { NavBar } from '@/components/NavBar'
import { authApi } from '@/api/auth'
import { pointsApi } from '@/api/points'
import { useUserStore } from '@/store/user'
import './index.scss'

function showToast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

function ProfileMenuRow({
  icon,
  label,
  description,
  onClick,
}: {
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  description?: string
  onClick: () => void
}) {
  return (
    <View className="menu-row" onClick={onClick}>
      <View className="menu-icon">
        <Icon name={icon} />
      </View>
      <View className="menu-copy">
        <Text className="menu-label">{label}</Text>
        {description ? <Text className="menu-description">{description}</Text> : null}
      </View>
      <Text className="menu-arrow">›</Text>
    </View>
  )
}

export default function Profile() {
  const user = useUserStore(state => state.user)
  const setUser = useUserStore(state => state.setUser)
  const logout = useUserStore(state => state.logout)
  const [balance, setBalance] = useState<number | null>(null)
  const [consumedToday, setConsumedToday] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useDidShow(() => {
    useUserStore
      .getState()
      .refresh()
      .then(() => {
        if (useUserStore.getState().user) {
          pointsApi
            .overview()
            .then(result => {
              setBalance(result.balance)
              setConsumedToday(result.consumedToday)
            })
            .catch(() => setBalance(null))
        } else {
          setBalance(null)
        }
      })
      .catch(() => undefined)
  })

  const handleWechatLogin = async () => {
    if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
      navigate('/pages/login/index')
      return
    }
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
    const confirmed = await Taro.showModal({
      title: '退出登录',
      content: '确定退出当前账号吗？',
      confirmColor: '#d14343',
    })
    if (!confirmed.confirm) return
    await logout()
    setBalance(null)
    showToast('已退出登录')
  }

  const navigate = (url: string) => {
    Taro.navigateTo({ url })
  }

  return (
    <View className="page profile-page">
      <NavBar title="我的" />
      <View className="profile-head">
        <View className="profile-avatar">
          {user?.avatar ? (
            <Image className="profile-avatar-img" src={user.avatar} mode="aspectFill" />
          ) : (
            <Text>{user ? user.nickname?.charAt(0) || 'X' : 'X'}</Text>
          )}
        </View>
        <View>
          <Text className="profile-name">{user ? user.nickname : '未登录'}</Text>
          <Text className="profile-role">
            {user ? user.email || '微信小程序用户' : '登录后同步博客与计划数据'}
          </Text>
        </View>
      </View>
      {user ? (
        <Button className="logout-btn" onClick={handleLogout}>
          退出登录
        </Button>
      ) : (
        <Button className="login-btn" onClick={handleWechatLogin} loading={loading}>
          {Taro.getEnv() === Taro.ENV_TYPE.WEAPP ? '微信一键登录' : '登录 / 注册'}
        </Button>
      )}

      {user ? (
        <View className="points-card points-strip" onClick={() => navigate('/pages/points/index')}>
          <View>
            <Text className="points-balance">
              {balance == null ? '--' : balance.toLocaleString()}
            </Text>
            <Text className="points-label">可用积分</Text>
          </View>
          <View className="points-today">
            {consumedToday != null ? `今日已用 ${consumedToday}` : ''}
            {'\n'}点击查看明细
          </View>
        </View>
      ) : (
        <View className="points-card points-strip" onClick={() => navigate('/pages/login/index')}>
          <View>
            <Text className="points-balance">--</Text>
            <Text className="points-label">登录后查看积分</Text>
          </View>
          <View className="points-today">去登录 {'\n'}›</View>
        </View>
      )}

      <View className="profile-section">
        <Text className="profile-section-title">创作</Text>
        <View className="menu-card">
          <ProfileMenuRow
            icon="edit"
            label="发布文章"
            description="写作、预览并发布 Markdown 文章"
            onClick={() =>
              user ? navigate('/pages/publish/index') : navigate('/pages/login/index')
            }
          />
          <ProfileMenuRow
            icon="article"
            label="我的博客"
            description="管理草稿、已发布文章与回收站"
            onClick={() =>
              user ? navigate('/pages/blog-manage/index') : navigate('/pages/login/index')
            }
          />
        </View>
      </View>

      <View className="profile-section">
        <Text className="profile-section-title">账户</Text>
        <View className="menu-card">
          <ProfileMenuRow
            icon="chat"
            label="通知中心"
            description="查看计划执行与发布结果"
            onClick={() =>
              user ? navigate('/pages/notifications/index') : navigate('/pages/login/index')
            }
          />
          <ProfileMenuRow
            icon="points"
            label="积分明细"
            description="查看余额与使用记录"
            onClick={() =>
              user ? navigate('/pages/points/index') : navigate('/pages/login/index')
            }
          />
          <ProfileMenuRow
            icon="user"
            label="账户设置"
            description="更新昵称与头像"
            onClick={() =>
              user ? navigate('/pages/account-settings/index') : navigate('/pages/login/index')
            }
          />
        </View>
      </View>

      <View className="profile-section">
        <View className="menu-card">
          <ProfileMenuRow
            icon="chat"
            label="关于 DinQorAI"
            onClick={() =>
              Taro.showModal({
                title: '关于 DinQorAI',
                content: 'DinQorAI — 博客智能体平台。对话、计划与发布形成完整创作闭环。',
                showCancel: false,
                confirmText: '知道了',
              })
            }
          />
        </View>
      </View>
      <TabBar active="user" />
    </View>
  )
}
