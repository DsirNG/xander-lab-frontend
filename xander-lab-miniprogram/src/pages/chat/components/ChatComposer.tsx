import { Textarea, View } from '@tarojs/components'
import { Icon } from '@/components/Icon'

interface ChatComposerProps {
  value: string
  placeholder: string
  sendLabel: string
  stopLabel: string
  running: boolean
  creating: boolean
  home?: boolean
  onChange: (value: string) => void
  onSubmit: () => void
  onStop: () => void
}

export function ChatComposer({
  value,
  placeholder,
  sendLabel,
  stopLabel,
  running,
  creating,
  home = false,
  onChange,
  onSubmit,
  onStop,
}: ChatComposerProps) {
  const canSend = Boolean(value.trim())
  const busy = running || creating
  const state = busy ? 'busy' : canSend ? 'ready' : 'idle'

  const handleAction = () => {
    if (running) {
      onStop()
      return
    }
    if (!creating && canSend) onSubmit()
  }

  return (
    <View className={`chat-composer-dock ${home ? 'is-home' : ''}`}>
      <View className="chat-composer">
        <Textarea
          className="chat-composer-input"
          value={value}
          maxlength={4000}
          autoHeight
          adjustPosition
          disableDefaultPadding
          placeholder={placeholder}
          placeholderClass="chat-input-placeholder"
          ariaLabel={placeholder}
          onInput={event => onChange(event.detail.value)}
          confirmType="send"
          onConfirm={() => {
            if (!busy && canSend) onSubmit()
          }}
          cursorSpacing={24}
          showConfirmBar={false}
        />
        <View
          className="chat-send-hitbox"
          role="button"
          ariaRole="button"
          ariaLabel={running ? stopLabel : sendLabel}
          onClick={handleAction}
        >
          <View className={`chat-send-button ${state}`}>
            {running ? <View className="chat-stop" /> : <Icon name="send" />}
          </View>
        </View>
      </View>
    </View>
  )
}
