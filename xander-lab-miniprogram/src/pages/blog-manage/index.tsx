import { Text, View } from '@tarojs/components'
import Taro, { useDidShow, useReachBottom } from '@tarojs/taro'
import { useCallback, useState } from 'react'
import { blogApi, type Article } from '@/api/blog'
import { Icon } from '@/components/Icon'
import { BLOG_STATUS_TEXT } from '@/utils/format'
import './index.scss'

const STATUS_OPTIONS: Array<{ label: string; value: number | undefined }> = [
  { label: '全部', value: undefined },
  { label: '草稿', value: 0 },
  { label: '已发布', value: 1 },
  { label: '回收站', value: -1 },
]

function showToast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

export default function BlogManage() {
  const [status, setStatus] = useState<number | undefined>(undefined)
  const [articles, setArticles] = useState<Article[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadedOnce, setLoadedOnce] = useState(false)

  const load = useCallback(
    async (targetPage: number, append: boolean) => {
      setLoading(true)
      try {
        const result = await blogApi.getMyArticles({
          status,
          page: targetPage,
          size: 10,
        })
        setArticles(prev => (append ? [...prev, ...result.records] : result.records))
        setTotal(result.total)
        setPage(targetPage)
      } catch (e) {
        showToast(e instanceof Error ? e.message : '文章列表加载失败')
      } finally {
        setLoading(false)
        setLoadedOnce(true)
      }
    },
    [status],
  )

  useDidShow(() => {
    load(1, false)
  })

  useReachBottom(() => {
    if (!loading && articles.length < total) load(page + 1, true)
  })

  const switchStatus = (value: number | undefined) => {
    setStatus(value)
    setArticles([])
    setPage(1)
    setLoadedOnce(false)
    load(1, false)
  }

  const changeStatus = async (article: Article, target: number) => {
    try {
      await blogApi.updateArticleStatus(article.id, target)
      showToast(target === 1 ? '已发布' : target === 0 ? '已转为草稿' : '已移入回收站')
      load(1, false)
    } catch (e) {
      showToast(e instanceof Error ? e.message : '操作失败')
    }
  }

  const removeArticle = async (article: Article, permanent: boolean) => {
    const confirmed = await Taro.showModal({
      title: permanent ? '永久删除' : '删除文章',
      content: permanent ? '永久删除后不可恢复，确定继续吗？' : '文章将移入回收站，可随时恢复',
      confirmColor: '#d14343',
    })
    if (!confirmed.confirm) return
    try {
      if (permanent) {
        await blogApi.permanentlyDeleteArticle(article.id)
        showToast('已永久删除')
      } else {
        await blogApi.deleteArticle(article.id)
        showToast('已移入回收站')
      }
      load(1, false)
    } catch (e) {
      showToast(e instanceof Error ? e.message : '操作失败')
    }
  }

  const gotoDetail = (article: Article) => {
    if (article.status === 1) {
      Taro.navigateTo({ url: `/pages/blog-detail/index?id=${article.id}` })
    }
  }

  return (
    <View className="detail-page">
      <View className="sub-nav">
        <View className="nav-back" onClick={() => Taro.navigateBack()}>
          <Icon name="back" />
        </View>
        <Text className="sub-nav-title">我的博客</Text>
      </View>

      <View className="segmented manage-segmented">
        {STATUS_OPTIONS.map(option => (
          <Text
            key={option.label}
            className={`segment ${status === option.value ? 'active' : ''}`}
            onClick={() => switchStatus(option.value)}
          >
            {option.label}
          </Text>
        ))}
      </View>

      {loading && articles.length === 0 ? <Text className="data-state">正在加载...</Text> : null}
      {loadedOnce && !loading && articles.length === 0 ? (
        <View className="empty-state">
          <Text className="empty-title">暂无文章</Text>
          <Text className="empty-desc">去写一篇新文章吧</Text>
          <View
            className="empty-btn"
            onClick={() => Taro.navigateTo({ url: '/pages/publish/index' })}
          >
            去发文
          </View>
        </View>
      ) : null}

      {articles.map(article => (
        <View className="manage-card" key={article.id} onClick={() => gotoDetail(article)}>
          <View className="manage-head">
            <Text className="manage-title">{article.title || '(无标题)'}</Text>
            <Text className="badge badge-gray">
              {BLOG_STATUS_TEXT[article.status ?? 1] || '未知'}
            </Text>
          </View>
          <View className="manage-meta">
            {article.categoryName ? <Text>{article.categoryName}</Text> : null}
            <Text>{article.date}</Text>
            {article.views != null ? <Text>{article.views} 阅读</Text> : null}
          </View>
          <View className="manage-actions" onClick={e => e.stopPropagation()}>
            <View
              className="manage-btn"
              onClick={() => Taro.navigateTo({ url: `/pages/publish/index?id=${article.id}` })}
            >
              编辑
            </View>
            {article.status === 0 ? (
              <View className="manage-btn primary" onClick={() => changeStatus(article, 1)}>
                发布
              </View>
            ) : null}
            {article.status === 1 ? (
              <View className="manage-btn" onClick={() => changeStatus(article, 0)}>
                转为草稿
              </View>
            ) : null}
            {article.status === -1 ? (
              <>
                <View className="manage-btn" onClick={() => changeStatus(article, 0)}>
                  恢复
                </View>
                <View className="manage-btn danger" onClick={() => removeArticle(article, true)}>
                  彻底删除
                </View>
              </>
            ) : (
              <View className="manage-btn danger" onClick={() => removeArticle(article, false)}>
                删除
              </View>
            )}
          </View>
        </View>
      ))}
      {loading && articles.length > 0 ? <Text className="data-state">加载中...</Text> : null}
      {loadedOnce && !loading && articles.length > 0 && articles.length >= total ? (
        <Text className="data-state">已展示全部文章</Text>
      ) : null}
    </View>
  )
}
