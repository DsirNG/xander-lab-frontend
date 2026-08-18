import { ScrollView, Text, View, Input } from '@tarojs/components'
import { Icon } from '@/components/Icon'
import { formatDateTime } from '@/utils/format'
import type { AgentConversation } from '@/api/agent'
import type { UserInfo } from '@/store/user'
import { useState } from 'react'

interface ChatDrawerProps {
  visible: boolean
  onClose: () => void
  conversations: AgentConversation[]
  activeId: number | null
  onSelect: (id: number) => void
  onNewChat: () => void
  user: UserInfo | null
}

const GLOBAL_MENUS = [
  { name: '对话列表', icon: 'chat', active: true },
  { name: '智能体', icon: 'user' },
  { name: '知识库', icon: 'article' },
  { name: '定时任务', icon: 'clock' },
  { name: '插件中心', icon: 'discover' },
  { name: '设置', icon: 'more' },
]

export function ChatDrawer({
  visible,
  onClose,
  conversations,
  activeId,
  onSelect,
  onNewChat,
  user,
}: ChatDrawerProps) {
  const [keyword, setKeyword] = useState('')

  const filteredConversations = keyword
    ? conversations.filter(c => c.title.toLowerCase().includes(keyword.toLowerCase()))
    : conversations

  return (
    <View className={`chat-drawer-mask ${visible ? 'show' : ''}`} onClick={onClose}>
      <View
        className={`chat-drawer-content ${visible ? 'show' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <View className="drawer-header">
          <View className="drawer-brand">
            <View className="drawer-logo">
              <Icon name="play" />
            </View>
            <Text className="drawer-title">DinQor</Text>
          </View>
          <View className="drawer-edit-btn" onClick={() => { onNewChat(); onClose() }}>
            <Icon name="edit" />
          </View>
        </View>

        <View className="drawer-new-chat-wrap">
          <View className="drawer-new-chat-btn" onClick={() => { onNewChat(); onClose() }}>
            <Icon name="plus" />
            <Text>新建对话</Text>
          </View>
        </View>

        <View className="drawer-search-wrap">
          <View className="drawer-search-box">
            <Icon name="search" />
            <Input
              className="drawer-search-input"
              placeholder="搜索对话"
              placeholderClass="drawer-search-placeholder"
              value={keyword}
              onInput={e => setKeyword(e.detail.value)}
            />
          </View>
        </View>

        <ScrollView scrollY className="drawer-scroll">
          <View className="drawer-menu-list">
            {GLOBAL_MENUS.map(menu => (
              <View key={menu.name} className={`drawer-menu-item ${menu.active ? 'active' : ''}`}>
                <Icon name={menu.icon as any} />
                <Text>{menu.name}</Text>
              </View>
            ))}
          </View>

          <View className="drawer-recent-section">
            <Text className="drawer-recent-title">最近对话</Text>
            <View className="drawer-recent-list">
              {filteredConversations.map(conversation => (
                <View
                  key={conversation.id}
                  className={`drawer-chat-item ${activeId === conversation.id ? 'active' : ''}`}
                  onClick={() => {
                    onSelect(conversation.id)
                    onClose()
                  }}
                >
                  <Icon name="chat" className="chat-item-icon" />
                  <View className="chat-item-info">
                    <Text className="chat-item-title">{conversation.title}</Text>
                    <Text className="chat-item-desc">
                      {conversation.status === 'running' ? '执行中...' : '新对话'}
                    </Text>
                  </View>
                  <View className="chat-item-meta">
                    <Text className="chat-item-time">{formatDateTime(conversation.updatedAt).split(' ')[1] || '昨天'}</Text>
                    <Icon name="more" className="chat-item-more" />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {user ? (
          <View className="drawer-footer">
            <View className="drawer-user-avatar">
              <Icon name="user" />
            </View>
            <Text className="drawer-user-name">{user.nickname || '用户'}</Text>
            <View className="drawer-user-badge">专业版</View>
            <Icon name="right" className="drawer-user-arrow" />
          </View>
        ) : null}
      </View>
    </View>
  )
}
