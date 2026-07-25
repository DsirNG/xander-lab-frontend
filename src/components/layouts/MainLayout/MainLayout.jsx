import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Github, Menu, Languages, X, User as UserIcon, LogOut, ChevronDown, Check } from 'lucide-react';
import styles from './MainLayout.module.css';
import { authService } from '@features/auth/services/authService';

const LANGUAGES = ['zh', 'en', 'fr', 'ja', 'ru', 'vi'];
const LANG_LABELS = { zh: '中文', en: 'EN', fr: 'FR', ja: '日本語', ru: 'RU', vi: 'VI' };
const LANG_FULL = { zh: '简体中文', en: 'English', fr: 'Français', ja: '日本語', ru: 'Русский', vi: 'Tiếng Việt' };

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userInfo, setUserInfo] = useState(authService.getLocalUserInfo());
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const [animDirection, setAnimDirection] = useState(0); // 1 = spin up, -1 = spin down
    const [isAnimating, setIsAnimating] = useState(false);
    const langDropdownRef = useRef(null);
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await authService.logout();
            setUserInfo(null);
            setIsMobileMenuOpen(false);
            window.location.href = '/'; // 登出后回首页
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

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
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={styles.navLink}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
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
                                                        <span className={`text-xs font-bold w-7 text-center ${isActive ? 'text-primary' : 'text-slate-500'}`}>
                                                            {LANG_LABELS[lng]}
                                                        </span>
                                                        <span className={`text-xs ${isActive ? 'text-primary font-semibold' : 'text-slate-600'}`}>
                                                            {LANG_FULL[lng]}
                                                        </span>
                                                    </span>
                                                    {isActive && <Check className="w-3.5 h-3.5 text-primary" />}
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

                            {/* 用户区域 */}
                            <div className="hidden sm:flex items-center ml-2 pl-2 border-l border-slate-200 ">
                                {userInfo ? (
                                    <div className="flex items-center gap-3">
                                        <Link
                                            to="/profile"
                                            className="flex flex-col items-end rounded-xl px-2 py-1 text-right transition hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            title={t('profile.open')}
                                            aria-label={t('profile.open')}
                                        >
                                            <span className="text-[10px] font-bold text-slate-900  leading-tight">
                                                {userInfo.nickname || userInfo.username}
                                            </span>
                                            <span className="text-[9px] text-slate-400 leading-tight">
                                                {userInfo.role}
                                            </span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-8 h-8 rounded-full bg-slate-100  flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                            title={t('nav.logout')}
                                            aria-label={t('nav.logout')}
                                        >
                                            <LogOut aria-hidden="true" className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all text-xs font-bold"
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
                className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg focus:text-sm focus:font-bold focus:outline-none"
            >
                {t('nav.skipToMain')}
            </a>

            {/* 移动端菜单 */}
            <div
                className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}
            >
                <div className={styles.mobileMenuContent}>
                    <div className={styles.mobileNavLinks}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`${styles.mobileNavLink} ${location.pathname === link.path ? styles.mobileNavLinkActive : ''}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
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
                            <>
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`${styles.mobileActionButton} flex items-center space-x-2 text-primary`}
                                >
                                    <UserIcon aria-hidden="true" className="w-4 h-4" />
                                    <span className="text-sm font-medium">{t('profile.open')} ({userInfo.nickname || userInfo.username})</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className={`${styles.mobileActionButton} flex items-center space-x-2 text-rose-500`}
                                >
                                    <LogOut aria-hidden="true" className="w-4 h-4" />
                                    <span className="text-sm font-medium">{t('nav.logout')}</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className={`${styles.mobileActionButton} flex items-center space-x-2 text-primary`}
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


