import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { StatusBar } from '@/components/StatusBar'
import { Icon } from '@/components/Icon'
import { TabBar } from '@/components/TabBar'
import { ArticleCard } from '@/components/ArticleCard'
import { articles } from '@/data/articles'
export default function Articles() {
  return (
    <View className="page">
      <StatusBar />
      <View className="top-title">
        <Text className="page-title">全部文章</Text>
        <View onClick={() => Taro.navigateTo({ url: '/pages/search/index' })}>
          <Icon name="search" />
        </View>
      </View>
      <ScrollView scrollX className="chips">
        {['最新', '前端', 'Vue', 'React', 'AI', '工程化'].map((x, i) => (
          <Text className={`chip ${i === 0 ? 'active' : ''}`} key={x}>
            {x}
          </Text>
        ))}
      </ScrollView>
      <View className="segmented">
        <Text className="segment active">最新发布</Text>
        <Text className="segment">最多阅读</Text>
      </View>
      {articles.map(a => (
        <ArticleCard key={a.id} article={a} />
      ))}
      <TabBar active="article" />
    </View>
  )
}
