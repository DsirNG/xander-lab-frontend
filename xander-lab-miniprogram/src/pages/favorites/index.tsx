import { Text, View } from '@tarojs/components'
import { TabBar } from '@/components/TabBar'

export default function Favorites() {
  return (
    <View className="page">
      <View className="top-title">
        <Text className="page-title">我的收藏</Text>
      </View>
      <View className="segmented">
        <Text className="segment active">文章</Text>
        <Text className="segment">专题</Text>
      </View>
      <View className="empty-state">
        <Text className="empty-title">收藏功能暂未开放</Text>
        <Text className="empty-desc">PC 端目前没有收藏接口，这里不再展示模拟文章。</Text>
      </View>
      <TabBar active="star" />
    </View>
  )
}
