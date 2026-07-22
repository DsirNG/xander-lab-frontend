import { Text, View } from '@tarojs/components'
import { ArticleCard } from '@/components/ArticleCard'
import { PageHeader } from '@/components/PageHeader'
import { useArticles } from '@/hooks/useArticles'
import './index.scss'

export default function Topic() {
  const { articles, total, loading, error } = useArticles({ category: 'frontend', size: 20 })

  return (
    <View className="topic-page">
      <PageHeader title="前端专题" />
      <View className="topic-hero text-only">
        <View>
          <Text className="topic-name">前端开发</Text>
          <Text className="topic-desc">记录前端技术、工程实践与设计思考</Text>
          <Text className="topic-count">{total} 篇真实文章</Text>
        </View>
      </View>
      <View className="segmented">
        <Text className="segment active">最新</Text>
        <Text className="segment">来自 PC 端接口</Text>
      </View>
      <View className="topic-list">
        {loading ? <Text className="data-state">正在加载文章...</Text> : null}
        {error ? <Text className="data-state error">{error}</Text> : null}
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </View>
    </View>
  )
}
