import React from "react";
import "./card.css";
import { useCarrito } from "../context/CarritoContext";

const ProductCard = ({ producto, onVerDetalle }) => {
  const [cantidad, setCantidad] = React.useState(1);
  const { agregarItem } = useCarrito();

  const disminuir = () => setCantidad((prev) => Math.max(1, prev - 1));
  const incrementar = () => setCantidad((prev) => prev + 1);

  const handleAgregar = (e) => {
    e.stopPropagation();
    agregarItem(producto, cantidad);
    setCantidad(1);
  };

  return (
    <div
      className="product-card"
      onClick={() => onVerDetalle && onVerDetalle(producto)}
    >
      {/* Imagen */}
      <img
        src={producto.imagen}
        alt={producto.nombre}
        style={{ height: `${producto.altura}px` }} /* ← altura dinámica */
      />


      {/* Nombre + Precio + Volumen */}
      <div className="product-card-content">
        <div className="product-card-info">
          <h3>{producto.nombre}</h3>
          <span className="volumen">{producto.volumen}</span>
        </div>
        <p className="precio">{producto.precio}</p>
      </div>

      {/* Selector cantidad + botón — aparecen en hover */}
      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
        <div className="cantidad-selector">
          <button className="cantidad-btn" onClick={disminuir}>−</button>
          <span className="cantidad-valor">{cantidad}</span>
          <button className="cantidad-btn" onClick={incrementar}>+</button>
        </div>
        <button className="add-button1" onClick={handleAgregar}>
          +
        </button>
      </div>

    </div>
  );
};

export default ProductCard;
