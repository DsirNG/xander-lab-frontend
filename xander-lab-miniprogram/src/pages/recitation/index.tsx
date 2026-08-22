import { Input, Text, Textarea, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { recitationApi, type RecitationMaterial } from '@/api/recitation'
import { NavBar } from '@/components/NavBar'
import { Button } from '@/components/ui/Button'
import { PageState } from '@/components/ui/PageState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { t } from '@/i18n'
import './index.scss'

export default function RecitationPage() {
  const [materials, setMaterials] = useState<RecitationMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const loadMaterials = async () => {
    try {
      setLoading(true)
      setMaterials(await recitationApi.listMaterials())
    } catch (error) {
      Taro.showToast({
        title: error instanceof Error ? error.message : t('recitation.loadFailed'),
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  useDidShow(() => {
    void loadMaterials()
  })

  const createMaterial = async () => {
    if (!title.trim() || !content.trim()) {
      Taro.showToast({ title: t('recitation.materialRequired'), icon: 'none' })
      return
    }
    try {
      setSaving(true)
      const material = await recitationApi.createMaterial(title.trim(), content.trim())
      setMaterials(current => [material, ...current])
      setTitle('')
      setContent('')
      Taro.showToast({ title: t('recitation.materialCreated'), icon: 'success' })
    } catch (error) {
      Taro.showToast({
        title: error instanceof Error ? error.message : t('recitation.createFailed'),
        icon: 'none',
      })
    } finally {
      setSaving(false)
    }
  }

  const openMaterial = (material: RecitationMaterial) => {
    Taro.navigateTo({ url: `/pages/recitation-practice/index?id=${material.id}` })
  }

  return (
    <View className="page recitation-page">
      <NavBar title={t('recitation.title')} showBack />
      <View className="recitation-content">
        <View className="recitation-form-card">
          <SectionHeader
            title={t('recitation.addMaterial')}
            description={t('recitation.addMaterialHint')}
          />
          <Input
            className="recitation-input"
            value={title}
            maxlength={100}
            placeholder={t('recitation.titlePlaceholder')}
            onInput={event => setTitle(event.detail.value)}
          />
          <Textarea
            className="recitation-textarea"
            value={content}
            maxlength={10000}
            placeholder={t('recitation.contentPlaceholder')}
            onInput={event => setContent(event.detail.value)}
          />
          <Button block disabled={saving} onClick={createMaterial}>
            {saving ? t('recitation.saving') : t('recitation.confirmMaterial')}
          </Button>
        </View>

        <SectionHeader title={t('recitation.myMaterials')} />
        {loading ? (
          <PageState kind="loading" title={t('common.loading')} />
        ) : materials.length === 0 ? (
          <PageState
            kind="empty"
            title={t('recitation.empty')}
            description={t('recitation.emptyHint')}
          />
        ) : (
          <View className="recitation-material-list">
            {materials.map(material => (
              <View
                key={material.id}
                className="recitation-material-row"
                hoverClass="recitation-material-row--pressed"
                onClick={() => openMaterial(material)}
              >
                <View className="recitation-material-main">
                  <Text className="recitation-material-title">{material.title}</Text>
                  <Text className="recitation-material-preview">{material.content}</Text>
                </View>
                <Text className="recitation-material-meta">
                  {t('recitation.characterCount', { count: material.characterCount })}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  )
}
