import React from "react";
import "./head.css";

const Head = () => {
  return (
    <header className="head">
        <div className="columnas">
        <h1 className="head-title">ROZVI</h1>

        <div className="rectangle">
            <a href="#" className="rectangle-link">Inicio</a>
            <a href="#" className="rectangle-link">Productos</a>
            <a href="#" className="rectangle-link">Contacto</a>
            <a href="#" className="rectangle-link">Puntos de Venta</a>
            
        </div>
        </div>
    </header>

    
  );

  
}

export default Head;