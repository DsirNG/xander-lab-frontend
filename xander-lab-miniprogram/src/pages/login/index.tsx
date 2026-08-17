import { Button, Input, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { authApi } from '@/api/auth'
import { useUserStore } from '@/store/user'
import './index.scss'

type Mode = 'wechat' | 'password' | 'register'

function showToast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

export default function Login() {
  const setUser = useUserStore(state => state.setUser)
  const [mode, setMode] = useState<Mode>('wechat')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useDidShow(() => {
    if (useUserStore.getState().user) {
      Taro.navigateBack().catch(() => undefined)
    }
  })

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
      setTimeout(() => Taro.navigateBack().catch(() => undefined), 600)
    } catch (e) {
      showToast(e instanceof Error ? e.message : '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordLogin = async () => {
    if (!account.trim() || !password) {
      showToast('请输入账号和密码')
      return
    }
    if (loading) return
    setLoading(true)
    try {
      const response = await authApi.login(account.trim(), password)
      setUser(response.userInfo)
      showToast('登录成功')
      setTimeout(() => Taro.navigateBack().catch(() => undefined), 600)
    } catch (e) {
      showToast(e instanceof Error ? e.message : '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!name.trim() || !account.trim() || !password) {
      showToast('请完整填写注册信息')
      return
    }
    if (password.length < 6) {
      showToast('密码至少 6 位')
      return
    }
    if (loading) return
    setLoading(true)
    try {
      const response = await authApi.register(account.trim(), password, name.trim())
      setUser(response.userInfo)
      showToast('注册成功')
      setTimeout(() => Taro.navigateBack().catch(() => undefined), 600)
    } catch (e) {
      showToast(e instanceof Error ? e.message : '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="login-page">
      <Text className="login-brand">DinQorAI</Text>
      <Text className="login-subtitle">博客智能体 · 对话 / 计划 / 创作</Text>

      {mode === 'wechat' ? (
        <>
          <Button
            className="btn btn-primary login-submit"
            loading={loading}
            onClick={handleWechatLogin}
          >
            微信一键登录
          </Button>
          <View className="login-divider">或</View>
          <Button className="btn btn-ghost" onClick={() => setMode('password')}>
            账号密码登录
          </Button>
          <Text className="login-back">登录即代表同意平台的《用户协议》与《隐私政策》</Text>
        </>
      ) : null}

      {mode === 'password' || mode === 'register' ? (
        <>
          <View className="segmented login-segmented">
            <Text
              className={`segment ${mode === 'password' ? 'active' : ''}`}
              onClick={() => setMode('password')}
            >
              登录
            </Text>
            <Text
              className={`segment ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              注册
            </Text>
          </View>
          <View className="login-form">
            {mode === 'register' ? (
              <View className="form-item">
                <Text className="form-label">昵称</Text>
                <Input
                  className="form-input"
                  placeholder="你的昵称"
                  value={name}
                  maxlength={30}
                  onInput={e => setName(e.detail.value)}
                />
              </View>
            ) : null}
            <View className="form-item">
              <Text className="form-label">
                {mode === 'register' ? '邮箱' : '账号（用户名或邮箱）'}
              </Text>
              <Input
                className="form-input"
                placeholder="请输入账号"
                value={account}
                onInput={e => setAccount(e.detail.value)}
              />
            </View>
            <View className="form-item">
              <Text className="form-label">密码</Text>
              <Input
                className="form-input"
                placeholder="请输入密码"
                password
                value={password}
                maxlength={50}
                onInput={e => setPassword(e.detail.value)}
                onConfirm={mode === 'password' ? handlePasswordLogin : handleRegister}
              />
            </View>
          </View>
          <Button
            className="btn btn-primary login-submit"
            loading={loading}
            onClick={mode === 'password' ? handlePasswordLogin : handleRegister}
          >
            {mode === 'password' ? '登录' : '注册并登录'}
          </Button>
          {mode === 'register' ? (
            <Text className="login-back">已有账号？点击上方「登录」切换</Text>
          ) : (
            <Text className="login-back">还没有账号？点击上方「注册」</Text>
          )}
        </>
      ) : null}
    </View>
  )
}
