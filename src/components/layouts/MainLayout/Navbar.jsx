import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Github, Menu, Languages, X, User as UserIcon, ChevronDown, Check } from 'lucide-react';
import styles from './Navbar.module.css';
import { useAuthSession } from '@features/auth/context/authSessionContextValue';
import NotificationBell from '@features/blog/components/NotificationBell';
import Button from '@components/common/Button';

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
    const { userInfo } = useAuthSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const [langReel, setLangReel] = useState(() => ({
        outgoing: LANG_LABELS[i18n.language] || 'EN',
        incoming: null,
        rolling: false,
    }));
    const langRollTimerRef = useRef(null);
    const langDropdownRef = useRef(null);
    const location = useLocation();

    const rollLanguageLabel = useCallback((nextLng) => {
        const nextLabel = LANG_LABELS[nextLng] || 'EN';
        setLangReel((current) => {
            if (current.rolling && current.incoming === nextLabel) {
                return current;
            }
            return {
                outgoing: current.incoming || current.outgoing,
                incoming: nextLabel,
                rolling: true,
            };
        });
        if (langRollTimerRef.current) {
            window.clearTimeout(langRollTimerRef.current);
        }
        langRollTimerRef.current = window.setTimeout(() => {
            setLangReel({
                outgoing: nextLabel,
                incoming: null,
                rolling: false,
            });
            langRollTimerRef.current = null;
        }, 360);
    }, []);

    // 切换语言（标签下→上滚动）
    const changeLanguage = useCallback((lng) => {
        if (lng === i18n.language) {
            setIsLangDropdownOpen(false);
            return;
        }
        setIsLangDropdownOpen(false);
        rollLanguageLabel(lng);
        i18n.changeLanguage(lng);
    }, [i18n, rollLanguageLabel]);

    // 移动端循环切换
    const toggleLanguageMobile = () => {
        const currentIdx = Math.max(0, LANGUAGES.indexOf(i18n.language));
        const nextLng = LANGUAGES[(currentIdx + 1) % LANGUAGES.length];
        rollLanguageLabel(nextLng);
        i18n.changeLanguage(nextLng);
    };

    useEffect(() => () => {
        if (langRollTimerRef.current) {
            window.clearTimeout(langRollTimerRef.current);
        }
    }, []);

    // Keep reel label in sync when language changes elsewhere
    useEffect(() => {
        const label = LANG_LABELS[i18n.language] || 'EN';
        setLangReel((current) => {
            if (current.rolling) return current;
            if (current.outgoing === label) return current;
            return { outgoing: label, incoming: null, rolling: false };
        });
    }, [i18n.language]);

    const displayName = getDisplayName(userInfo);
    const avatarText = getAvatarText(userInfo);
    const roleLabel = userInfo?.role || '';

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
                                DinQorAI
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
                                <Button
                                    onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                                    variant="ghost"
                                    size="sm"
                                    className={`${styles.iconButton} flex items-center gap-1 px-2 sm:px-3`}
                                    title="Language"
                                    aria-expanded={isLangDropdownOpen}
                                    aria-haspopup="listbox"
                                >
                                    <Languages aria-hidden="true" className="w-4 h-4" />
                                    <span
                                        className={`${styles.langReel} ${styles.langReelSm}`}
                                        aria-live="polite"
                                    >
                                        <span
                                            className={`${styles.langReelItem} ${
                                                langReel.rolling ? styles.langReelOut : ''
                                            }`}
                                        >
                                            {langReel.outgoing}
                                        </span>
                                        {langReel.rolling && langReel.incoming ? (
                                            <span className={`${styles.langReelItem} ${styles.langReelIn}`}>
                                                {langReel.incoming}
                                            </span>
                                        ) : null}
                                    </span>
                                    <ChevronDown aria-hidden="true" className={`w-3 h-3 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                                </Button>

                                {/* 下拉菜单 */}
                                <div className={`absolute top-full right-0 mt-2 ${styles.langDropdown} ${isLangDropdownOpen ? styles.langDropdownOpen : ''}`}>
                                    <div className="py-1.5" role="listbox" aria-label="Select language">
                                        {LANGUAGES.map((lng, idx) => {
                                            const isActive = i18n.language === lng;
                                            return (
                                                <Button
                                                    key={lng}
                                                    role="option"
                                                    aria-selected={isActive}
                                                    onClick={() => changeLanguage(lng)}
                                                    variant="ghost"
                                                    size="sm"
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
                                                </Button>
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
                            {userInfo ? <NotificationBell /> : null}
                            <div className="hidden sm:flex items-center ml-2 pl-2 border-l border-border ">
                                {userInfo ? (
                                    <Link
                                        to="/workspace"
                                        className={`flex items-center gap-2 rounded-xl px-1.5 py-1 transition focus:outline-none focus:ring-2 focus:ring-accent-200 ${
                                            isNavActive('/workspace')
                                                ? 'bg-accent-soft'
                                                : 'hover:bg-accent-soft'
                                        }`}
                                        title={t('workspace.title')}
                                        aria-label={t('workspace.title')}
                                        aria-current={isNavActive('/workspace') ? 'page' : undefined}
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
                            <Button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                variant="ghost"
                                size="md"
                                icon={isMobileMenuOpen ? X : Menu}
                                aria-label={t('common.aria.openMenu', 'Open menu')}
                                aria-expanded={isMobileMenuOpen}
                                className={`md:hidden ${styles.menuButton}`}
                            />
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
                        <Button
                            onClick={toggleLanguageMobile}
                            variant="ghost"
                            size="md"
                            className={`${styles.mobileActionButton} flex items-center space-x-2`}
                        >
                            <Languages aria-hidden="true" className="w-4 h-4" />
                            <span
                                className={`${styles.langReel} ${styles.langReelMd}`}
                                aria-live="polite"
                            >
                                <span
                                    className={`${styles.langReelItem} ${
                                        langReel.rolling ? styles.langReelOut : ''
                                    }`}
                                >
                                    {langReel.outgoing}
                                </span>
                                {langReel.rolling && langReel.incoming ? (
                                    <span className={`${styles.langReelItem} ${styles.langReelIn}`}>
                                        {langReel.incoming}
                                    </span>
                                ) : null}
                            </span>
                        </Button>
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
                                to="/workspace"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`${styles.mobileActionButton} flex items-center gap-2.5 text-left ${
                                    isNavActive('/workspace') ? 'bg-accent-soft' : ''
                                }`}
                                aria-current={isNavActive('/workspace') ? 'page' : undefined}
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
                                        {t('workspace.title')}
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

export default Navbar;
