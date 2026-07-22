import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Icon } from './Icon'

export function PageHeader({ title, more = false }: { title: string; more?: boolean }) {
  return (
    <>

      <View className="page-header">
        <View onClick={() => Taro.navigateBack()}>
          <Icon name="back" />
        </View>
        <Text>{title}</Text>
        {more ? <Icon name="more" /> : <View className="icon" />}
      </View>
    </>
  )
}
