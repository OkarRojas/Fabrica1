import React from "react";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer">
    <div className="footer-content">
      <div className="footer-section">
        <h4>¿Qué podemos hacer por ti?</h4>
        <ul>
          <li>Ventas al por mayor</li>
          <li>Cotizaciones</li>
          <li>Domilicilios</li>
          <li>Venta a tiendas</li>
        </ul>
      </div>
      
      <div className="footer-section">
        <h4>Rozquetas Villavicencio</h4>
        <ul>
          <li>Correo</li>
          <li>nosecual@email.com</li>
        </ul>
      </div>
      
      <div className="footer-section">
        <h4>Redes sociales</h4>
        <ul>
          <li>insta</li>
          <li>Facebook</li>
          <li>whatsapp</li>
        </ul>
      </div>
    </div>
    
    <div className="footer-bottom">
      <p>&copy; 2026 Rozquetas Villavicencio sas. Todos los derechos reservados.</p>
    </div>
  </footer>
  );
}

export default Footer;