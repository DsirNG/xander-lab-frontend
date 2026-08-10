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
      width="max-w-3xl"
    >
      <div className="flex flex-col gap-4">
        <div
          className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1"
          role="tablist"
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
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-accent-soft text-ink'
                    : enabled
                      ? 'text-ink-muted hover:bg-surface-muted hover:text-ink-secondary'
                      : 'cursor-not-allowed text-ink-faint opacity-50'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {t(`profile.nav.${tab.id}`)}
              </button>
            );
          })}
        </div>

        <div className="min-h-[360px]">
          {activeTab === 'mcp' ? (
            <McpAuthorizationPanel />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface text-ink-faint">
                <Settings2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="text-sm font-bold text-ink-secondary">{t('profile.comingSoon')}</p>
              <p className="max-w-sm text-xs font-medium leading-5 text-ink-faint">
                {t('profile.comingSoonHint')}
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
