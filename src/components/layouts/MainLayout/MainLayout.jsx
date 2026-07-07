import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Github, Menu, Languages, X, User as UserIcon, LogOut } from 'lucide-react';
import styles from './MainLayout.module.css';
import { authService } from '@features/auth/services/authService';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userInfo, setUserInfo] = useState(authService.getLocalUserInfo());
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

    // 监听全局登出事件
    useEffect(() => {
        const checkAuth = () => setUserInfo(null);
        window.addEventListener('auth:logout', checkAuth);
        return () => window.removeEventListener('auth:logout', checkAuth);
    }, []);

    // 路由变化时关闭移动菜单并同步用户信息
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setUserInfo(authService.getLocalUserInfo());
    }, [location.pathname]);

    const toggleLanguage = () => {
        const nextLng = i18n.language.startsWith('zh') ? 'en' : 'zh';
        i18n.changeLanguage(nextLng);
    };

    const currentLang = i18n.language.startsWith('zh') ? '中文' : 'EN';

    // 点击外部关闭菜单
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

    const navLinks = [
        { path: '/', label: t('nav.home') },
        { path: '/components', label: t('nav.components') },
        { path: '/blog', label: t('nav.blog') },
    ];

    return (
        <>
            <nav aria-label="主导航" className={styles.navbar}>
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
                            <button
                                onClick={toggleLanguage}
                                className={`${styles.iconButton} hidden sm:flex items-center space-x-1 px-2 sm:px-3`}
                                title="Toggle Language"
                            >
                                <Languages aria-hidden="true" className="w-4 h-4" />
                                <span className="text-xs font-bold hidden sm:inline">{currentLang}</span>
                            </button>
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
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-bold text-slate-900  leading-tight">
                                                {userInfo.nickname || userInfo.username}
                                            </span>
                                            <span className="text-[9px] text-slate-400 leading-tight">
                                                {userInfo.role}
                                            </span>
                                        </div>
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
                                aria-label="菜单"
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
                            onClick={toggleLanguage}
                            className={`${styles.mobileActionButton} flex items-center space-x-2`}
                        >
                            <Languages aria-hidden="true" className="w-4 h-4" />
                            <span className="text-sm font-medium">{currentLang}</span>
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
                            <button
                                onClick={handleLogout}
                                className={`${styles.mobileActionButton} flex items-center space-x-2 text-rose-500`}
                            >
                                <LogOut aria-hidden="true" className="w-4 h-4" />
                                <span className="text-sm font-medium">{t('nav.logout')} ({userInfo.nickname || userInfo.username})</span>
                            </button>
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
    const isHomePage = location.pathname === '/';

    return (
        <div className={styles.layoutContainer}>
            <Navbar />
            <main id="main-content" tabIndex={-1} className={styles.mainContent}>
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;


