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
import { CarritoProvider } from './components/context/CarritoContext.jsx'
import ChatBot from './components/chatbot/chatbot.jsx'
import Users from './components/users/users.jsx'
import Envio from './components/envio/envio.jsx'
import Checkout from './components/checkout/checkout.jsx'

function App() {
  return (
    /* COLOCAMOS EL PROVIDER AQUÍ: 
       Ahora el carrito es "global". Lo que agregues en una página
       se mantendrá guardado cuando navegues a otra.
    */
    <CarritoProvider>
      <ChatBot />
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
              <Productos />
              <Malla />
              <Carrito />
              {/* Quitamos el Provider de aquí adentro */}
            </>
          }
        />

        <Route
          path="/contacto"
          element={
            <>
              <Head />
              <ContactForm />
              <Footer />
            </>
          }
        />  

        <Route
          path="/users"
          element={
            <>
              <Head />
              <Users />
              <Footer />
            </>
          }
        />

        <Route
          path="/envio"
          element={
            <>
              <Head />
              <Envio />
              <Footer />
            </>
          }
        />

        <Route
          path="/checkout"
          element={
            <>
              <Head />
              <Checkout />
              <Footer />
              {/* Limpiamos las etiquetas mal cerradas que tenías aquí */}
            </>
          }
        />
      </Routes>
    </CarritoProvider>
  );
}

export default App;