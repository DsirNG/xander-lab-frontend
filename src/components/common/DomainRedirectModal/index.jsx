import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import Modal from '@components/common/Modal';
import Button from '@components/common/Button';
import { ENV_CONFIG } from '@config/env';

const OFFICIAL_HOSTS = ['dinqor.cn', 'www.dinqor.cn'];

/**
 * 域名迁移提示弹窗
 * 在非官方域名 (dinqor.cn) 访问时提示用户前往新域名。
 * 仅生产环境生效，本地开发（localhost / 127.0.0.1 / 私有网段）不提示。
 */
export default function DomainRedirectModal() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!ENV_CONFIG.IS_PROD) return;
    const { hostname } = window.location;
    if (!hostname) return;
    const isOfficial = OFFICIAL_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
    if (isOfficial) return;
    if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0|::1)$/.test(hostname)) return;
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <Modal
      isOpen={show}
      onClose={() => setShow(false)}
      title={t('common.domainRedirect.title', '网站已迁移')}
      width="max-w-sm"
      footer={
        <>
          <Button variant="ghost" size="lg" onClick={() => setShow(false)}>
            {t('common.domainRedirect.stay', '继续浏览')}
          </Button>
          <Button
            variant="primary"
            size="lg"
            icon={Globe}
            onClick={() => {
              window.location.href = 'https://dinqor.cn';
            }}
          >
            {t('common.domainRedirect.goToNew', '前往 dinqor.cn')}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
          <Globe className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="text-body font-medium leading-6 text-ink-muted">
          {t('common.domainRedirect.description', '本网站已迁移至新域名 dinqor.cn，请访问新域名获取最新内容与完整功能。')}
        </div>
      </div>
    </Modal>
  );
}
