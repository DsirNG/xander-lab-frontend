import type { CSSProperties, ReactNode } from 'react'
import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useNavbarLayout } from '@/hooks/useNavbarLayout'
import { Icon } from './Icon'
import './NavBar.scss'

interface NavBarProps {
  title?: string
  showBack?: boolean
  /** 自定义返回行为，默认 Taro.navigateBack */
  onBack?: () => void
  /** 右侧插槽（垂直居中，与胶囊同一水平） */
  right?: ReactNode
  /** 左侧插槽（当没有返回键时展示） */
  left?: ReactNode
  background?: string
  color?: string
}

/**
 * 顶部导航：根据右上角胶囊与设备信息定位，
 * 内容区与胶囊同一水平，标题避开胶囊区域。
 */
export function NavBar({
  title = '',
  showBack = false,
  onBack,
  left,
  right,
  background,
  color,
}: NavBarProps) {
  const { statusBarHeight, contentHeight, navBarHeight, titleMaxWidth, rightSafeInset } =
    useNavbarLayout()

  const barStyle: CSSProperties = {
    paddingTop: statusBarHeight,
    height: navBarHeight,
    ...(background ? { background } : {}),
    ...(color ? { color } : {}),
  }

  return (
    <>
      {/* 占位：维持文档流，避免内容被固定在顶部的导航遮盖 */}
      <View style={{ height: navBarHeight }} />
      <View className="nav-bar" style={barStyle}>
        <View
          className="nav-bar-body"
          style={{ height: contentHeight, paddingRight: rightSafeInset }}
        >
          <View className="nav-bar-side nav-bar-side-left">
            {showBack ? (
              <View
                className="nav-bar-back"
                hoverClass="nav-bar-back--pressed"
                onClick={onBack ?? (() => Taro.navigateBack())}
              >
                <Icon name="back" />
              </View>
            ) : (
              left
            )}
          </View>
          <Text className="nav-bar-title" style={{ maxWidth: titleMaxWidth }}>
            {title}
          </Text>
          <View className="nav-bar-side nav-bar-side-right" style={{ maxWidth: titleMaxWidth }}>
            {right}
          </View>
        </View>
      </View>
    </>
  )
}
