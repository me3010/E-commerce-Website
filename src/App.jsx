import { useEffect, useState } from 'react'
import Loader from './components/common/Loader/Loader'
import AppRouter from './routes/AppRouter/AppRouter'

export default function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsLoading(false), 120)

    return () => window.clearTimeout(timeoutId)
  }, [])

  return isLoading ? <Loader /> : <AppRouter />
}
