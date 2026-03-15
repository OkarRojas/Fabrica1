import React from "react";

const ProductCard = ({ producto }) => (
  <div className="product-card">
    <img src={producto.imagen || 'https://via.placeholder.com/300x220/ffeb3b/333?text=Piña'} alt={producto.nombre} />
    <div className="product-card-content">
      <h3>{producto.nombre}</h3>
      <p className="volumen">{producto.volumen}</p>
      <p className="precio">{producto.precio}</p>
      <button className="add-button">+ Agregar</button>
    </div>
  </div>
);


export default ProductCard;