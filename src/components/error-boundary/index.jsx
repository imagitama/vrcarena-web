import React, { Component } from 'react'
import * as Sentry from '@sentry/browser'
import ErrorBoundaryMessage from '../error-boundary-message'

class ErrorBoundary extends Component {
  lastError = null

  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
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
      return (
        <ErrorBoundaryMessage error={this.state.error} onOkay={this.onOkay} />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
