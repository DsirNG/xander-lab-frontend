import { Input, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { ArticleCard } from '@/components/ArticleCard'
import { Icon } from '@/components/Icon'
import { useArticles } from '@/hooks/useArticles'
import './index.scss'

export default function Search() {
  const [value, setValue] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setSearch(value.trim()), 350)
    return () => clearTimeout(timer)
  }, [value])

  const { articles, total, loading, error } = useArticles({ search, size: 20 })

  return (
    <View className="page search-page">
      <View className="search-head">
        <View onClick={() => Taro.navigateBack()}>
          <Icon name="back" />
        </View>
        <View className="search-input">
          <Icon name="search" />
          <Input
            value={value}
            focus
            placeholder="搜索文章、标签或关键词"
            onInput={event => setValue(event.detail.value)}
          />
          {value ? (
            <Text className="clear" onClick={() => setValue('')}>
              ×
            </Text>
          ) : null}
        </View>
        <Text onClick={() => Taro.navigateBack()}>取消</Text>
      </View>
      <Text className="search-label">{search ? `搜索结果 ${total}` : `全部文章 ${total}`}</Text>
      {loading ? <Text className="data-state">正在搜索...</Text> : null}
      {error ? <Text className="data-state error">{error}</Text> : null}
      {!loading && !error && articles.length === 0 ? (
        <Text className="data-state">没有找到相关文章</Text>
      ) : null}
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </View>
  )
}
