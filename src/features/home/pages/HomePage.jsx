import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarClock, Code2, Mail, Send, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

const featureDefinitions = [
  { key: 'agent', to: '/workspace/agent', icon: CalendarClock },
  { key: 'email', to: '/profile', icon: Mail },
  { key: 'demo', to: '/workspace/studio/component', icon: Code2 },
];

function AgentPreview() {
  const { t } = useTranslation();
  return <div className={styles.agentPreview} aria-hidden="true">
    <div className={styles.previewBar}><span>{t('home.previews.agent.newTask')}</span><span className={styles.saved}>{t('home.previews.agent.saved')}</span></div>
    <div className={styles.field}><span>{t('home.previews.agent.topic')}</span><strong>{t('home.previews.agent.topicValue')}</strong></div>
    <div className={styles.previewRow}><div className={styles.field}><span>{t('home.previews.agent.schedule')}</span><strong>{t('home.previews.agent.scheduleValue')}</strong></div><div className={styles.field}><span>{t('home.previews.agent.article')}</span><strong>{t('home.previews.agent.generating')}</strong></div></div>
    <div className={styles.syncLine}><span>{t('home.previews.agent.nextRun')}</span><span>{t('home.previews.agent.synced')}</span></div>
  </div>;
}

function EmailPreview() {
  const { t } = useTranslation();
  return <div className={styles.emailPreview} aria-hidden="true">
    <div className={styles.mailMeta}><span>{t('home.previews.email.to')}</span><strong>{t('home.previews.email.subscribers')}</strong><span>CC</span></div>
    <div className={styles.mailSubject}>{t('home.previews.email.subject')}</div>
    <div className={styles.mailBody}>{t('home.previews.email.greeting')}<br /><br />{t('home.previews.email.body')}<br /><br />— {t('home.previews.email.signature')}</div>
    <div className={styles.mailSchedule}><Send size={14} /> <span>{t('home.previews.email.schedule')}</span><span>10:00</span></div>
  </div>;
}

function DemoPreview() {
  const { t } = useTranslation();
  return <div className={styles.demoPreview} aria-hidden="true">
    <div className={styles.previewBar}><span>{t('home.previews.demo.preview')}</span><span>{t('home.previews.demo.code')}</span><Share2 size={15} /></div>
    <div className={styles.demoBody}><div className={styles.demoControls}><span>{t('home.previews.demo.button')}</span><button type="button">{t('home.previews.demo.primary')}</button><button type="button">{t('home.previews.demo.secondary')}</button><button type="button">{t('home.previews.demo.ghost')}</button></div><pre>{`export function Button({ variant }) {\n  return <button className={variant}>\n    {children}\n  </button>\n}`}</pre></div>
  </div>;
}

const PreviewByFeature = { agent: AgentPreview, email: EmailPreview, demo: DemoPreview };

function Hero() {
  const { t } = useTranslation();
  return <section className={styles.hero}><div className={styles.gridOverlay} /><div className={styles.heroContent}>
    <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}>
      <p className={styles.version}>{t('home.version')}</p>
      <h1><span>{t('home.hero.filled')}</span><span className={styles.outline}>{t('home.hero.outline')}</span></h1>
      <p className={styles.heroDescription}>{t('home.hero.description')}</p>
      <div className={styles.heroActions}><a href="#tools" className={styles.primaryButton}>{t('home.hero.explore')}</a><Link to="/workspace/studio" className={styles.textAction}>{t('home.hero.studio')} <ArrowRight size={19} /></Link></div>
    </motion.div>
  </div></section>;
}

function ToolSection({ definition, index }) {
  const { t } = useTranslation();
  const Preview = PreviewByFeature[definition.key];
  const Icon = definition.icon;
  return <section className={`${styles.toolSection} ${index % 2 ? styles.toolSectionReverse : ''}`}>
    <div className={styles.toolCopy}><span className={styles.toolIndex}>0{index + 1}</span><span className={styles.toolLabel}><Icon size={15} /> {t(`home.tools.${definition.key}.label`)}</span><h2>{t(`home.tools.${definition.key}.title`)}</h2><p>{t(`home.tools.${definition.key}.description`)}</p><Link className={styles.toolAction} to={definition.to}>{t(`home.tools.${definition.key}.action`)} <ArrowRight size={17} /></Link></div>
    <Preview />
  </section>;
}

function ArticleList() {
  const { t } = useTranslation();
  const articles = ['accessibility', 'designTokens', 'automation'];
  return <section className={styles.articles}><div className={styles.articlesHeader}><h2>{t('home.articles.title')}</h2><Link to="/blog" className={styles.toolAction}>{t('home.articles.all')} <ArrowRight size={17} /></Link></div><div>{articles.map((article) => <Link to="/blog" className={styles.articleRow} key={article}><span>{t(`home.articles.items.${article}.date`)}</span><strong>{t(`home.articles.items.${article}.title`)}</strong><em>{t(`home.articles.items.${article}.tag`)}</em></Link>)}</div></section>;
}

export default function HomePage() {
  return <main className={styles.page}><Hero /><div id="tools" className={styles.tools}>{featureDefinitions.map((definition, index) => <ToolSection key={definition.key} definition={definition} index={index} />)}</div><ArticleList /></main>;
}
