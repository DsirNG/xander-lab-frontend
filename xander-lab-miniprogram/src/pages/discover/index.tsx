import { ScrollView, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { blogApi, type Article } from '@/api/blog'
import { ArticleCard } from '@/components/ArticleCard'
import { Icon } from '@/components/Icon'
import { TabBar } from '@/components/TabBar'
import './index.scss'

export default function Discover() {
  const [articles, setArticles] = useState<Article[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([blogApi.getRecentArticles(4), blogApi.getPopularTags(5)])
      .then(([recentArticles, popularTags]) => {
        if (!active) return
        setArticles(recentArticles)
        setTags(popularTags.map(item => item.name))
      })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : '首页加载失败')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <View className="page discover">
      <View className="top-title">
        <Text className="brand">Xander Lab</Text>
        <View className="avatar">X</View>
      </View>
      <View className="search-box" onClick={() => Taro.navigateTo({ url: '/pages/search/index' })}>
        <Icon name="search" />
        <Text>搜索文章、标签或关键词</Text>
      </View>
      <ScrollView scrollX className="chips">
        {['全部', ...tags].map((tag, index) => (
          <Text className={`chip ${index === 0 ? 'active' : ''}`} key={tag}>
            {tag}
          </Text>
        ))}
      </ScrollView>
      {loading ? <Text className="data-state">正在加载文章...</Text> : null}
      {error ? <Text className="data-state error">{error}</Text> : null}
      {articles[0] ? <ArticleCard article={articles[0]} featured /> : null}
      <View className="section-title">
        <Text>最新文章</Text>
        <Text
          className="more-link"
          onClick={() => Taro.redirectTo({ url: '/pages/articles/index' })}
        >
          查看更多 〉
        </Text>
      </View>
      {articles.slice(1).map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
      <TabBar active="discover" />
    </View>
  )
}
