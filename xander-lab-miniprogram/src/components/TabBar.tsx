import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Icon } from './Icon'

const items = [
  ['discover', '对话', '/pages/discover/index'],
  ['star', '计划', '/pages/favorites/index'],
  ['article', '博客', '/pages/articles/index'],
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
