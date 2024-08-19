import { useState } from 'react'
import Auth from './pages/auth'
import Home from './pages/Home/Index'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      {/* <Auth /> */}
      <Home />
    </div>
  )
}

export default App
