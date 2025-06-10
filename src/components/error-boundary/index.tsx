import React, { Component, ErrorInfo } from 'react'
import * as Sentry from '@sentry/browser'
import ErrorBoundaryMessage from '../error-boundary-message'

interface ErrorBoundaryProps {
  children: React.ReactNode | React.ReactNode[]
}

class ErrorBoundary extends Component<ErrorBoundaryProps> {
  state: { hasError: boolean; error: Error | null }
  lastError: Error | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (
      error.message.includes('Loading chunk') ||
      error.message.includes('JWT expired')
    ) {
      window.location.reload()
      return
    }

    if (error.message.includes('discord-avatars')) {
      return
    }

    this.lastError = error

    // Do regular .log() here just in case .error() triggers Sentry twice
    console.log('ErrorBoundary.error', error, errorInfo)
    Sentry.captureException(error)
  }

  onOkay = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryMessage onOkay={this.onOkay} />
    }

    return this.props.children
  }
}

export default ErrorBoundary
