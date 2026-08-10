import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CalendarClock,
  Code2,
  LayoutDashboard,
  Mail,
  NotebookPen,
  Settings,
  Sparkles,
} from 'lucide-react';

const TOOLS = [
  {
    to: '/workspace/plans',
    icon: CalendarClock,
    titleKey: 'nav.plans',
    descKey: 'blogPlans.subtitle',
    accent: 'bg-accent text-white shadow-accent/20',
  },
  {
    to: '/workspace/img2three',
    icon: Sparkles,
    titleKey: 'nav.img2three',
    descKey: 'img2three.subtitle',
    accent: 'bg-ink text-white shadow-ink/15',
  },
  {
    to: '/workspace/studio',
    icon: Code2,
    titleKey: 'nav.studio',
    descKey: 'workspace.studioDesc',
    accent: 'bg-info text-white shadow-info/20',
  },
  {
    to: '/workspace/blog-manage',
    icon: NotebookPen,
    titleKey: 'profile.blogManage.title',
    descKey: 'profile.blogManage.description',
    accent: 'bg-success text-white shadow-success/20',
  },
  {
    to: '/workspace/email-reminders',
    icon: Mail,
    titleKey: 'profile.emailReminders.title',
    descKey: 'profile.emailReminders.description',
    accent: 'bg-warning text-white shadow-warning/20',
  },
];

const WorkspaceHome = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-surface">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/5 px-3 py-1 text-micro font-bold uppercase tracking-widest text-accent">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Workspace
            </div>
            <h1 className="text-2xl font-black text-ink sm:text-3xl">{t('workspace.title')}</h1>
            <p className="mt-2 max-w-2xl text-body leading-6 text-ink-muted">{t('workspace.subtitle')}</p>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-canvas px-4 py-2 text-sm font-semibold text-ink-secondary transition hover:border-accent hover:text-accent"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            {t('workspace.settings')}
          </Link>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.to}
                to={tool.to}
                className="group flex min-h-[180px] flex-col justify-between rounded-2xl border border-border bg-canvas p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-xl hover:shadow-border/70"
              >
                <div>
                  <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl shadow-lg ${tool.accent}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-black text-ink">{t(tool.titleKey)}</h2>
                  <p className="mt-2 line-clamp-2 text-body leading-5 text-ink-muted">{t(tool.descKey)}</p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1 text-micro font-bold uppercase tracking-widest text-accent">
                  {t('workspace.open', '进入')}
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default WorkspaceHome;
