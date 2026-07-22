import { ScrollView, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import { blogApi, type Category } from '@/api/blog'
import { ArticleCard } from '@/components/ArticleCard'
import { Icon } from '@/components/Icon'
import { TabBar } from '@/components/TabBar'
import { useArticles } from '@/hooks/useArticles'
import './index.scss'

export default function Articles() {
  const [categories, setCategories] = useState<Category[]>([])
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState<'latest' | 'popular'>('latest')
  const { articles, loading, error } = useArticles({ category, size: 20 })

  const visibleArticles = useMemo(() => {
    if (sort === 'latest') return articles
    return [...articles].sort((left, right) => right.views - left.views)
  }, [articles, sort])

  useEffect(() => {
    blogApi
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  return (
    <View className="page articles-page">
      <View className="top-title">
        <Text className="page-title">全部文章</Text>
        <View onClick={() => Taro.navigateTo({ url: '/pages/search/index' })}>
          <Icon name="search" />
        </View>
      </View>
      <ScrollView scrollX showScrollbar={false} className="chips">
        <Text className={`chip ${category === '' ? 'active' : ''}`} onClick={() => setCategory('')}>
          全部
        </Text>
        {categories.map(item => {
          const value = item.code || item.name
          return (
            <Text
              className={`chip ${category === value ? 'active' : ''}`}
              key={value}
              onClick={() => setCategory(value)}
            >
              {item.name}
            </Text>
          )
        })}
      </ScrollView>
      <View className="segmented">
        <Text
          className={`segment ${sort === 'latest' ? 'active' : ''}`}
          onClick={() => setSort('latest')}
        >
          最新发布
        </Text>
        <Text
          className={`segment ${sort === 'popular' ? 'active' : ''}`}
          onClick={() => setSort('popular')}
        >
          最多阅读
        </Text>
      </View>
      {loading ? <Text className="data-state">正在加载文章...</Text> : null}
      {error ? <Text className="data-state error">{error}</Text> : null}
      {!loading && !error && articles.length === 0 ? (
        <Text className="data-state">暂无文章</Text>
      ) : null}
      {visibleArticles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
      <TabBar active="article" />
    </View>
  )
}
