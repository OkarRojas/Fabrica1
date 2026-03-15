import './App.css'
import Head from './components/head/head.jsx'
import Header from './components/header/header.jsx'
import Bloques from './components/bloques/bloques.jsx'
import Mapa from './components/mapas/mapa.jsx'
import Footer from './components/footer/footer.jsx'
import Productos from './components/producctos/productos.jsx'
import { Route, Routes } from 'react-router-dom'
import Malla from './components/malla/malla.jsx'
import Carrito from './components/carrito/carrito.jsx'

function App() {
  return (
    <>
      
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Head />
              <Header />
              <Bloques />
              <Mapa />
              <Footer />
            </>
          }
        />
        <Route
          path="/productos"
          element={
            <>
              <Head />
              <Carrito />
              <Productos />
              
              <Malla />
              

            </>
          }
        />
        <Route
          path="/puntos-de-venta"
          element={
            <>
              <Header />
              <Mapa />
            </>
          }
        />
        <Route
          path="*"
          element={
            <>
              <Header />
              <Bloques />
              <Mapa />
            </>
          }
        />
      </Routes>
      
    </>
  )
}

export default App
