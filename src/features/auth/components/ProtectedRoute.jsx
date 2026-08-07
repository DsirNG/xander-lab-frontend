/**
 * Central route boundary for pages that require a server-validated session.
 * Cached profile data is presentation data only and is never used as proof of login.
 */
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { authService } from '../services/authService'

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let active = true

    authService.checkCurrentSession()
      .then((user) => {
        if (active) setStatus(user ? 'authenticated' : 'anonymous')
      })
      .catch(() => {
        if (active) setStatus('anonymous')
      })

    return () => { active = false }
  }, [])

  if (status === 'checking') return <LoadingSpinner fullScreen />
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
