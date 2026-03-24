import { Navigate, useLocation } from "react-router-dom"

import { getStoredUser } from "../utils/auth"

function ProtectedRoute({ children }) {
  const location = useLocation()
  const user = getStoredUser()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export default ProtectedRoute

