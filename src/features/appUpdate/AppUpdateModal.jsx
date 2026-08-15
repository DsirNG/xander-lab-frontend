import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Modal from '@components/common/Modal'
import Button from '@components/common/Button'
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
        <Button
          type="button"
          onClick={reloadApp}
          variant="primary"
          size="lg"
          icon={RefreshCw}
          className="w-full justify-center gap-2 rounded-lg font-semibold transition-opacity hover:opacity-90"
        >
          {t('common.appUpdate.refresh')}
        </Button>
      )}
    >
      <div className="text-body text-ink-secondary">
        {t('common.appUpdate.description')}
      </div>
    </Modal>
  )
}
