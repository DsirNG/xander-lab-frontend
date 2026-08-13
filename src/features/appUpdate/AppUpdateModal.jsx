import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Modal from '@components/common/Modal'
import { reloadApp } from './appUpdate'

export default function AppUpdateModal({ isOpen }) {
  const { t } = useTranslation()

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      title={t('common.appUpdate.title')}
      closeOnOutsideClick={false}
      hideCloseButton
      width="max-w-sm"
      footer={(
        <button
          type="button"
          onClick={reloadApp}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 text-body font-semibold text-white transition-opacity hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {t('common.appUpdate.refresh')}
        </button>
      )}
    >
      <p className="text-body text-ink-secondary">
        {t('common.appUpdate.description')}
      </p>
    </Modal>
  )
}
