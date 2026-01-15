import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layers, Github, Menu, Languages } from 'lucide-react';
import styles from './MainLayout.module.css';

const Navbar = () => {
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const nextLng = i18n.language.startsWith('zh') ? 'en' : 'zh';
        i18n.changeLanguage(nextLng);
    };

    const currentLang = i18n.language.startsWith('zh') ? '中文' : 'EN';

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.navContent}>
                    <Link to="/" className={styles.logoArea}>
                        <Layers className="w-8 h-8 text-primary" />
                        <span className={styles.logoText}>
                            Xander Lab
                        </span>
                    </Link>

                    <div className={styles.desktopNav}>
                        <div className={styles.navLinks}>
                            <Link to="/" className={styles.navLink}>{t('nav.home')}</Link>
                            <Link to="/infra" className={styles.navLink}>{t('nav.infra')}</Link>
                            <Link to="/modules" className={styles.navLink}>{t('nav.modules')}</Link>
                        </div>
                    </div>

                    <div className={styles.actionsArea}>
                        <button
                            onClick={toggleLanguage}
                            className={`${styles.iconButton} flex items-center space-x-1 px-3`}
                            title="Toggle Language"
                        >
                            <Languages className="w-4 h-4" />
                            <span className="text-xs font-bold">{currentLang}</span>
                        </button>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.iconButton}>
                            <Github className="w-5 h-5" />
                        </a>
                        <button className={styles.menuButton}>
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
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
                            < li > <Link to="/hooks" className={styles.footerLink}>{t('footer.Modules')}</Link></li>
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
