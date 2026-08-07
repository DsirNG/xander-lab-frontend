/** Shared route boundaries kept outside router configuration for Fast Refresh. */
import { Suspense } from 'react'
import LoadingSpinner from '@components/common/LoadingSpinner'
import ProtectedRoute from '@features/auth/components/ProtectedRoute'

export const LazyPage = ({ children }) => (
  <Suspense fallback={<LoadingSpinner fullScreen />}>
    {children}
  </Suspense>
)

export const ProtectedPage = ({ page }) => (
  <ProtectedRoute>
    <LazyPage>{page}</LazyPage>
  </ProtectedRoute>
)
