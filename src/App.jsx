import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Head from './components/head/head.jsx'
import Header from './components/header/header.jsx'
import Bloques from './components/bloques/bloques.jsx'
import Mapa from './components/mapas/mapa.jsx'
import Footer from './components/footer/footer.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Head />
    <Header />
    <Bloques />
    <Mapa />
    <Footer />
    </>
  )
}

export default App
