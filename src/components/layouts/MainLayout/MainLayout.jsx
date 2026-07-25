import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Github, Menu, Languages, X, User as UserIcon, ChevronDown, Check } from 'lucide-react';
import styles from './MainLayout.module.css';
import { authService } from '@features/auth/services/authService';

const LANGUAGES = ['zh', 'en', 'fr', 'ja', 'ru', 'vi'];
const LANG_LABELS = { zh: '中文', en: 'EN', fr: 'FR', ja: '日本語', ru: 'RU', vi: 'VI' };
const LANG_FULL = { zh: '简体中文', en: 'English', fr: 'Français', ja: '日本語', ru: 'Русский', vi: 'Tiếng Việt' };

const getDisplayName = (userInfo) => userInfo?.nickname || userInfo?.username || '';
const getAvatarText = (userInfo) => {
    const name = getDisplayName(userInfo);
    return name ? name.slice(0, 2).toUpperCase() : 'XL';
};

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userInfo, setUserInfo] = useState(authService.getLocalUserInfo());
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const [animDirection, setAnimDirection] = useState(0); // 1 = spin up, -1 = spin down
    const [isAnimating, setIsAnimating] = useState(false);
    const langDropdownRef = useRef(null);
    const location = useLocation();

    // 切换语言（带旋转动画）
    const changeLanguage = useCallback((lng) => {
        const currentIdx = LANGUAGES.indexOf(i18n.language);
        const nextIdx = LANGUAGES.indexOf(lng);
        if (currentIdx === nextIdx) {
            setIsLangDropdownOpen(false);
            return;
        }
        setAnimDirection(nextIdx > currentIdx ? 1 : -1);
        setIsAnimating(true);
        setIsLangDropdownOpen(false);
        i18n.changeLanguage(lng);
        setTimeout(() => setIsAnimating(false), 400);
    }, [i18n]);

    // 移动端循环切换
    const toggleLanguageMobile = () => {
        const currentIdx = LANGUAGES.indexOf(i18n.language);
        const nextLng = LANGUAGES[(currentIdx + 1) % LANGUAGES.length];
        setAnimDirection(1);
        setIsAnimating(true);
        i18n.changeLanguage(nextLng);
        setTimeout(() => setIsAnimating(false), 400);
    };

    const currentLang = LANG_LABELS[i18n.language] || 'EN';
    const displayName = getDisplayName(userInfo);
    const avatarText = getAvatarText(userInfo);
    const roleLabel = userInfo?.role || '';

    // 监听全局登出事件
    useEffect(() => {
        const checkAuth = () => {
            setUserInfo(null);
        };
        window.addEventListener('auth:logout', checkAuth);
        return () => window.removeEventListener('auth:logout', checkAuth);
    }, []);

    // 点击外部关闭菜单和语言下拉
    useEffect(() => {
        const handleClickOutside = (event) => {
            const mobileMenu = document.querySelector(`.${styles.mobileMenu}`);
            const menuButton = document.querySelector(`.${styles.menuButton}`);

            if (isMobileMenuOpen &&
                mobileMenu &&
                !mobileMenu.contains(event.target) &&
                menuButton &&
                !menuButton.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // 防止背景滚动
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    // 点击外部关闭语言下拉
    useEffect(() => {
        if (!isLangDropdownOpen) return;
        const handleClickOutside = (event) => {
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
                setIsLangDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isLangDropdownOpen]);

    const navLinks = [
        { path: '/', label: t('nav.home') },
        { path: '/components', label: t('nav.components') },
        { path: '/blog/', label: t('nav.blog') },
        { path: '/studio', label: t('nav.studio') },
    ];

    const normalizePath = (path) => {
        const value = String(path || '/').replace(/\/+$/, '');
        return value || '/';
    };

    const isNavActive = (linkPath) => {
        const current = normalizePath(location.pathname);
        const target = normalizePath(linkPath);
        if (target === '/') return current === '/';
        return current === target || current.startsWith(`${target}/`);
    };

    return (
        <>
            <nav aria-label={t('common.aria.mainNav', 'Main navigation')} className={styles.navbar}>
                <div className={styles.container}>
                    <div className={styles.navContent}>
                        <Link to="/" className={styles.logoArea} onClick={() => setIsMobileMenuOpen(false)}>
                            <span className={styles.logoText}>
                                Xander Lab
                            </span>
                        </Link>

                        <div className={styles.desktopNav}>
                            <div className={styles.navLinks}>
                                {navLinks.map((link) => {
                                    const active = isNavActive(link.path);
                                    return (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                                            aria-current={active ? 'page' : undefined}
                                        >
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.actionsArea}>
                            {/* PC端语言下拉选择器 */}
                            <div className="hidden sm:flex items-center relative" ref={langDropdownRef}>
                                <button
                                    onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                                    className={`${styles.iconButton} flex items-center gap-1 px-2 sm:px-3`}
                                    title="Language"
                                    aria-expanded={isLangDropdownOpen}
                                    aria-haspopup="listbox"
                                >
                                    <Languages aria-hidden="true" className="w-4 h-4" />
                                    <span className={`text-xs font-bold inline-block overflow-hidden h-4 leading-4 min-w-[2ch] text-center ${isAnimating ? (animDirection > 0 ? styles.langSpinOut : styles.langSpinOutReverse) : ''}`}>
                                        {currentLang}
                                    </span>
                                    <ChevronDown aria-hidden="true" className={`w-3 h-3 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* 下拉菜单 */}
                                <div className={`absolute top-full right-0 mt-2 ${styles.langDropdown} ${isLangDropdownOpen ? styles.langDropdownOpen : ''}`}>
                                    <div className="py-1.5" role="listbox" aria-label="Select language">
                                        {LANGUAGES.map((lng, idx) => {
                                            const isActive = i18n.language === lng;
                                            return (
                                                <button
                                                    key={lng}
                                                    role="option"
                                                    aria-selected={isActive}
                                                    onClick={() => changeLanguage(lng)}
                                                    className={`${styles.langOption} ${isActive ? styles.langOptionActive : ''}`}
                                                    style={{ animationDelay: isLangDropdownOpen ? `${idx * 40}ms` : '0ms' }}
                                                >
                                                    <span className="flex items-center gap-2.5">
                                                        <span className={`text-xs font-bold w-7 text-center ${isActive ? 'text-accent' : 'text-ink-muted'}`}>
                                                            {LANG_LABELS[lng]}
                                                        </span>
                                                        <span className={`text-xs ${isActive ? 'text-accent font-semibold' : 'text-ink-secondary'}`}>
                                                            {LANG_FULL[lng]}
                                                        </span>
                                                    </span>
                                                    {isActive && <Check className="w-3.5 h-3.5 text-accent" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <a
                                href="https://github.com/DsirNG/xander-lab-frontend"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${styles.iconButton} hidden sm:flex`}
                                aria-label="GitHub"
                            >
                                <Github aria-hidden="true" className="w-5 h-5" />
                            </a>

                            {/* 用户区域：头像 + 名字，进入个人中心；退出仅在个人中心 */}
                            <div className="hidden sm:flex items-center ml-2 pl-2 border-l border-border ">
                                {userInfo ? (
                                    <Link
                                        to="/profile"
                                        className={`flex items-center gap-2 rounded-xl px-1.5 py-1 transition focus:outline-none focus:ring-2 focus:ring-accent-200 ${
                                            isNavActive('/profile')
                                                ? 'bg-accent-soft'
                                                : 'hover:bg-accent-soft'
                                        }`}
                                        title={t('profile.open')}
                                        aria-label={t('profile.open')}
                                        aria-current={isNavActive('/profile') ? 'page' : undefined}
                                    >
                                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-micro font-black uppercase text-white">
                                            {avatarText}
                                        </span>
                                        <span className="min-w-0 text-left">
                                            <span className="flex max-w-[9rem] items-center gap-1.5">
                                                <span className="truncate text-xs font-bold text-ink">
                                                    {displayName}
                                                </span>
                                                {roleLabel ? (
                                                    <span className="shrink-0 rounded bg-accent-soft px-1.5 py-0.5 text-micro font-bold uppercase text-accent ring-1 ring-accent-100">
                                                        {roleLabel}
                                                    </span>
                                                ) : null}
                                            </span>
                                        </span>
                                    </Link>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-soft text-accent hover:bg-accent hover:text-white transition-all text-xs font-bold"
                                    >
                                        <UserIcon aria-hidden="true" className="w-3.5 h-3.5" />
                                        <span>{t('nav.login')}</span>
                                    </Link>
                                )}
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={styles.menuButton}
                                aria-label={t('common.aria.openMenu', 'Open menu')}
                                aria-expanded={isMobileMenuOpen}
                            >
                                {isMobileMenuOpen ? (
                                    <X aria-hidden="true" className="w-5 h-5 sm:w-6 sm:h-6" />
                                ) : (
                                    <Menu aria-hidden="true" className="w-5 h-5 sm:w-6 sm:h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 跳过导航链接 - 仅在 focus 时可见 */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:shadow-lg focus:text-sm focus:font-bold focus:outline-none"
            >
                {t('nav.skipToMain')}
            </a>

            {/* 移动端菜单 */}
            <div
                className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}
            >
                <div className={styles.mobileMenuContent}>
                    <div className={styles.mobileNavLinks}>
                        {navLinks.map((link) => {
                            const active = isNavActive(link.path);
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`${styles.mobileNavLink} ${active ? styles.mobileNavLinkActive : ''}`}
                                    aria-current={active ? 'page' : undefined}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className={styles.mobileMenuActions}>
                        <button
                            onClick={toggleLanguageMobile}
                            className={`${styles.mobileActionButton} flex items-center space-x-2`}
                        >
                            <Languages aria-hidden="true" className="w-4 h-4" />
                            <span className={`text-sm font-medium inline-block overflow-hidden h-5 leading-5 ${isAnimating ? styles.langSpinOut : ''}`}>
                                {currentLang}
                            </span>
                        </button>
                        <a
                            href="https://github.com/DsirNG/xander-lab-frontend"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.mobileActionButton} flex items-center space-x-2`}
                        >
                            <Github aria-hidden="true" className="w-5 h-5" />
                            <span className="text-sm font-medium">GitHub</span>
                        </a>

                        {userInfo ? (
                            <Link
                                to="/profile"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`${styles.mobileActionButton} flex items-center gap-2.5 text-left ${
                                    isNavActive('/profile') ? 'bg-accent-soft' : ''
                                }`}
                                aria-current={isNavActive('/profile') ? 'page' : undefined}
                            >
                                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-micro font-black uppercase text-white">
                                    {avatarText}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex flex-wrap items-center gap-1.5">
                                        <span className="truncate text-sm font-bold text-ink">
                                            {displayName}
                                        </span>
                                        {roleLabel ? (
                                            <span className="rounded bg-accent-soft px-1.5 py-0.5 text-micro font-bold uppercase text-accent ring-1 ring-accent-100">
                                                {roleLabel}
                                            </span>
                                        ) : null}
                                    </span>
                                    <span className="mt-0.5 block text-xs font-medium text-ink-faint">
                                        {t('profile.open')}
                                    </span>
                                </span>
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className={`${styles.mobileActionButton} flex items-center space-x-2 text-accent`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <UserIcon aria-hidden="true" className="w-4 h-4" />
                                <span className="text-sm font-medium">{t('nav.accountLogin')}</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* 移动端遮罩层 */}
            {isMobileMenuOpen && (
                <div
                    className={styles.mobileMenuOverlay}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
};

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.footerGrid}>
                    <div>
                        <h3 className={styles.footerTitle}>Xander Lab</h3>
                        <p className={styles.footerText}>
                            {t('footer.desc')}
                        </p>
                    </div>
                    <div>
                        <h4 className={styles.footerSectionTitle}>{t('footer.resources')}</h4>
                        <ul className={styles.footerList}>
                            <li><Link to="/modules" className={styles.footerLink}>{t('footer.Infrastructure')}</Link></li>
                            <li><Link to="/hooks" className={styles.footerLink}>{t('footer.Modules')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className={styles.footerSectionTitle}>{t('footer.connect')}</h4>
                        <div className="flex space-x-4">
                            <a href="#" className={styles.footerLink}>Twitter</a>
                            <a href="#" className={styles.footerLink}>GitHub</a>
                        </div>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    © {new Date().getFullYear()} Xander Lab. {t('footer.rights')}
                </div>
            </div>
        </footer>
    );
};

const MainLayout = () => {
    const location = useLocation();

    return (
        <div className={styles.layoutContainer}>
            <Navbar key={location.pathname} />
            <main id="main-content" tabIndex={-1} className={styles.mainContent}>
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;


