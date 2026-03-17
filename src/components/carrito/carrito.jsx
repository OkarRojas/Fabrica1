import React from "react";
import "./carrito.css";
import { useCarrito } from "../context/CarritoContext";

const Carrito = () => {
  const { items, eliminarItem, sumarUnidad, restarUnidad, total,
          carritoAbierto, setCarritoAbierto } = useCarrito(); // ← NUEVO

  const cantidadTotal = items.reduce((acc, item) => acc + item.cantidad, 0); // ← NUEVO

  return (
    <>
      {/* Botón flotante 🛒 */}
      <button
        className="carrito-toggle-btn"
        onClick={() => setCarritoAbierto(prev => !prev)}
      >
        🛒
        {cantidadTotal > 0 && (
          <span className="carrito-badge">{cantidadTotal}</span>
        )}
      </button>

      {/* Overlay oscuro */}
      {carritoAbierto && (
        <div
          className="carrito-overlay"
          onClick={() => setCarritoAbierto(false)}
        />
      )}

      {/* Panel lateral */}
      <aside className={`carrito-aside ${carritoAbierto ? "abierto" : ""}`}>

        {/* Header */}
        <div className="carrito-header">
          <div className="carrito-header-left">
            <span className="carrito-emoji">🛒</span>
            <h2 className="carrito-titulo">Tu carrito</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {items.length > 0 && (
              <span className="carrito-count-badge">{items.length}</span>
            )}
            {/* Botón cerrar ✕ */}
            <button
              className="carrito-cerrar"
              onClick={() => setCarritoAbierto(false)}
            >✕</button>
          </div>
        </div>

        {/* Lista */}
        <div className="carrito-lista">
          {items.length === 0 ? (
            <div className="carrito-vacio">
              <span className="carrito-vacio-icon">🍞</span>
              <p className="carrito-vacio-texto">Tu carrito está vacío</p>
              <p className="carrito-vacio-sub">¡Agrega productos deliciosos!</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="carrito-item">
                <div className="item">
                  <img src={item.imagen} alt={item.nombre} className="carrito-item-img" />
                  <div className="item-name">
                    <p className="carrito-item-nombre">{item.nombre}</p>
                    <p className="carrito-item-volumen">{item.volumen}</p>
                  </div>
                </div>

                <div className="carrito-item-info">
                  <div className="carrito-item-controles">
                    <button className="carrito-ctrl-btn" onClick={() => restarUnidad(item.id)}>−</button>
                    <span className="carrito-ctrl-valor">{item.cantidad}</span>
                    <button className="carrito-ctrl-btn" onClick={() => sumarUnidad(item.id)}>+</button>
                  </div>
                </div>

                <div className="carrito-item-right">
                  <p className="carrito-item-precio">Valor:
                    ${(parseFloat(item.precio.replace("$", "")) * item.cantidad).toFixed(2)}
                  </p>
                  <button className="carrito-item-eliminar" onClick={() => eliminarItem(item.id)}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="carrito-footer">
            <div className="carrito-total-row">
              <span className="carrito-total-label">Total:</span>
              <span className="carrito-total-valor">${total}</span>
            </div>
            <button className="carrito-btn-pedir">Pedir Ahora 🚀</button>
          </div>
        )}

      </aside>
    </>
  );
};

export default Carrito;
