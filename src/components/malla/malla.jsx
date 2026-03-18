import React, { useState, useMemo } from 'react';
import ProductCard from '../card/card.jsx';
import Modal from '../modal/modal.jsx';
import FiltrosSidebar from '../filtros/filtrossidebar.jsx';
import "./malla.css";

import pam        from '../../assets/pam.jpg';
import pam2       from '../../assets/pam2.jpg';
import pam3       from '../../assets/pam3.jpg';
import pam4       from '../../assets/pam4.jpg';
import pam5       from '../../assets/pam5.jpg';
import pam6       from '../../assets/pam6.jpg';


const productos = [
  { id: 1, nombre: 'Pan de Arroz Artesanal', precio: '$4.99', volumen: '250g', imagen: pam,  altura: 220 },
  { id: 2, nombre: 'Pan de Arroz Artesanal', precio: '$4.99', volumen: '250g', imagen: pam2, altura: 300 },
  { id: 3, nombre: 'Pan de Arroz Artesanal', precio: '$4.99', volumen: '250g', imagen: pam3, altura: 260 },
  { id: 4, nombre: 'Pan de Arroz Artesanal', precio: '$4.99', volumen: '250g', imagen: pam4, altura: 340 },
  { id: 5, nombre: 'Pan de Arroz Artesanal', precio: '$4.99', volumen: '250g', imagen: pam5, altura: 200 },
  { id: 6, nombre: 'Pan de Arroz Artesanal', precio: '$4.99', volumen: '250g', imagen: pam6, altura: 280 },
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
