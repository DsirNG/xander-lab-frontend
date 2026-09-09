import { Button, Text, View } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { authApi } from '@/api/auth'
import { NavBar } from '@/components/NavBar'
import { t } from '@/i18n'
import { useUserStore } from '@/store/user'
import './index.scss'

export default function ScanLogin() {
  const [ticket, setTicket] = useState('')
  const [loading, setLoading] = useState(false)
  const user = useUserStore(state => state.user)
  useLoad(params => setTicket(params?.ticket || params?.scene || ''))

  const confirm = async () => {
    if (!ticket || loading) return
    setLoading(true)
    try {
      // 扫码进入时可能没有本地业务 token；先用 wx.login 静默建立登录态。
      if (!user && !authApi.isLoggedIn()) {
        const loginResult = await Taro.login()
        if (!loginResult.code) throw new Error('微信登录失败，请重试')
        const response = await authApi.wechatLogin(loginResult.code)
        if (!response.accessToken) {
          throw new Error(response.pendingBind ? '请先完成微信账号绑定' : '微信登录失败，请重试')
        }
        await useUserStore.getState().refresh()
      }
      await authApi.confirmQrLogin(ticket)
      Taro.showToast({ title: t('login.qrConfirmed'), icon: 'success' })
      setTimeout(() => Taro.navigateBack().catch(() => undefined), 700)
    } catch (error) {
      Taro.showToast({ title: error instanceof Error ? error.message : t('login.qrFailed'), icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="scan-login-page">
      <NavBar title={t('login.qrTitle')} showBack />
      <View className="scan-login-card">
        <Text className="scan-login-brand">DinQorAI</Text>
        <Text className="scan-login-title">{t('login.qrTitle')}</Text>
        <Text className="scan-login-desc">{t('login.qrDescription')}</Text>
        <Button className="btn btn-primary scan-login-button" loading={loading} onClick={confirm}>
          {t('login.qrConfirm')}
        </Button>
        {!ticket ? <Text className="scan-login-error">{t('login.qrInvalid')}</Text> : null}
      </View>
    </View>
  )
}
