import { Button, Image, Input, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCallback, useEffect, useState } from 'react'
import { authApi, type UserInfo } from '@/api/auth'
import { NavBar } from '@/components/NavBar'
import { getLocale, t, type Locale } from '@/i18n'
import { useUserStore } from '@/store/user'
import './index.scss'

const MAX_NICKNAME_LENGTH = 30
const MAX_AVATAR_LENGTH = 255
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
const dateLocales: Record<Locale, string> = {
  zh: 'zh-CN',
  en: 'en-US',
  fr: 'fr-FR',
  ja: 'ja-JP',
  ru: 'ru-RU',
  vi: 'vi-VN',
}

function showToast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

function formatCreatedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return t('common.notAvailable')

  try {
    return date.toLocaleDateString(dateLocales[getLocale()], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return date.toLocaleDateString()
  }
}

function getRoleLabel(role: string) {
  const normalizedRole = role.toUpperCase()
  if (normalizedRole === 'ADMIN') return t('accountSettings.roleAdmin')
  if (normalizedRole === 'USER') return t('accountSettings.roleUser')
  return role || t('common.notAvailable')
}

export default function AccountSettingsPage() {
  const setStoredUser = useUserStore(state => state.setUser)
  const [profile, setProfile] = useState<UserInfo | null>(null)
  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [avatarPreviewFailed, setAvatarPreviewFailed] = useState(false)

  // 未绑定邮箱的微信临时账号：补绑邮箱（邮箱已是既有 PC 账号时自动合并）
  const [bindEmail, setBindEmail] = useState('')
  const [bindCode, setBindCode] = useState('')
  const [bindCountdown, setBindCountdown] = useState(0)
  const [sendingCode, setSendingCode] = useState(false)
  const [binding, setBinding] = useState(false)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const result = await authApi.me()
      setProfile(result)
      setNickname(result.nickname || '')
      setAvatar(result.avatar || '')
      setAvatarPreviewFailed(false)
      setStoredUser(result)
    } catch {
      setLoadError(t('accountSettings.loadError'))
    } finally {
      setLoading(false)
    }
  }, [setStoredUser])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const validate = () => {
    const trimmedNickname = nickname.trim()
    const trimmedAvatar = avatar.trim()

    if (!trimmedNickname) return t('accountSettings.nicknameRequired')
    if (trimmedNickname.length > MAX_NICKNAME_LENGTH) {
      return t('accountSettings.nicknameTooLong')
    }
    if (trimmedAvatar && !/^https?:\/\//i.test(trimmedAvatar)) {
      return t('accountSettings.avatarInvalid')
    }
    if (trimmedAvatar.length > MAX_AVATAR_LENGTH) {
      return t('accountSettings.avatarTooLong')
    }
    return null
  }

  const handleSave = async () => {
    if (saving) return
    const validationError = validate()
    setFieldError(validationError)
    if (validationError) return

    const trimmedNickname = nickname.trim()
    const trimmedAvatar = avatar.trim()
    setSaving(true)
    try {
      const updated = await authApi.updateProfile({
        nickname: trimmedNickname,
        avatar: trimmedAvatar || undefined,
      })
      setProfile(updated)
      setNickname(updated.nickname || '')
      setAvatar(updated.avatar || '')
      setAvatarPreviewFailed(false)
      setStoredUser(updated)
      showToast(t('accountSettings.saveSuccess'))
    } catch {
      showToast(t('accountSettings.saveError'))
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarInput = (value: string) => {
    setAvatar(value)
    setAvatarPreviewFailed(false)
    setFieldError(null)
  }

  const canBindEmail = !profile || !profile.email || profile.email.trim() === ''

  const handleSendBindCode = async () => {
    if (sendingCode || bindCountdown > 0) return
    const trimmedEmail = bindEmail.trim()
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      showToast(t('login.invalidEmail'))
      return
    }
    setSendingCode(true)
    try {
      await authApi.sendCode(trimmedEmail)
      setBindCountdown(60)
      showToast(t('login.codeSent'))
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('accountSettings.sendCodeError'))
    } finally {
      setSendingCode(false)
    }
  }

  const handleBindEmail = async () => {
    if (binding) return
    if (!canBindEmail) {
      showToast(t('accountSettings.alreadyBound'))
      return
    }
    const trimmedEmail = bindEmail.trim()
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      showToast(t('login.invalidEmail'))
      return
    }
    if (!bindCode.trim()) {
      showToast(t('login.codeRequired'))
      return
    }
    setBinding(true)
    try {
      const response = await authApi.bindExisting(trimmedEmail, bindCode.trim())
      const updated = { ...(profile as UserInfo), ...(response.userInfo as UserInfo) }
      setProfile(updated)
      setStoredUser(updated)
      setBindEmail('')
      setBindCode('')
      showToast(t('accountSettings.bindSuccess'))
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('accountSettings.bindError'))
    } finally {
      setBinding(false)
    }
  }

  const roleLabel = profile ? getRoleLabel(profile.role) : t('common.notAvailable')
  const avatarInitial =
    nickname.trim().charAt(0).toUpperCase() || profile?.username.charAt(0) || 'X'

  return (
    <View className="account-settings-page">
      <NavBar
        title={t('nav.accountSettings')}
        showBack
        background="var(--color-canvas)"
        color="var(--color-ink)"
      />

      {loading ? (
        <View className="account-settings-state">
          <Text className="account-settings-state-title">{t('common.loading')}</Text>
        </View>
      ) : null}

      {!loading && loadError ? (
        <View className="account-settings-state">
          <Text className="account-settings-state-title">{loadError}</Text>
          <Button className="account-settings-retry" onClick={loadProfile}>
            {t('common.retry')}
          </Button>
        </View>
      ) : null}

      {!loading && profile ? (
        <View className="account-settings-content">
          <Text className="account-settings-description">{t('accountSettings.description')}</Text>

          <View className="account-settings-section">
            <Text className="account-settings-section-title">
              {t('accountSettings.profileSection')}
            </Text>

            <View className="avatar-editor">
              <View className="avatar-preview">
                {avatar.trim() && !avatarPreviewFailed ? (
                  <Image
                    className="avatar-preview-image"
                    src={avatar.trim()}
                    mode="aspectFill"
                    onError={() => setAvatarPreviewFailed(true)}
                  />
                ) : (
                  <Text className="avatar-preview-initial">{avatarInitial}</Text>
                )}
              </View>
              <View className="avatar-preview-copy">
                <Text className="avatar-preview-label">{t('accountSettings.previewLabel')}</Text>
                {avatarPreviewFailed ? (
                  <Text className="avatar-preview-error">
                    {t('accountSettings.avatarLoadError')}
                  </Text>
                ) : null}
              </View>
            </View>

            <View className="account-settings-field">
              <View className="account-settings-label-row">
                <Text className="account-settings-label">{t('accountSettings.nickname')}</Text>
                <Text className="account-settings-counter">
                  {nickname.length}/{MAX_NICKNAME_LENGTH}
                </Text>
              </View>
              <Input
                className="account-settings-input"
                placeholderClass="account-settings-placeholder"
                value={nickname}
                maxlength={MAX_NICKNAME_LENGTH}
                placeholder={t('accountSettings.nicknamePlaceholder')}
                onInput={event => {
                  setNickname(event.detail.value)
                  setFieldError(null)
                }}
              />
              <Text className="account-settings-help">{t('accountSettings.nicknameHelp')}</Text>
            </View>

            <View className="account-settings-field">
              <Text className="account-settings-label">{t('accountSettings.avatarUrl')}</Text>
              <Input
                className="account-settings-input"
                placeholderClass="account-settings-placeholder"
                value={avatar}
                maxlength={MAX_AVATAR_LENGTH}
                placeholder={t('accountSettings.avatarPlaceholder')}
                onInput={event => handleAvatarInput(event.detail.value)}
              />
              <Text className="account-settings-help">{t('accountSettings.avatarHelp')}</Text>
            </View>

            {fieldError ? <Text className="account-settings-field-error">{fieldError}</Text> : null}
          </View>

          <View className="account-settings-section">
            <Text className="account-settings-section-title">
              {t('accountSettings.accountSection')}
            </Text>
            <View className="account-settings-meta">
              <View className="account-settings-meta-row">
                <Text className="account-settings-meta-label">{t('accountSettings.username')}</Text>
                <Text className="account-settings-meta-value">{profile.username}</Text>
              </View>
              <View className="account-settings-meta-row">
                <Text className="account-settings-meta-label">{t('accountSettings.email')}</Text>
                <Text className="account-settings-meta-value">
                  {profile.email || t('common.notAvailable')}
                </Text>
              </View>
              <View className="account-settings-meta-row">
                <Text className="account-settings-meta-label">{t('accountSettings.role')}</Text>
                <Text className="account-settings-meta-value">{roleLabel}</Text>
              </View>
              <View className="account-settings-meta-row">
                <Text className="account-settings-meta-label">
                  {t('accountSettings.createdAt')}
                </Text>
                <Text className="account-settings-meta-value">
                  {formatCreatedAt(profile.createdAt)}
                </Text>
              </View>
            </View>
          </View>

          {canBindEmail ? (
            <View className="account-settings-section">
              <Text className="account-settings-section-title">
                {t('accountSettings.bindSectionTitle')}
              </Text>
              <Text className="account-settings-help">{t('accountSettings.bindSectionHint')}</Text>
              <View className="account-settings-field">
                <Text className="account-settings-label">{t('accountSettings.email')}</Text>
                <Input
                  className="account-settings-input"
                  placeholderClass="account-settings-placeholder"
                  value={bindEmail}
                  placeholder={t('accountSettings.emailPlaceholder')}
                  onInput={event => setBindEmail(event.detail.value)}
                />
              </View>
              <View className="account-settings-field">
                <Text className="account-settings-label">{t('accountSettings.code')}</Text>
                <View className="account-settings-code-row">
                  <Input
                    className="account-settings-input"
                    placeholderClass="account-settings-placeholder"
                    value={bindCode}
                    maxlength={6}
                    placeholder={t('accountSettings.codePlaceholder')}
                    onInput={event => setBindCode(event.detail.value)}
                  />
                  <Button
                    className="account-settings-code-btn"
                    disabled={sendingCode || bindCountdown > 0}
                    loading={sendingCode}
                    onClick={handleSendBindCode}
                  >
                    {bindCountdown > 0 ? `${bindCountdown}s` : t('accountSettings.sendCode')}
                  </Button>
                </View>
              </View>
              <Button
                className="account-settings-save"
                disabled={binding}
                loading={binding}
                onClick={handleBindEmail}
              >
                {t('accountSettings.bindCta')}
              </Button>
            </View>
          ) : null}

          <Button
            className="account-settings-save"
            disabled={saving}
            loading={saving}
            onClick={handleSave}
          >
            {t(saving ? 'common.saving' : 'common.save')}
          </Button>
        </View>
      ) : null}
    </View>
  )
}
