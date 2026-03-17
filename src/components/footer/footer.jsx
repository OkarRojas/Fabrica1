import React from "react";
import "./footer.css";
import logo from "../../assets/logo.png";

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container max-w-7xl mx-auto">
        
        {/* Columna Logo */}
        <div className="footer-col footer-col-logo">
          <img src={logo} alt="ROZVI" className="footer-logo" />
          <p className="footer-desc">
            Panadería artesanal que amasa con amor. 
            Frescura garantizada desde 1990.
          </p>
          
        </div>

        {/* Columna Navegación */}
        <div className="footer-col">
          <h4 className="footer-col-title">Navegación</h4>
          <ul className="footer-nav-list">
            <li><a href="/" className="footer-link">Inicio</a></li>
            <li><a href="/productos" className="footer-link">Productos</a></li>
            <li><a href="/puntos-venta" className="footer-link">Puntos de Venta</a></li>
            <li><a href="/nosotros" className="footer-link">Nosotros</a></li>
          </ul>
        </div>

        

        {/* Columna Horarios */}
        <div className="footer-col">
          <h4 className="footer-col-title">Horarios</h4>
          <ul className="footer-nav-list">
            <li>Lunes - Viernes: 6AM - 10PM</li>
            <li>Sábados: 6AM - 12AM</li>
            <li>Domingos: 7AM - 9PM</li>
          </ul>
        </div>
      </div>

      {/* Línea separadora */}
      <div className="footer-divider"></div>

      {/* Copyright */}
      <div className="footer-copyright">
        <p>&copy; 2026 ROZVI Panadería. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
