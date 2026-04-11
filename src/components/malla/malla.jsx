import React, { useState, useMemo, useEffect } from 'react';
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


const productosLocales = [
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
  const [precioMax, setPrecioMax] = useState(100000);
  const [pandearroz, setPandearroz] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // La función que hace el "viaje" al backend
    const obtenerDatos = async () => {
      try {
        const respuesta = await fetch("http://localhost:8000/crud/pandearroz/");
        const datos = await respuesta.json();
        // Acepta respuesta como arreglo directo o dentro de una propiedad "data"
        const lista = Array.isArray(datos)
          ? datos
          : Array.isArray(datos?.data)
            ? datos.data
            : [];

        setPandearroz(lista);
      } catch (error) {
        console.error("Error al conectar:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerDatos();
  }, []); // El [] vacío hace que solo se ejecute UNA vez al cargar

  const listaProductos = useMemo(() => {
    if (pandearroz.length === 0) {
      return productosLocales;
    }

    return pandearroz.map((producto, index) => {
      const plantilla = productosLocales[index % productosLocales.length];
      const precioFormateado =
        typeof producto.precio === 'number'
          ? `$${producto.precio.toFixed(2)}`
          : (producto.precio ?? plantilla.precio);

      return {
        ...plantilla,
        ...producto,
        precio: precioFormateado,
        volumen: producto.stock != null ? `${producto.stock} disponibles` : plantilla.volumen,
        imagen: plantilla.imagen,
        altura: plantilla.altura,
      };
    });
  }, [pandearroz]);

  const productosFiltrados = useMemo(() => {
    return listaProductos.filter((p) => {
      const precio = Number(String(p.precio ?? '0').replace(/[^0-9.,-]/g, '').replace(',', '.')) || 0;
      const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria =
        categorias.length === 0 || categorias.includes(p.categoria);
      const coincidePrecio = precio <= precioMax;
      return coincideNombre && coincideCategoria && coincidePrecio;
    });
  }, [listaProductos, busqueda, categorias, precioMax]);

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
          todasCategorias={[...new Set(listaProductos.map((p) => p.categoria).filter(Boolean))]}
        />

        {/* Grid productos */}
      <div className="malla-container">
        <div className="product-grid-container">
          {cargando ? (
            <p className="sin-resultados">Cargando productos...</p>
          ) : productosFiltrados.length === 0 ? (
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
          key={productoSeleccionado?.id || "vacio"} 
          producto={productoSeleccionado}
          onClose={() => setProductoSeleccionado(null)}
        />
      </div>

    </div>
  );
};

export default Malla;
