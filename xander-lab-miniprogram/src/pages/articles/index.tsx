import { ScrollView, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { blogApi, type Category } from '@/api/blog'
import { ArticleCard } from '@/components/ArticleCard'
import { Icon } from '@/components/Icon'
import { TabBar } from '@/components/TabBar'
import { useArticles } from '@/hooks/useArticles'
import './index.scss'

export default function Articles() {
  const [categories, setCategories] = useState<Category[]>([])
  const [category, setCategory] = useState('')
  const { articles, total, loading, error } = useArticles({ category, size: 20 })

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
      <ScrollView scrollX className="chips">
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
        <Text className="segment active">最新发布 · {total}</Text>
        <Text className="segment">真实文章</Text>
      </View>
      {loading ? <Text className="data-state">正在加载文章...</Text> : null}
      {error ? <Text className="data-state error">{error}</Text> : null}
      {!loading && !error && articles.length === 0 ? (
        <Text className="data-state">暂无文章</Text>
      ) : null}
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
      <TabBar active="article" />
    </View>
  )
}
