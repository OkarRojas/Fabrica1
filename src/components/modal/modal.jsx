import React from "react";
import "./modal.css";
import { useCarrito } from "../context/CarritoContext";

const Modal = ({ producto, onClose }) => {
  const [cantidad, setCantidad] = React.useState(1);
  const { agregarItem } = useCarrito();

  if (!producto) return null;

  const handleAgregar = () => {
    agregarItem(producto, cantidad);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>

        {/* Botón cerrar */}
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Imagen */}
        <div className="modal-img-col">
          <img src={producto.imagen} alt={producto.nombre} className="modal-img" />
        </div>

        {/* Info */}
        <div className="modal-info-col">
          <h2 className="modal-nombre">{producto.nombre}</h2>
          <p className="modal-volumen">{producto.volumen}</p>
          <p className="modal-descripcion">
            Pan artesanal horneado diariamente con ingredientes 100% naturales.
            Crujiente por fuera, suave por dentro. ¡Ideal para cualquier momento del día!
          </p>

          <div className="valor-cantidad">
          <p className="modal-precio">{producto.precio}</p>

          {/* Selector cantidad */}
          <div className="modal-acciones">
            <div className="modal-cantidad">
              <button className="modal-ctrl-btn" onClick={() => setCantidad(c => Math.max(1, c - 1))}>−</button>
              <span className="modal-ctrl-valor">{cantidad}</span>
              <button className="modal-ctrl-btn" onClick={() => setCantidad(c => c + 1)}>+</button>
            </div>
          </div>
          </div>
          <button className="modal-btn-agregar" onClick={handleAgregar}>
              + Agregar al carrito
            </button>
        </div>

      </div>
    </div>
  );
};

export default Modal;
