import React, { useState, useMemo } from 'react';
import ProductCard from '../card/card.jsx';
import Modal from '../modal/modal.jsx';
import FiltrosSidebar from '../filtros/filtrossidebar.jsx';
import "./malla.css";

const productos = [
  { id: 1, nombre: 'Pan de Arroz Artesanal',  categoria: 'Panes',   precio: '$4.99', volumen: '250g', imagen: '/src/assets/pam.jpg',        altura: 220 },
  { id: 2, nombre: 'Pandebono',                categoria: 'Panes',   precio: '$3.99', volumen: '200g', imagen: '/src/assets/pam2.jpg',       altura: 300 },
  { id: 3, nombre: 'Pan de Yuca',              categoria: 'Panes',   precio: '$5.99', volumen: '300g', imagen: '/src/assets/pam3.jpg',       altura: 260 },
  { id: 4, nombre: 'Jugo de Piña',             categoria: 'Bebidas', precio: '$2.99', volumen: '500ml',imagen: '/src/assets/pam4.jpg',       altura: 340 },
  { id: 5, nombre: 'Jugo de Naranja',          categoria: 'Bebidas', precio: '$2.99', volumen: '500ml',imagen: '/src/assets/pam5.jpg',    altura: 200 },
  { id: 6, nombre: 'Jugo Multifruta',          categoria: 'Bebidas', precio: '$3.49', volumen: '500ml',imagen: '/src/assets/pam6.jpg', altura: 280 },
];

const Malla = () => {
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [precioMax, setPrecioMax] = useState(10);

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const precio = parseFloat(p.precio.replace('$', ''));
      const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = categorias.length === 0 || categorias.includes(p.categoria);
      const coincidePrecio = precio <= precioMax;
      return coincideNombre && coincideCategoria && coincidePrecio;
    });
  }, [busqueda, categorias, precioMax]);

  return (
    <div className="malla-layout"> {/* ← nuevo wrapper */}

      {/* Sidebar filtros */}
      <FiltrosSidebar
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        categorias={categorias}
        setCategorias={setCategorias}
        precioMax={precioMax}
        setPrecioMax={setPrecioMax}
        todasCategorias={[...new Set(productos.map(p => p.categoria))]}
      />

      {/* Grid productos */}
      <div className="malla-container">
        <div className="product-grid-container">
          {productosFiltrados.length === 0 ? (
            <p className="sin-resultados">😕 No hay productos con esos filtros</p>
          ) : (
            productosFiltrados.map(producto => (
              <ProductCard
                key={producto.id}
                producto={producto}
                onVerDetalle={setProductoSeleccionado}
              />
            ))
          )}
        </div>
        <Modal
          producto={productoSeleccionado}
          onClose={() => setProductoSeleccionado(null)}
        />
      </div>

    </div>
  );
};

export default Malla;
