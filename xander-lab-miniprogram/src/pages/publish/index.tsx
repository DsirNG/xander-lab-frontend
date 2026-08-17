import { Button, Input, Picker, Text, Textarea, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { blogApi, type Category } from '@/api/blog'
import { Icon } from '@/components/Icon'
import { ensureLogin } from '@/store/user'
import './index.scss'

function showToast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

export default function Publish() {
  const { params } = useRouter()
  const editId = params.id ? Number(params.id) : null

  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    blogApi
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    if (!editId) return
    let active = true
    blogApi
      .getMyArticle(editId)
      .then(article => {
        if (!active) return
        setTitle(article.title)
        setSummary(article.summary || '')
        setCategoryId(article.category ? Number(article.category) : undefined)
        setTags((article.tags || []).join(', '))
        setContent(article.content || '')
      })
      .catch(e => showToast(e instanceof Error ? e.message : '文章加载失败'))
    return () => {
      active = false
    }
  }, [editId])

  const submit = async (publish: boolean) => {
    if (!ensureLogin()) return
    if (!title.trim()) {
      showToast('请输入标题')
      return
    }
    if (publish && !content.trim()) {
      showToast('正文不能为空')
      return
    }
    if (publish && !categoryId) {
      showToast('请选择分类')
      return
    }
    if (saving) return
    setSaving(true)
    const payload = {
      title: title.trim(),
      summary: summary.trim() || undefined,
      content,
      categoryId,
      coverImage: undefined,
      tags: tags
        .split(/[,，]/)
        .map(item => item.trim())
        .filter(Boolean),
      publish,
    }
    try {
      if (editId) {
        await blogApi.updateArticle(editId, payload)
      } else {
        await blogApi.createArticle(payload)
      }
      showToast(publish ? '发布成功' : '草稿已保存')
      setTimeout(() => Taro.navigateBack(), 700)
    } catch (e) {
      showToast(e instanceof Error ? e.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const categoryIndex = categoryId
    ? Math.max(
        0,
        categories.findIndex(item => Number(item.id) === Number(categoryId)),
      )
    : -1

  return (
    <View className="publish-page">
      <View className="sub-nav">
        <View className="nav-back" onClick={() => Taro.navigateBack()}>
          <Icon name="back" />
        </View>
        <Text className="sub-nav-title">{editId ? '编辑文章' : '发布文章'}</Text>
      </View>

      {editId ? <Text className="data-state">编辑模式</Text> : null}
      <View className="form-item">
        <Text className="form-label">标题 *</Text>
        <Input
          className="form-input"
          placeholder="请输入文章标题"
          value={title}
          maxlength={120}
          onInput={e => setTitle(e.detail.value)}
        />
      </View>
      <View className="form-item">
        <Text className="form-label">分类 *</Text>
        <Picker
          mode="selector"
          range={categories.map(item => item.name)}
          value={categoryIndex < 0 ? 0 : categoryIndex}
          onChange={e => {
            const index = Number(e.detail.value)
            const item = categories[index]
            if (item) setCategoryId(Number(item.id))
          }}
        >
          <View className="form-input picker-value">
            <Text>
              {categories[categoryIndex]?.name || (categories.length ? '请选择分类' : '暂无分类')}
            </Text>
            <Text className="picker-arrow">›</Text>
          </View>
        </Picker>
      </View>
      <View className="form-item">
        <Text className="form-label">标签（逗号分隔）</Text>
        <Input
          className="form-input"
          placeholder="JavaScript, 前端"
          value={tags}
          onInput={e => setTags(e.detail.value)}
        />
      </View>
      <View className="form-item">
        <Text className="form-label">摘要（可选）</Text>
        <Textarea
          className="form-textarea form-textarea-summary"
          placeholder="一句话概括文章内容"
          value={summary}
          maxlength={300}
          onInput={e => setSummary(e.detail.value)}
        />
      </View>
      <View className="form-item">
        <Text className="form-label">正文（Markdown）*</Text>
        <Textarea
          className="form-textarea form-textarea-content"
          placeholder={'# 标题\n\n正文内容，支持 Markdown 语法...'}
          value={content}
          onInput={e => setContent(e.detail.value)}
        />
      </View>

      <View className="publish-actions">
        <Button
          className="btn btn-ghost action-btn"
          loading={saving}
          disabled={saving}
          onClick={() => submit(false)}
        >
          存草稿
        </Button>
        <Button
          className="btn btn-primary action-btn"
          loading={saving}
          disabled={saving}
          onClick={() => submit(true)}
        >
          {editId ? '更新发布' : '发布'}
        </Button>
      </View>
    </View>
  )
}
