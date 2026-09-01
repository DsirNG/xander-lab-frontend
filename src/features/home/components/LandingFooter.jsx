import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Github, QrCode } from "lucide-react";

const LandingFooter = ({ t }) => {
    return (
        <footer className="mt-24 border-t border-[#edf0f7] bg-white/70 backdrop-blur-md pt-14 pb-10 select-none">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                {/* Main Footer Links Columns */}
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
                    {/* Brand Column (2 cols on lg) */}
                    <div className="col-span-2">
                        <div className="flex items-center gap-2">
                            <img
                                src="/assets/workspace/workspace-logo.svg"
                                alt="DinQor AI"
                                className="h-7 w-7 object-contain"
                            />
                            <span className="text-base font-extrabold tracking-tight text-[#111426]">
                                DinQor AI
                            </span>
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-[#747b9a]">
                            {t("landing.footer.slogan")}
                        </p>
                    </div>

                    {/* Column 1: 产品 */}
                    <div>
                        <h4 className="text-xs font-bold text-[#111426] uppercase tracking-wider">
                            {t("landing.footer.prodTitle")}
                        </h4>
                        <ul className="mt-3 space-y-2 text-xs text-[#747b9a]">
                            <li>
                                <Link to="/workspace/img2three" className="hover:text-[#6366f1] transition-colors">
                                    {t("landing.footer.prod3d")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/workspace/ai" className="hover:text-[#6366f1] transition-colors">
                                    {t("landing.footer.prodAgent")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/workspace/plans" className="hover:text-[#6366f1] transition-colors">
                                    {t("landing.footer.prodAuto")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 2: 资源 */}
                    <div>
                        <h4 className="text-xs font-bold text-[#111426] uppercase tracking-wider">
                            {t("landing.footer.resTitle")}
                        </h4>
                        <ul className="mt-3 space-y-2 text-xs text-[#747b9a]">
                            <li>
                                <Link to="/blog" className="hover:text-[#6366f1] transition-colors">
                                    {t("landing.footer.resDocs")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/components" className="hover:text-[#6366f1] transition-colors">
                                    {t("landing.footer.resApi")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/workspace/studio" className="hover:text-[#6366f1] transition-colors">
                                    {t("landing.footer.resMcp")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: 社区 */}
                    <div>
                        <h4 className="text-xs font-bold text-[#111426] uppercase tracking-wider">
                            {t("landing.footer.commTitle")}
                        </h4>
                        <ul className="mt-3 space-y-2 text-xs text-[#747b9a]">
                            <li>
                                <Link to="/blog" className="hover:text-[#6366f1] transition-colors">
                                    {t("landing.footer.commHall")}
                                </Link>
                            </li>
                            <li>
                                <a href="https://github.com/DsirNG/xander-lab-frontend" target="_blank" rel="noreferrer" className="hover:text-[#6366f1] transition-colors">
                                    {t("landing.footer.commDiscord")}
                                </a>
                            </li>
                            <li>
                                <Link to="/components" className="hover:text-[#6366f1] transition-colors">
                                    {t("landing.footer.commInspiration")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: 关注我们 */}
                    <div>
                        <h4 className="text-xs font-bold text-[#111426] uppercase tracking-wider">
                            {t("landing.footer.followUs")}
                        </h4>
                        <div className="mt-3 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#ebeef7] bg-[#f8fafc] text-[#6366f1]">
                                <QrCode className="h-8 w-8" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <a
                                    href="https://github.com/DsirNG/xander-lab-frontend"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f1f5f9] text-[#475569] hover:bg-[#6366f1] hover:text-white transition-colors"
                                    title="GitHub"
                                >
                                    <Github className="h-3.5 w-3.5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Copyright & Legal Links */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#f0f1f8] pt-6 text-micro text-[#8e94aa]">
                    <div>{t("landing.footer.copyright")}</div>
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="hover:text-[#6366f1] cursor-pointer">{t("landing.footer.terms")}</span>
                        <span>•</span>
                        <span className="hover:text-[#6366f1] cursor-pointer">{t("landing.footer.privacy")}</span>
                        <span>•</span>
                        <span className="hover:text-[#6366f1] cursor-pointer">{t("landing.footer.security")}</span>
                        <span>•</span>
                        <span className="hover:text-[#6366f1] cursor-pointer">{t("landing.footer.compliance")}</span>
                        <span className="hidden sm:inline">|</span>
                        <span>{t("landing.footer.icp")}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

LandingFooter.propTypes = {
    t: PropTypes.func.isRequired,
};

export default LandingFooter;
