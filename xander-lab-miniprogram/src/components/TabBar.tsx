import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Icon } from './Icon'

const items = [
  ['chat', '对话', '/pages/chat/index'],
  ['calendar', '计划', '/pages/plans/index'],
  ['article', '博客', '/pages/blog/index'],
  ['user', '我的', '/pages/profile/index'],
] as const

export function TabBar({ active }: { active: string }) {
  return (
    <View className="tab-bar-placeholder">
      <View className="tab-bar">
        {items.map(([icon, label, url]) => (
          <View
            className={`tab-item ${active === icon ? 'active' : ''}`}
            key={url}
            onClick={() => Taro.redirectTo({ url })}
          >
            <Icon name={icon as any} />
            <Text>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
