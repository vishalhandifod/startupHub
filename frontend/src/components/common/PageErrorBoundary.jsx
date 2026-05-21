import { AlertTriangle } from 'lucide-react'
import { ErrorBoundary } from 'react-error-boundary'
import EmptyState from './EmptyState.jsx'

function Fallback() {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="Something went wrong"
      message="This page hit an unexpected problem. Refresh the page to try again."
    />
  )
}

export default function PageErrorBoundary({ children }) {
  return <ErrorBoundary fallbackRender={() => <Fallback />}>{children}</ErrorBoundary>
}
