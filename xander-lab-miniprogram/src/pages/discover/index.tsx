import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { StatusBar } from '@/components/StatusBar'
import { Icon } from '@/components/Icon'
import { TabBar } from '@/components/TabBar'
import { ArticleCard } from '@/components/ArticleCard'
import { articles } from '@/data/articles'
import './index.scss'
export default function Discover() {
  return (
    <View className="page discover">
      <StatusBar />
      <View className="top-title">
        <Text className="brand">Xander Lab</Text>
        <View className="avatar">X</View>
      </View>
      <View className="search-box" onClick={() => Taro.navigateTo({ url: '/pages/search/index' })}>
        <Icon name="search" />
        <Text>搜索文章、标签或关键词</Text>
      </View>
      <ScrollView scrollX className="chips">
        {['全部', '前端', 'Vue', 'React', 'AI'].map((x, i) => (
          <Text className={`chip ${i === 0 ? 'active' : ''}`} key={x}>
            {x}
          </Text>
        ))}
      </ScrollView>
      <ArticleCard article={articles[0]} featured />
      <View className="section-title">
        <Text>最新文章</Text>
        <Text
          className="more-link"
          onClick={() => Taro.redirectTo({ url: '/pages/articles/index' })}
        >
          查看更多 〉
        </Text>
      </View>
      {articles.slice(0, 3).map(a => (
        <ArticleCard key={a.id} article={a} />
      ))}
      <TabBar active="discover" />
    </View>
  )
}
