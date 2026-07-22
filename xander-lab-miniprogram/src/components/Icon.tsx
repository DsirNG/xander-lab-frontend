import { Image } from '@tarojs/components'
const icons = {
  discover: require('@/assets/icons/discover.svg'),
  article: require('@/assets/icons/article.svg'),
  star: require('@/assets/icons/star.svg'),
  user: require('@/assets/icons/user.svg'),
  search: require('@/assets/icons/search.svg'),
  eye: require('@/assets/icons/eye.svg'),
  back: require('@/assets/icons/back.svg'),
  more: require('@/assets/icons/more.svg'),
}
export function Icon({ name, className = '' }: { name: keyof typeof icons; className?: string }) {
  return <Image className={`icon ${className}`} src={icons[name]} mode="aspectFit" />
}
