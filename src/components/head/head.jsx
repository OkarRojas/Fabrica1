import React from "react";
import "./head.css";
import { Link } from 'react-router-dom';

const Head = () => {
  return (
    <header className="head">
        <div className="columnas">
        <h1 className="head-title">ROZVI</h1>

        <div className="rectangle">
            <Link to="/" className="rectangle-link">Inicio</Link>
            <Link to="/productos" className="rectangle-link">Productos</Link>
            <Link to="/contacto" className="rectangle-link">Contacto</Link>
            <Link to="/puntos-de-venta" className="rectangle-link">Puntos de Venta</Link>
        </div>
        </div>
    </header>

    
  );

  
}

export default Head;