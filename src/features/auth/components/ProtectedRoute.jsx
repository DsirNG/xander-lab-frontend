/**
 * Central route boundary for pages that require a server-validated session.
 * Cached profile data is presentation data only and is never used as proof of login.
 */
import { Navigate, useLocation } from 'react-router-dom'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { useAuthSession } from '../context/authSessionContextValue'

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const { sessionStatus } = useAuthSession()

  if (sessionStatus === 'checking') return <LoadingSpinner fullScreen />
  if (sessionStatus === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
