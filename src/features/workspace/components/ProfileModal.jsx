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
import Button from '@components/common/Button';
import AccountInfoPanel from '@features/profile/components/AccountInfoPanel';
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

const ENABLED_TABS = ['account', 'mcp'];

const ProfileModal = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('account');

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
          className="flex min-w-0 shrink-0 gap-1 overflow-x-auto overscroll-x-contain rounded-xl border border-border bg-surface p-1 lg:w-44 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto"
          aria-label={t('workspace.settings')}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const enabled = ENABLED_TABS.includes(tab.id);
            const active = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                role="tab"
                aria-selected={active}
                disabled={!enabled}
                onClick={() => enabled && setActiveTab(tab.id)}
                variant="ghost"
                icon={Icon}
                className={`justify-start lg:w-full ${active ? 'bg-accent-soft text-ink' : ''}`}
              >
                <span className="whitespace-nowrap">{t(`profile.nav.${tab.id}`)}</span>
              </Button>
            );
          })}
        </nav>

        {/* 设置内容 */}
        <div className="min-w-0 flex-1">
          {activeTab === 'account' ? (
            <AccountInfoPanel />
          ) : activeTab === 'mcp' ? (
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
