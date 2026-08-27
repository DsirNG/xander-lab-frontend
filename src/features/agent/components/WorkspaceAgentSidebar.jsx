import { useMemo, useState } from 'react';
import { CheckSquare, ChevronDown, Loader2, MessageCircle, PanelLeftClose, PanelLeftOpen, Pin, PinOff, Plus, Search, X } from 'lucide-react';
import Modal from '@components/common/Modal';

/** 后端返回 'yyyy-MM-dd HH:mm:ss'，补上 T 以免部分浏览器解析失败导致排序错乱。 */
const parseSessionTime = (value) => {
  if (!value) return 0;
  const time = new Date(typeof value === 'string' ? value.replace(' ', 'T') : value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const formatSessionTime = (dateStr, t) => {
  const time = parseSessionTime(dateStr);
  if (!time) return '';
  const date = new Date(time);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;

  if (time >= todayStart) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (time >= yesterdayStart) return t('workspace.agent.groups.yesterday', '昨天');
  return date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
};

const SessionItem = ({ session, active, onSelect, onTogglePin, t }) => {
  const formattedTime = formatSessionTime(session.updatedAt || session.createdAt, t);
  const running = session.status === 'running';
  // 蓝点只提醒“不在这个会话里”的完成结果；正在看的会话直接看到结果本身。
  const unread = !running && !active && Boolean(session.unread);
  const pinned = Number(session.isPinned) === 1;
  const statusLabel = running
    ? t('workspace.agent.status.generating', '生成中')
    : t('workspace.agent.status.done', '已生成完成');

  return (
    <div
      className={`group relative flex w-full items-center rounded-xl transition-colors ${
        active ? 'bg-[#f2f1fd]' : 'hover:bg-[#f7f6fc]'
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(session.id)}
        className="flex min-w-0 flex-1 items-center gap-2 py-2 pl-2.5 text-left"
      >
        {/* 固定宽度的状态位：转圈 / 蓝点 / 占位，保证标题左边缘始终对齐 */}
        <span
          className="grid h-4 w-4 shrink-0 place-items-center"
          {...(running || unread ? { role: 'img', 'aria-label': statusLabel, title: statusLabel } : { 'aria-hidden': true })}
        >
          {running ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#9ea3b9]" /> : null}
          {unread ? <span className="h-2 w-2 rounded-full bg-[#3b82f6]" /> : null}
        </span>
        <span className={`truncate text-sm font-normal ${active ? 'text-[#6055f6]' : 'text-[#0d0d0d]'}`}>
          {session.title || t('blog.agent.untitled', '未命名对话')}
        </span>
      </button>
      <div className="flex shrink-0 items-center pr-2.5 pl-2">
        {formattedTime ? (
          <span className="text-xs text-[#9ea3b9] group-hover:hidden">{formattedTime}</span>
        ) : null}
        <button
          type="button"
          onClick={() => onTogglePin(session.id, !pinned)}
          className="hidden h-6 w-6 place-items-center rounded-lg text-[#6c7293] transition-colors group-hover:grid hover:bg-[#e8e6fb] hover:text-[#6055f6]"
          title={pinned ? t('workspace.agent.unpin', '取消置顶') : t('workspace.agent.pin', '置顶')}
          aria-label={pinned ? t('workspace.agent.unpin', '取消置顶') : t('workspace.agent.pin', '置顶')}
        >
          {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
};

const ConversationSearchModal = ({ open, sessions, onClose, onSelect, t }) => {
  const [query, setQuery] = useState('');
  const filteredSessions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return sessions;
    return sessions.filter(
      (session) =>
        (session.title || '').toLowerCase().includes(normalizedQuery) ||
        (session.lastMessage || session.summary || '').toLowerCase().includes(normalizedQuery),
    );
  }, [query, sessions]);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal
      isOpen={open}
      onClose={close}
      title={t('blog.agentChat.searchPlaceholder', '搜索会话')}
      width="max-w-lg"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-[#ececf4] px-3.5 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-[#8e94aa]" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('blog.agentChat.searchPlaceholder', '搜索会话...')}
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-sm text-[#111426] outline-none placeholder:text-[#a0a5ba]"
          />
          {query ? (
            <button type="button" onClick={() => setQuery('')}>
              <X className="h-4 w-4 text-[#8e94aa] hover:text-[#111426]" />
            </button>
          ) : null}
        </div>

        <div className="custom-scrollbar max-h-[50vh] space-y-1 overflow-y-auto pr-1">
          <div className="px-1 py-1 text-xs font-semibold text-[#8e94aa]">
            {t('blog.agentChat.recentChats', '最近聊天')}
          </div>
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => {
                  close();
                  onSelect(session.id);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-[#f2f1fd]"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f0effe] text-[#6055f6]">
                  <CheckSquare className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-[#111426]">
                    {session.title || t('blog.agent.untitled', '未命名对话')}
                  </div>
                  {session.lastMessage || session.summary ? (
                    <div className="truncate text-xs text-[#8e94aa]">{session.lastMessage || session.summary}</div>
                  ) : null}
                </div>
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-[#8e94aa]">
              {query
                ? t('blog.agentChat.searchNoMatches', '没有找到匹配的会话')
                : t('blog.agentChat.noSessions', '暂无会话记录')}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

const CollapsedSidebarRail = ({ onExpand, onNewConversation, onSearch, t }) => (
  <aside className="absolute inset-y-0 left-0 z-20 flex w-16 flex-col items-center bg-[#fdfdfe] px-3 py-4">
    <button
      type="button"
      onClick={onExpand}
      className="group relative grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors hover:bg-[#f7f6fc]"
      title={t('workspace.agent.expandDrawer', '展开对话框')}
      aria-label={t('workspace.agent.expandDrawer', '展开对话框')}
    >
      {/*<img*/}
      {/*  src="/assets/workspace/workspace-logo.svg"*/}
      {/*  alt="DinQor AI Logo"*/}
      {/*  className="h-8 w-8 object-contain transition-opacity group-hover:opacity-0 group-focus-visible:opacity-0"*/}
      {/*/>*/}
      {/*<PanelLeftOpen className="absolute h-5 w-5 text-[#6055f6] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />*/}
      <PanelLeftOpen className="absolute h-5 w-5 text-[#6c7293] transition-colors hover:text-[#6055f6]" />
    </button>

    <div className="mt-4 flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onNewConversation}
        className="grid h-9 w-9 place-items-center rounded-xl bg-[#5d55fa] text-white transition-colors hover:bg-[#4d44f3]"
        title={t('workspace.agent.newConversation', '新建对话')}
        aria-label={t('workspace.agent.newConversation', '新建对话')}
      >
        <Plus className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onSearch}
        className="grid h-9 w-9 place-items-center rounded-xl text-[#6c7293] transition-colors hover:bg-[#f2f1fd] hover:text-[#6055f6]"
        title={t('blog.agentChat.searchPlaceholder', '搜索会话...')}
        aria-label={t('blog.agentChat.searchPlaceholder', '搜索会话...')}
      >
        <Search className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onExpand}
        className="grid h-9 w-9 place-items-center rounded-xl text-[#6c7293] transition-colors hover:bg-[#f2f1fd] hover:text-[#6055f6]"
        title={t('workspace.agent.expandDrawer', '展开对话框')}
        aria-label={t('workspace.agent.expandDrawer', '展开对话框')}
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    </div>
  </aside>
);

const WorkspaceAgentSidebar = ({
  open,
  sessions,
  activeConversationId,
  onOpenChange,
  onNewConversation,
  onSelectConversation,
  onTogglePin,
  t,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedPinned, setExpandedPinned] = useState(false);

  // 置顶与普通两组，组内各自按时间倒序；本地排序让置顶/发起对话立刻归位。
  const { pinnedSessions, recentSessions } = useMemo(() => {
    const byTimeDesc = (a, b) => (
      parseSessionTime(b.updatedAt || b.createdAt) - parseSessionTime(a.updatedAt || a.createdAt)
    );
    return {
      pinnedSessions: sessions.filter((session) => Number(session.isPinned) === 1).sort(byTimeDesc),
      recentSessions: sessions.filter((session) => Number(session.isPinned) !== 1).sort(byTimeDesc),
    };
  }, [sessions]);

  const visiblePinnedSessions = expandedPinned ? pinnedSessions : pinnedSessions.slice(0, 3);
  const hiddenPinnedCount = pinnedSessions.length - visiblePinnedSessions.length;

  return (
    <>
      <div className="relative h-full w-16 shrink-0" aria-hidden="true" />
      {open ? (
        <aside className="absolute inset-y-0 left-0 z-20 flex w-[250px] flex-col overflow-hidden border-r border-[#ececf4] bg-[#fcfcfd] p-4 shadow-[8px_0_24px_rgba(17,20,38,0.06)]">
        <div className="flex h-10 shrink-0 items-center">
          {/*<div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl">*/}
          {/*  <img*/}
          {/*    src="/assets/workspace/workspace-logo.svg"*/}
          {/*    alt="DinQor AI Logo"*/}
          {/*    className="h-8 w-8 object-contain"*/}
          {/*  />*/}
          {/*</div>*/}

          <div className="ml-2 flex min-w-0 flex-1 items-center">
            <div className="min-w-0 flex-1 truncate text-title text-[#111426]">
              {t('workspace.agent.drawerTitle', '')}
            </div>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#6c7293] transition-colors hover:bg-[#f7f6fc]"
              title={t('blog.agentChat.searchPlaceholder', '搜索会话...')}
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#6c7293] transition-colors hover:bg-[#f7f6fc]"
              title={t('workspace.agent.collapseDrawer', '收起对话框')}
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex h-9 shrink-0 items-center">
          <button
            type="button"
            onClick={onNewConversation}
            className="flex h-9 w-full items-center rounded-xl bg-[#5d55fa] text-white transition-colors hover:bg-[#4d44f3]"
            title={t('workspace.agent.newConversation', '新建对话')}
          >
            <span className="grid h-9 w-8 shrink-0 place-items-center">
              <Plus className="h-5 w-5" />
            </span>
            <span className="whitespace-nowrap text-sm font-semibold">
              {t('workspace.agent.newConversation', '新建对话')}
            </span>
          </button>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          {pinnedSessions.length > 0 ? (
            <div className="space-y-1">
              <div className="mb-2 px-1 text-xs font-semibold text-[#8e94aa]">
                {t('workspace.agent.groups.pinned', '置顶')}
              </div>
              {visiblePinnedSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  active={String(activeConversationId) === String(session.id)}
                  onSelect={onSelectConversation}
                  onTogglePin={onTogglePin}
                  t={t}
                />
              ))}
              {hiddenPinnedCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setExpandedPinned(true)}
                  className="my-3 flex w-full items-center justify-center gap-1.5 text-xs font-medium text-[#6055f6] transition-opacity hover:opacity-80"
                >
                  <span>{t('workspace.agent.loadMore', { count: hiddenPinnedCount })}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          ) : null}

          {recentSessions.length > 0 ? (
            <div className="mt-4 space-y-1">
              <div className="mb-2 px-1 text-xs font-semibold text-[#8e94aa]">
                {t('workspace.agent.groups.recent', '最近')}
              </div>
              {recentSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  active={String(activeConversationId) === String(session.id)}
                  onSelect={onSelectConversation}
                  onTogglePin={onTogglePin}
                  t={t}
                />
              ))}
            </div>
          ) : null}

          {pinnedSessions.length === 0 && recentSessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#a0a5ba]">
              {t('blog.agent.noConversations', '暂无会话记录')}
            </div>
          ) : null}
        </div>
        </aside>
      ) : (
        <CollapsedSidebarRail
          onExpand={() => onOpenChange(true)}
          onNewConversation={onNewConversation}
          onSearch={() => setSearchOpen(true)}
          t={t}
        />
      )}

      <ConversationSearchModal
        open={searchOpen}
        sessions={sessions}
        onClose={() => setSearchOpen(false)}
        onSelect={onSelectConversation}
        t={t}
      />
    </>
  );
};

export default WorkspaceAgentSidebar;
