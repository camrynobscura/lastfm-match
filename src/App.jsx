// import './App.scss'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './components/Home'

function App() {

  return (
    <ErrorBoundary>
      <Home />
    </ErrorBoundary>
  )
}

export default App
