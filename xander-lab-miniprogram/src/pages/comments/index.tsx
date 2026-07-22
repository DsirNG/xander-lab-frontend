import { Text, View } from '@tarojs/components'
import { PageHeader } from '@/components/PageHeader'
import './index.scss'

export default function Comments() {
  return (
    <View className="comments-page">
      <PageHeader title="全部评论" more />
      <View className="empty-state">
        <Text className="empty-title">评论功能暂未开放</Text>
        <Text className="empty-desc">PC 端当前没有评论接口，因此这里不再展示模拟评论。</Text>
      </View>
    </View>
  )
}
