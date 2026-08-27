import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  ListFilter,
  MessageCircle,
  PenLine,
  RefreshCw,
  Search,
  Sparkles,
  Sun,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@features/auth/context/authSessionContextValue';
import WorkspaceHomeSkeleton from '@features/workspace/components/WorkspaceHomeSkeleton';
import NotificationBell from '@features/blog/components/NotificationBell';
import { agentConversationService } from '@features/agent/services/agentConversationService';
import { knowledgeService } from '@features/knowledge/services/knowledgeService';
import { blogPlanService } from '@features/blog/services/blogPlanService';
import { blogService } from '@features/blog/services/blogService';

const HOME_ASSET_ROOT = '/assets/workspace/home';

const QUICK_ACTIONS = [
  { key: 'chat', to: '/workspace/agent', image: `${HOME_ASSET_ROOT}/action-chat.svg`, tone: 'bg-[#f5f2ff]' },
  { key: 'import', to: '/workspace/knowledge', image: `${HOME_ASSET_ROOT}/action-import.svg`, tone: 'bg-[#f2f7ff]' },
  { key: 'practice', to: '/workspace/knowledge', image: `${HOME_ASSET_ROOT}/action-practice.svg`, tone: 'bg-[#f2faf4]' },
  { key: 'publish', to: '/workspace/publish', image: `${HOME_ASSET_ROOT}/action-publish.svg`, tone: 'bg-[#fff7f1]' },
];

const CONTINUE_SECTIONS = [
  {
    key: 'conversations',
    icon: MessageCircle,
    accent: 'bg-[#f0edff] text-[#7772f8]',
    to: '/workspace/agent',
  },
  {
    key: 'knowledge',
    icon: BookOpen,
    accent: 'bg-[#eaf8ff] text-[#4c9df5]',
    to: '/workspace/knowledge',
  },
  {
    key: 'plans',
    icon: CalendarDays,
    accent: 'bg-[#f1efff] text-[#8277f5]',
    to: '/workspace/plans',
  },
];

const STATS = [
  { key: 'knowledge', icon: BookOpen, value: null, trend: null, tone: 'bg-[#edf4ff] text-[#6b74f6]' },
  { key: 'reviews', icon: CalendarDays, value: null, trend: null, tone: 'bg-[#f5efff] text-[#9369ef]' },
  { key: 'studyTime', icon: Clock3, value: null, suffixKey: 'workspace.home.stats.hours', trend: null, tone: 'bg-[#f4efff] text-[#775ee8]' },
  { key: 'articles', icon: FileText, value: null, suffixKey: 'workspace.home.stats.articlesUnit', trend: null, tone: 'bg-[#fff3ea] text-[#d88357]' },
];

const TODO_ITEMS = [
  { key: 'closure', meta: 'workspace.home.meta.todayTime', done: false },
  { key: 'notes', meta: 'workspace.home.meta.tomorrowTime', done: false },
  { key: 'websocket', meta: '8/15 18:00', done: false },
  { key: 'dailyStudy', meta: 'workspace.home.meta.completed', done: true },
  { key: 'knowledgeUpdate', meta: 'workspace.home.meta.completed', done: true },
];

const SUGGESTIONS = [
  { key: 'review', icon: Sparkles },
  { key: 'path', icon: BookOpen },
  { key: 'inspiration', icon: PenLine },
];

const resolveMeta = (value, t) => value.startsWith('workspace.') ? t(value) : value;

const formatShortTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays <= 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) {
    return date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
  }
  return date.toLocaleDateString([], { year: 'numeric', month: 'numeric', day: 'numeric' });
};

const SectionHeader = ({ title, to }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-title font-semibold text-[#17192d]">{title}</div>
      {to ? (
        <Link to={to} className="shrink-0 text-caption font-medium text-[#7a72ef] hover:text-[#6258e7]">
          {t('workspace.home.viewAll')}
        </Link>
      ) : null}
    </div>
  );
};

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  to: PropTypes.string,
};

SectionHeader.defaultProps = {
  to: '',
};

const WorkspaceHomePage = () => {
  const { t } = useTranslation();
  const { userInfo } = useAuthSession();
  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const displayName = userInfo?.nickname || userInfo?.username || 'DinQorAI';

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [plans, setPlans] = useState([]);
  const [publishedCount, setPublishedCount] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      try {
        const [conv, know, plan, blog] = await Promise.allSettled([
          agentConversationService.list({ signal, _silent: true }),
          knowledgeService.list({ limit: 3 }, { signal, _silent: true }),
          blogPlanService.listPlans({ page: 1, size: 3 }, { signal, _silent: true }),
          blogService.getMyBlogs({ status: 1, page: 1, size: 1 }, { signal, _silent: true }),
        ]);
        if (signal.aborted) return;
        if (conv.status === 'fulfilled') setConversations(Array.isArray(conv.value) ? conv.value : []);
        if (know.status === 'fulfilled') setKnowledge(Array.isArray(know.value) ? know.value : []);
        if (plan.status === 'fulfilled') setPlans(Array.isArray(plan.value?.records) ? plan.value.records : []);
        if (blog.status === 'fulfilled') setPublishedCount(blog.value?.total ?? null);
      } catch {
        // allSettled 不抛错；单接口失败时该区块保持空态
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  if (loading) {
    return <WorkspaceHomeSkeleton />;
  }

  const sectionItems = {
    conversations: conversations.slice(0, 3).map((item) => ({
      id: item.id,
      title: item.title || '',
      meta: formatShortTime(item.updatedAt || item.createdAt),
    })),
    knowledge: knowledge.slice(0, 3).map((item) => ({
      id: item.id,
      title: item.title || '',
      meta: formatShortTime(item.createdAt || item.updatedAt),
    })),
    plans: plans.slice(0, 3).map((item) => ({
      id: item.id,
      title: item.topic || '',
      meta: item.status || formatShortTime(item.nextRunAt),
    })),
  };

  const statValues = {
    knowledge: null,
    reviews: null,
    studyTime: null,
    articles: publishedCount,
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto text-body text-[#555b7b]">
      <div className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-5 px-5">
        <div className="flex min-h-9 items-center gap-2 rounded-xl border border-[#e9eaf4] bg-white/70 px-3 text-caption font-medium text-[#59617e]">
          <Sun className="h-4 w-4" aria-hidden="true" />
          {t(`workspace.home.greeting.${greetingKey}`)}
        </div>

        <div className="flex items-center gap-3">
          <label className="hidden min-h-9 w-[15rem] items-center gap-2 rounded-full border border-[#e9eaf4] bg-white/60 px-4 text-[#8e94ad] lg:flex">
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <input
              type="search"
              className="min-w-0 flex-1 bg-transparent text-caption outline-none placeholder:text-[#9ca1b7]"
              placeholder={t('workspace.home.search')}
              aria-label={t('workspace.home.search')}
            />
          </label>
          <NotificationBell />
          <button
            type="button"
            className="hidden min-h-9 items-center gap-2 rounded-full border border-[#e9eaf4] bg-white/70 px-4 text-caption font-medium text-[#59617e] sm:flex"
          >
            <ListFilter className="h-4 w-4" aria-hidden="true" />
            {t('workspace.home.quickActions')}
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="flex flex-col items-stretch gap-5 xl:flex-row">
          <div className="min-w-0 flex-1 space-y-5">
            <section className="relative min-h-[12.5rem] overflow-hidden rounded-2xl bg-[linear-gradient(105deg,#f1f0ff_0%,#f8f9ff_72%)] px-10 py-7">
              <img
                src={`${HOME_ASSET_ROOT}/hero-orb.svg`}
                alt=""
                className="pointer-events-none absolute right-20 top-0 hidden h-[7rem] object-contain lg:block"
                aria-hidden="true"
              />
              <div className="relative z-10">
                <div className="text-display text-[#111426]">
                  <span className="font-semibold">{t('workspace.home.welcome')}</span>{' '}
                  <span className="font-bold text-[#6864ec]">{displayName}</span>
                </div>
                <div className="mt-2 text-body text-[#8b91a9]">{t('workspace.home.subtitle')}</div>
                <Link
                  to="/workspace/agent"
                  className="mt-5 flex min-h-[3.5rem] max-w-[56rem] items-center gap-3 rounded-[1.125rem] border border-white bg-white/90 px-5 shadow-[0_0.75rem_2rem_rgba(91,85,190,0.06)]"
                >
                  <Sparkles className="h-5 w-5 shrink-0 text-[#7771ed]" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-body text-[#9ba0b7]">{t('workspace.home.prompt')}</span>
                  <span className="hidden rounded-md bg-[#f3f3f8] px-2 py-1 text-micro text-[#9399af] md:block">⌘ K</span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#7771ed] text-white">
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.key}
                  to={action.to}
                  className={`${action.tone} workspace-quick-action group relative isolate flex min-h-[5rem] min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-white/65 px-4 transition-[transform,box-shadow] duration-300 ease-out focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#817bf2]/45 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none`}
                >
                  <span className="relative z-10 shrink-0 transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-110 group-focus-visible:rotate-6 group-focus-visible:scale-110 motion-reduce:transform-none motion-reduce:transition-none">
                    <img src={action.image} alt="" className="h-11 w-11 object-contain" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-semibold text-[#242741]">{t(`workspace.home.actions.${action.key}.title`)}</span>
                    <span className="mt-0.5 block truncate text-caption text-[#8e94aa]">{t(`workspace.home.actions.${action.key}.description`)}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 -rotate-90 text-[#858ca8] transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
                </Link>
              ))}
            </div>

            <section className="space-y-3">
              <SectionHeader title={t('workspace.home.continueTitle')} />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {CONTINUE_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const items = sectionItems[section.key];
                  return (
                    <div key={section.key} className="min-w-0 rounded-2xl border border-[#e9eaf3] bg-white/55 p-4">
                      <SectionHeader title={t(`workspace.home.sections.${section.key}.title`)} to={section.to} />
                      {items.length > 0 ? (
                        <div className="mt-3 divide-y divide-[#eef0f6]">
                          {items.map((item) => (
                            <div key={item.id} className="flex min-h-11 items-center gap-2 py-2">
                              <span className={`${section.accent} grid h-6 w-6 shrink-0 place-items-center rounded-full`}>
                                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                              </span>
                              <span className="min-w-0 flex-1 truncate text-caption font-medium text-[#434862]">
                                {item.title}
                              </span>
                              <span className="shrink-0 text-micro text-[#9ca2b7]">{item.meta}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-3 flex min-h-11 items-center text-caption text-[#a1a6b9]">
                          {t('workspace.home.sections.empty')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <SectionHeader title={t('workspace.home.overviewTitle')} />
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {STATS.map((stat) => {
                  const Icon = stat.icon;
                  const value = statValues[stat.key];
                  return (
                    <div key={stat.key} className="min-h-[8.5rem] rounded-2xl border border-[#e9eaf3] bg-white/48 p-4">
                      <div className="flex items-center gap-3">
                        <span className={`${stat.tone} grid h-10 w-10 shrink-0 place-items-center rounded-xl`}>
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="text-caption text-[#737992]">{t(`workspace.home.stats.${stat.key}`)}</span>
                      </div>
                      <div className="mt-2 pl-[3.25rem] text-heading font-medium text-[#16192c]">
                        {value ?? '—'}{stat.suffixKey ? <span className="ml-1 text-caption font-normal text-[#747a92]">{t(stat.suffixKey)}</span> : null}
                      </div>
                      <div className="mt-2 pl-[3.25rem] text-micro text-[#949aaf]">
                        {t('workspace.home.stats.compared')} <span className="text-[#7771ed]">—</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:w-[20rem] xl:grid-cols-1">
            <section className="flex h-[24rem] min-w-0 flex-col rounded-2xl border border-[#e7e9f1] bg-white/70 p-5 shadow-[0_0.75rem_2rem_rgba(73,79,120,0.04)]">
              <SectionHeader title={t('workspace.home.todos.title')} to="/workspace/plans" />
              <div className="mt-3 flex-1 divide-y divide-[#eceef4] overflow-hidden">
                {TODO_ITEMS.map((item) => (
                  <div key={item.key} className="flex min-h-[3.5rem] gap-3 py-2.5">
                    <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${item.done ? 'border-[#dcdff0] bg-[#f0f1f8] text-[#8e94ac]' : 'border-[#aeb4ca] bg-white'}`}>
                      {item.done ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-caption text-[#626881]">{t(`workspace.home.todos.items.${item.key}`)}</span>
                      <span className="mt-1 block text-micro text-[#a1a6b9]">{resolveMeta(item.meta, t)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex h-[24rem] min-w-0 flex-col rounded-2xl border border-[#e7e9f1] bg-white/70 p-5 shadow-[0_0.75rem_2rem_rgba(73,79,120,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div className="text-title font-semibold text-[#17192d]">{t('workspace.home.suggestions.title')}</div>
                <button type="button" className="flex shrink-0 items-center gap-1 text-caption font-medium text-[#7771ed]">
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('workspace.home.suggestions.refresh')}
                </button>
              </div>
              <div className="mt-4 flex flex-1 flex-col gap-2.5 overflow-hidden">
                {SUGGESTIONS.map((suggestion) => {
                  const Icon = suggestion.icon;
                  return (
                    <div key={suggestion.key} className="flex min-h-0 flex-1 gap-3 rounded-xl border border-[#ececf6] bg-[linear-gradient(120deg,#f6f4ff_0%,#fbfbff_100%)] p-3">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#7771ed]" aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="truncate text-caption font-semibold text-[#343750]">{t(`workspace.home.suggestions.items.${suggestion.key}.title`)}</div>
                        <div className="mt-1 line-clamp-2 text-micro leading-relaxed text-[#8a90a8]">{t(`workspace.home.suggestions.items.${suggestion.key}.description`)}</div>
                        <Link to={suggestion.key === 'inspiration' ? '/workspace/publish' : '/workspace/knowledge'} className="mt-1 inline-flex items-center gap-1 text-micro font-medium text-[#7771ed]">
                          {t(`workspace.home.suggestions.items.${suggestion.key}.action`)}
                          <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceHomePage;
