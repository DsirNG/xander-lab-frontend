import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  FileText,
  KeyRound,
  Mail,
  Plug,
  Settings2,
  Shield,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react';
import Modal from '@components/common/Modal';
import McpAuthorizationPanel from '@features/profile/components/McpAuthorizationPanel';

const TABS = [
  { id: 'account', icon: UserRound },
  { id: 'security', icon: Shield },
  { id: 'notifications', icon: Bell },
  { id: 'templates', icon: Mail },
  { id: 'history', icon: FileText },
  { id: 'apiKeys', icon: KeyRound },
  { id: 'mcp', icon: Plug },
  { id: 'preferences', icon: SlidersHorizontal },
];

const ENABLED_TABS = ['mcp'];

const ProfileModal = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('mcp');

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={t('workspace.settings')}
      width="max-w-4xl"
    >
      <div className="flex min-h-[420px] flex-col gap-4 lg:flex-row lg:gap-6">
        {/* 设置分类导航：移动端横向滚动，桌面端左侧竖排 */}
        <nav
          className="flex shrink-0 gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1 lg:w-44 lg:flex-col lg:overflow-y-auto"
          aria-label={t('workspace.settings')}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const enabled = ENABLED_TABS.includes(tab.id);
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={!enabled}
                onClick={() => enabled && setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition lg:w-full ${
                  active
                    ? 'bg-accent-soft text-ink'
                    : enabled
                      ? 'text-ink-muted hover:bg-surface-muted hover:text-ink-secondary'
                      : 'cursor-not-allowed text-ink-faint opacity-50'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">{t(`profile.nav.${tab.id}`)}</span>
              </button>
            );
          })}
        </nav>

        {/* 设置内容 */}
        <div className="min-w-0 flex-1">
          {activeTab === 'mcp' ? (
            <McpAuthorizationPanel />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface text-ink-faint">
                <Settings2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="text-sm font-bold text-ink-secondary">{t('profile.comingSoon')}</div>
              <div className="max-w-sm text-xs font-medium leading-5 text-ink-faint">
                {t('profile.comingSoonHint')}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
