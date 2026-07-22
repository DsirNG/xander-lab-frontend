import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { StatusBar } from '@/components/StatusBar'
import { Icon } from '@/components/Icon'
import { ArticleCard } from '@/components/ArticleCard'
import { articles } from '@/data/articles'
import './index.scss'
export default function Search() {
  const [value, setValue] = useState('Vue3')
  return (
    <View className="page search-page">
      <StatusBar />
      <View className="search-head">
        <View onClick={() => Taro.navigateBack()}>
          <Icon name="back" />
        </View>
        <View className="search-input">
          <Icon name="search" />
          <Input value={value} focus onInput={e => setValue(e.detail.value)} />
          <Text className="clear" onClick={() => setValue('')}>
            ×
          </Text>
        </View>
        <Text onClick={() => Taro.navigateBack()}>取消</Text>
      </View>
      <Text className="search-label">搜索建议</Text>
      {['Vue3 性能优化', 'Vue3 组件通信', 'Vue3 源码'].map(x => (
        <View className="suggestion" key={x}>
          <Icon name="search" />
          <Text>
            <Text className="keyword">Vue3</Text>
            {x.slice(4)}
          </Text>
          <Text>↖</Text>
        </View>
      ))}
      <Text className="search-label">搜索结果 12</Text>
      {articles
        .filter(a => a.id === 'vue' || a.id === 'flow' || a.id === 'deploy')
        .map(a => (
          <ArticleCard key={a.id} article={a} />
        ))}
    </View>
  )
}
