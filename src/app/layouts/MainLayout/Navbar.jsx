import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Github,
    Menu,
    X,
    User as UserIcon,
} from "lucide-react";
import styles from "./Navbar.module.css";
import { useAuthSession } from "@features/auth";
import { NotificationBell } from "@features/blog";
import Button from "@shared/ui/primitives/Button";
import NavbarLanguageControl from "./NavbarLanguageControl";

const getDisplayName = (userInfo) =>
    userInfo?.nickname || userInfo?.username || "";
const getAvatarText = (userInfo) => {
    const name = getDisplayName(userInfo);
    return name ? name.slice(0, 2).toUpperCase() : "XL";
};

const Navbar = () => {
    const { t } = useTranslation();
    const { userInfo } = useAuthSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const displayName = getDisplayName(userInfo);
    const avatarText = getAvatarText(userInfo);
    const roleLabel = userInfo?.role || "";

    // 点击外部关闭菜单
    useEffect(() => {
        const handleClickOutside = (event) => {
            const mobileMenu = document.querySelector(`.${styles.mobileMenu}`);
            const menuButton = document.querySelector(`.${styles.menuButton}`);

            if (
                isMobileMenuOpen &&
                mobileMenu &&
                !mobileMenu.contains(event.target) &&
                menuButton &&
                !menuButton.contains(event.target)
            ) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            // 防止背景滚动
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "";
        };
    }, [isMobileMenuOpen]);

    const navLinks = [
        { path: "/", label: t("nav.home") },
        { path: "/components", label: t("nav.components") },
        { path: "/blog/", label: t("nav.blog") },
    ];

    const normalizePath = (path) => {
        const value = String(path || "/").replace(/\/+$/, "");
        return value || "/";
    };

    const isNavActive = (linkPath) => {
        const current = normalizePath(location.pathname);
        const target = normalizePath(linkPath);
        if (target === "/") return current === "/";
        return current === target || current.startsWith(`${target}/`);
    };

    return (
        <>
            <nav
                aria-label={t("common.aria.mainNav", "Main navigation")}
                className={styles.navbar}
            >
                <div className={styles.container}>
                    <div className={styles.navContent}>
                        <Link
                            to="/"
                            className={styles.logoArea}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <img
                                src="/assets/workspace/workspace-logo.svg"
                                alt=""
                                className={styles.logoImage}
                            />
                            <span className={styles.logoText}>DinQorAI</span>
                        </Link>

                        <div className={styles.desktopNav}>
                            <div className={styles.navLinks}>
                                {navLinks.map((link) => {
                                    const active = isNavActive(link.path);
                                    return (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                                            aria-current={
                                                active ? "page" : undefined
                                            }
                                        >
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.actionsArea}>
                            <NavbarLanguageControl />
                            <a
                                href="https://github.com/DsirNG/xander-lab-frontend"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${styles.iconButton} hidden sm:flex`}
                                aria-label="GitHub"
                            >
                                <Github
                                    aria-hidden="true"
                                    className="w-5 h-5"
                                />
                            </a>

                            {/* 用户区域：头像 + 名字，进入个人中心；退出仅在个人中心 */}
                            {userInfo ? <NotificationBell /> : null}
                            <div className="hidden sm:flex items-center ml-2 pl-2 border-l border-border ">
                                {userInfo ? (
                                    <Link
                                        to="/workspace"
                                        className={`flex items-center gap-2 rounded-xl px-1.5 py-1 transition focus:outline-none focus:ring-2 focus:ring-accent-200 ${
                                            isNavActive("/workspace")
                                                ? "bg-accent-soft"
                                                : "hover:bg-accent-soft"
                                        }`}
                                        title={t("workspace.title")}
                                        aria-label={t("workspace.title")}
                                        aria-current={
                                            isNavActive("/workspace")
                                                ? "page"
                                                : undefined
                                        }
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
                                        <UserIcon
                                            aria-hidden="true"
                                            className="w-3.5 h-3.5"
                                        />
                                        <span>{t("nav.login")}</span>
                                    </Link>
                                )}
                            </div>
                            <Button
                                onClick={() =>
                                    setIsMobileMenuOpen(!isMobileMenuOpen)
                                }
                                variant="ghost"
                                size="md"
                                icon={isMobileMenuOpen ? X : Menu}
                                aria-label={t(
                                    "common.aria.openMenu",
                                    "Open menu",
                                )}
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
                {t("nav.skipToMain")}
            </a>

            {/* 移动端菜单 */}
            <div
                className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ""}`}
            >
                <div className={styles.mobileMenuContent}>
                    <div className={styles.mobileNavLinks}>
                        {navLinks.map((link) => {
                            const active = isNavActive(link.path);
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`${styles.mobileNavLink} ${active ? styles.mobileNavLinkActive : ""}`}
                                    aria-current={active ? "page" : undefined}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className={styles.mobileMenuActions}>
                        <NavbarLanguageControl mobile />
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
                                    isNavActive("/workspace")
                                        ? "bg-accent-soft"
                                        : ""
                                }`}
                                aria-current={
                                    isNavActive("/workspace")
                                        ? "page"
                                        : undefined
                                }
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
                                        {t("workspace.title")}
                                    </span>
                                </span>
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className={`${styles.mobileActionButton} flex items-center space-x-2 text-accent`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <UserIcon
                                    aria-hidden="true"
                                    className="w-4 h-4"
                                />
                                <span className="text-sm font-medium">
                                    {t("nav.accountLogin")}
                                </span>
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
