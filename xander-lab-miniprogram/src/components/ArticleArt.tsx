import { View, Text } from '@tarojs/components'
export function ArticleArt({ type }: { type: string }) {
  return (
    <View className={`article-art art-${type}`}>
      <View className="art-tile">
        <Text>
          {type === 'vue'
            ? 'V'
            : type === 'ai'
              ? 'AI'
              : type === 'shield'
                ? '✓'
                : type === 'flow'
                  ? '⇢'
                  : '</>'}
        </Text>
      </View>
    </View>
  )
}
