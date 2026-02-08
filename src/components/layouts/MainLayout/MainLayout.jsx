import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layers, Github, Menu, Languages, X } from 'lucide-react';
import styles from './MainLayout.module.css';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const toggleLanguage = () => {
        const nextLng = i18n.language.startsWith('zh') ? 'en' : 'zh';
        i18n.changeLanguage(nextLng);
    };

    const currentLang = i18n.language.startsWith('zh') ? '中文' : 'EN';

    // 路由变化时关闭移动菜单
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

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
        { path: '/infra', label: t('nav.infra') },
        { path: '/modules', label: t('nav.modules') },
        { path: '/components', label: t('nav.components') },
        { path: '/blog', label: t('nav.blog') },
    ];

    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.container}>
                    <div className={styles.navContent}>
                        <Link to="/" className={styles.logoArea} onClick={() => setIsMobileMenuOpen(false)}>
                            <Layers className="w-8 h-8 text-primary" />
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
                                <Languages className="w-4 h-4" />
                                <span className="text-xs font-bold hidden sm:inline">{currentLang}</span>
                            </button>
                            <a
                                href="https://github.com/DsirNG/xander-lab-frontend"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${styles.iconButton} hidden sm:flex`}
                                aria-label="GitHub"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={styles.menuButton}
                                aria-label="菜单"
                                aria-expanded={isMobileMenuOpen}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                ) : (
                                    <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

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
                            <Languages className="w-4 h-4" />
                            <span className="text-sm font-medium">{currentLang}</span>
                        </button>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.mobileActionButton} flex items-center space-x-2`}
                        >
                            <Github className="w-5 h-5" />
                            <span className="text-sm font-medium">GitHub</span>
                        </a>
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
                            {/* <li><a href="#" className={styles.footerLink}>{t('footer.docs')}</a></li> */}
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
            <main className={styles.mainContent}>
                <Outlet />
            </main>
            {isHomePage && <Footer />}
        </div>
    );
};

export default MainLayout;


