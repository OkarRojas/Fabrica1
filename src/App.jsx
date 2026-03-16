import './App.css'
import Head from './components/head/head.jsx'
import Header from './components/header/header.jsx'
import Bloques from './components/bloques/bloques.jsx'
import Mapa from './components/mapas/mapa.jsx'
import Footer from './components/footer/footer.jsx'
import Productos from './components/producctos/productos.jsx'
import { Route, Routes } from 'react-router-dom'
import Malla from './components/malla/malla.jsx'
import Chat from './components/chat/chat.jsx'
import Carrito from './components/carrito/carrito.jsx'
import ContactForm from './components/form/contactform.jsx'

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
          path="/contacto"
          element={
            <>
              <Head />
              <ContactForm />
              
            </>
          }
        />  
               
        
      </Routes>
      
    </>
  )
}

export default App
