import { Text, View } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { blogApi, type Article as ArticleModel } from '@/api/blog'
import { Icon } from '@/components/Icon'
import { PageHeader } from '@/components/PageHeader'
import './index.scss'

function ArticleContent({ content }: { content: string }) {
  const lines = content.split('\n')
  let inCode = false

  return (
    <View className="markdown-content">
      {lines.map((line, index) => {
        if (line.trim().startsWith('```')) {
          inCode = !inCode
          return null
        }
        if (inCode) {
          return (
            <Text className="code-line" key={`${index}-${line}`}>
              {line || ' '}
            </Text>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <Text className="article-h2" key={`${index}-${line}`}>
              {line.slice(3)}
            </Text>
          )
        }
        if (line.startsWith('# ')) {
          return (
            <Text className="article-h1" key={`${index}-${line}`}>
              {line.slice(2)}
            </Text>
          )
        }
        return (
          <Text className={line ? 'paragraph' : 'paragraph spacer'} key={`${index}-${line}`}>
            {line}
          </Text>
        )
      })}
    </View>
  )
}

export default function Article() {
  const { params } = useRouter()
  const [article, setArticle] = useState<ArticleModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const id = params.id

  useEffect(() => {
    if (!id) {
      setError('缺少文章 ID')
      setLoading(false)
      return
    }

    let active = true
    blogApi
      .getArticle(id)
      .then(data => {
        if (active) setArticle(data)
        blogApi.recordView(id).catch(() => undefined)
      })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : '文章加载失败')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  useShareAppMessage(() => ({
    title: article?.title || 'Xander Lab',
    path: `/pages/article/index?id=${id}`,
  }))

  return (
    <View className="article-page">
      <PageHeader title="文章详情" more />
      <View className="article-body">
        {loading ? <Text className="data-state">正在加载文章...</Text> : null}
        {error ? <Text className="data-state error">{error}</Text> : null}
        {article ? (
          <>
            <Text className="detail-title">{article.title}</Text>
            <View className="detail-meta">
              <View className="avatar-mini">X</View>
              <Text>{article.author}</Text>
              <Text>· {article.date}</Text>
              <Icon name="eye" />
              <Text>{article.views.toLocaleString()}</Text>
            </View>
            <View className="tags">
              {article.tags.map(tag => (
                <Text className="tag" key={tag}>
                  {tag}
                </Text>
              ))}
            </View>
            {article.summary ? <Text className="lead">{article.summary}</Text> : null}
            {article.content ? <ArticleContent content={article.content} /> : null}
          </>
        ) : null}
      </View>
      <View className="article-actions">
        <Text onClick={() => Taro.showToast({ title: '评论功能暂未开放', icon: 'none' })}>
          写下你的评论...
        </Text>
        <Text onClick={() => Taro.showToast({ title: '收藏功能暂未开放', icon: 'none' })}>
          ☆ 收藏
        </Text>
        <Text>分享</Text>
      </View>
    </View>
  )
}
