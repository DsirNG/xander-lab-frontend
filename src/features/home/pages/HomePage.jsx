import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Terminal, ChevronRight, Github } from 'lucide-react'
import styles from './HomePage.module.css'

const Hero = () => {
  const { t } = useTranslation()

  return (
    <section className={styles.heroSection}>
      {/* 这里的网格背景比圆圈渐变高级得多 */}
      <div className={styles.gridOverlay} />

      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={styles.heroMain}
        >
          {/* 这种胶囊标签比原来的 Badge 更具动感 */}
          <div className={styles.announcement}>
            {/*<span className={styles.versionTag}>v2.0</span>*/}
            <span className={styles.announcementText}>{t('hero.badge')}</span>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </div>

          <h1 className={styles.megaTitle}>
            {t('hero.title')}
            <span className={styles.outlineText}>{t('hero.gradient')}</span>
          </h1>

          <p className={styles.subtext}>
            {t('hero.desc')}
          </p>

          <div className={styles.ctaWrapper}>
            <Link to="/components" className={styles.mainButton}>
              Start Building
            </Link>
            <a href="https://github.com/DsirNG/xander-lab-frontend" className={styles.ghostButton}>
              <Github className="w-5 h-5 mr-2" />
              {t('common.viewSource')}
            </a>
          </div>
        </motion.div>

        {/* 装饰元素：不再是假窗口，而是抽象的几何呼吸感 */}
        <div className={styles.visualCanvas}>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className={styles.abstractGlow}
          />
        </div>
      </div>
    </section>
  )
}

const HomePage = () => {
  return (
    <main className={styles.pageWrapper}>
      <Hero />
    </main>
  )
}

export default HomePage
