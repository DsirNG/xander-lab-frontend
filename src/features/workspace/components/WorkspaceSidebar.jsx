import PropTypes from 'prop-types';
import { ChevronRight } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MENU = [
  {
    to: '/workspace',
    activeIcon: '/assets/workspace/sidebar-icons/workspace-active.svg',
    end: true,
    icon: '/assets/workspace/sidebar-icons/workspace.svg',
    labelKey: 'workspace.title',
  },
  {
    to: '/workspace/agent',
    activeIcon: '/assets/workspace/sidebar-icons/dinqorai-active.svg',
    icon: '/assets/workspace/sidebar-icons/dinqorai.svg',
    labelKey: 'workspace.menu.dinqorai',
  },
  {
    to: '/workspace/knowledge',
    activeIcon: '/assets/workspace/sidebar-icons/knowledge-active.svg',
    icon: '/assets/workspace/sidebar-icons/knowledge.svg',
    labelKey: 'workspace.menu.knowledge',
  },
  {
    to: '/workspace/blog-manage',
    activeIcon: '/assets/workspace/sidebar-icons/writing-active.svg',
    icon: '/assets/workspace/sidebar-icons/writing.svg',
    labelKey: 'workspace.menu.writing',
  },
];

const getDisplayName = (userInfo) => userInfo?.nickname || userInfo?.username || 'DinQorAI';

const WorkspaceSidebar = ({ userInfo, onOpenSettings }) => {
  const { t } = useTranslation();
  const displayName = getDisplayName(userInfo);
  const avatarText = displayName.slice(0, 2).toUpperCase();

  return (
    <aside
      className="hidden h-dvh w-[230px] shrink-0 flex-col bg-[#fefefe] px-[14px] pb-6 pt-5 lg:flex"
      aria-label={t('workspace.title')}
    >
      <Link
        to="/"
        className="flex h-14 items-center gap-3 rounded-xl px-1.5"
        aria-label={t('workspace.backHome')}
      >
        <img
          src="/assets/workspace/workspace-logo.svg"
          alt=""
          className="h-10 w-10 shrink-0"
          aria-hidden="true"
        />
        <span className="truncate text-title font-semibold text-ink">DinQorAI</span>
      </Link>

      <nav className="mt-[29px] flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto" aria-label={t('workspace.title')}>
        {MENU.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex min-h-[50px] items-center gap-5 rounded-xl px-6 text-body font-medium transition-colors ${
                isActive
                  ? 'bg-[#f2f1fd] text-[#6765f6]'
                  : 'text-[#5F6286] hover:bg-[#f7f6fc] '
              }`
            }
          >
            {({ isActive }) => (
              <>
                <img
                  src={isActive ? item.activeIcon : item.icon}
                  alt=""
                  className="h-[20px] w-[20px] shrink-0 object-contain"
                  aria-hidden="true"
                />
                <span className="truncate">{t(item.labelKey)}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={onOpenSettings}
        className="mt-5 flex min-h-[70px] w-full items-center gap-3 rounded-2xl border border-[#f4f4f9] bg-[#fefefe] px-3.5 text-left transition-colors hover:bg-[#faf9fd] focus:outline-none focus:ring-2 focus:ring-accent-200"
        aria-label={t('workspace.settings')}
      >
        <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-[#dddddd] bg-white text-micro font-bold text-accent">
          {avatarText}
          {userInfo?.avatar ? (
            <img src={userInfo.avatar} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <img
              src="/assets/workspace/workspace-logo.svg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-caption font-medium text-ink">{displayName}</span>
          <span className="mt-0.5 block truncate text-micro text-[#6765f6]">
            {userInfo?.role || t('workspace.title')}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
      </button>
    </aside>
  );
};

WorkspaceSidebar.propTypes = {
  userInfo: PropTypes.shape({
    avatar: PropTypes.string,
    nickname: PropTypes.string,
    role: PropTypes.string,
    username: PropTypes.string,
  }),
  onOpenSettings: PropTypes.func.isRequired,
};

WorkspaceSidebar.defaultProps = {
  userInfo: null,
};

export default WorkspaceSidebar;
