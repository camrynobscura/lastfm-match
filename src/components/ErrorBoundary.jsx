import { Component } from 'react'

// class-only: there's no hook equivalent for catching render errors in
// children. sits above <Home /> in App.jsx, so an unexpected response
// shape (or anything else that throws during render) turns into this
// recoverable box instead of unmounting the whole tree to a blank page.
class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role='alert' className='match-error'>
          <p>Something went wrong. Try reloading the page.</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
