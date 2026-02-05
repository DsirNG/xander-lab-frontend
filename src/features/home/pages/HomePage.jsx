// React 相关
import React from 'react'
import { useTranslation } from 'react-i18next'

// 第三方库
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Code, Zap, Layout, Box } from 'lucide-react'

// 样式文件
import styles from './HomePage.module.css'

const Hero = () => {
    const { t } = useTranslation()

    return (
        <section className={styles.heroSection}>
            <div className={styles.heroBackground} />

            <div className={styles.container}>
                <div className={styles.heroContent}>
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className={styles.badge}>
                                {t('hero.badge')}
                            </span>
                            <h1 className={styles.heroTitle}>
                                {t('hero.title')} <br />
                                <span className={styles.gradientText}>
                                    {t('hero.gradient')}
                                </span>
                            </h1>
                            <p className={styles.heroDescription}>
                                {t('hero.desc')}
                            </p>

                            <div className={styles.buttonGroup}>
                                <Link to="/infra" className={styles.btnPrimary}>
                                    {t('nav.infra')}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                                {/*todo https://github.com*/}
                                <a href="" className={styles.btnSecondary}>
                                    {t('common.viewSource')}
                                    <Code className="ml-2 w-5 h-5" />
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Content */}
                    <div className="mt-16 lg:mt-0 hidden lg:block">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative"
                        >
                            <div className={styles.visualBlock}>
                                <div className={styles.codeDots}>
                                    <div className={`${styles.dot} ${styles.dotRed}`} />
                                    <div className={`${styles.dot} ${styles.dotYellow}`} />
                                    <div className={`${styles.dot} ${styles.dotGreen}`} />
                                </div>
                                <div className={styles.codeLines}>
                                    <div className={`${styles.line} w-3/4`} />
                                    <div className={`${styles.line} w-1/2`} />
                                    <div className={`${styles.line} w-full`} />
                                    <div className={`${styles.line} w-2/3`} />
                                </div>

                                <motion.div
                                    initial={{ y: 0 }}
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className={styles.floatingBadge}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="flex items-center justify-center p-2 rounded-lg bg-green-100 text-green-600">
                                            <Zap className="w-6 h-6" />
                                        </span>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase">{t('hero.performance')}</p>
                                            <p className="font-bold text-gray-900 dark:text-white">99/100</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Features = () => {
    const { t } = useTranslation()
    const features = [
        {
            icon: <Box className="w-6 h-6 text-white" />,
            title: t('features.composable.title'),
            description: t('features.composable.desc'),
            color: "bg-blue-500"
        },
        {
            icon: <Layout className="w-6 h-6 text-white" />,
            title: t('features.themable.title'),
            description: t('features.themable.desc'),
            color: "bg-purple-500"
        },
        {
            icon: <Zap className="w-6 h-6 text-white" />,
            title: t('features.performant.title'),
            description: t('features.performant.desc'),
            color: "bg-orange-500"
        }
    ]

    return (
        <section className={styles.featureSection}>
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{t('features.title')}</h2>
                    <p className={styles.sectionDesc}>
                        {t('features.desc')}
                    </p>
                </div>

                <div className={styles.featureGrid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.featureCard}>
                            <div className={`${styles.featureIconBox} ${feature.color}`}>
                                {feature.icon}
                            </div>
                            <h3 className={styles.featureTitle}>{feature.title}</h3>
                            <p className={styles.featureDesc}>
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const HomePage = () => {
    return (
        <div className="w-full">
            <Hero />
            {/* <Features /> - Temporarily hidden until platform orientation is finalized */}
        </div>
    )
}

export default HomePage