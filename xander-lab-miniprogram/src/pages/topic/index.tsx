import { View, Text } from '@tarojs/components'
import { PageHeader } from '@/components/PageHeader'
import { ArticleCard } from '@/components/ArticleCard'
import { articles } from '@/data/articles'
import './index.scss'
export default function Topic() {
  return (
    <View className="topic-page">
      <PageHeader title="前端专题" />
      <View className="topic-hero">
        <View className="topic-art">&lt;/&gt;</View>
        <View>
          <Text className="topic-name">前端开发</Text>
          <Text className="topic-desc">记录前端技术、工程实践与设计思考</Text>
          <Text className="topic-count">42 篇文章　·　1.2k 订阅</Text>
        </View>
        <Text className="subscribe">订阅</Text>
      </View>
      <View className="segmented">
        <Text className="segment active">最新</Text>
        <Text className="segment">热门</Text>
      </View>
      <View className="topic-list">
        {articles.map(a => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </View>
    </View>
  )
}
