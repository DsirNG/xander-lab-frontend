import { View, Text } from '@tarojs/components';import Taro from '@tarojs/taro';import { Icon } from './Icon'
const items=[['discover','发现','/pages/discover/index'],['article','文章','/pages/articles/index'],['star','收藏','/pages/favorites/index'],['user','我的','/pages/profile/index']] as const
export function TabBar({active}:{active:string}){return <View className='tab-bar'>{items.map(([icon,label,url])=><View className={`tab-item ${active===icon?'active':''}`} key={url} onClick={()=>Taro.redirectTo({url})}><Icon name={icon}/><Text>{label}</Text></View>)}</View>}
