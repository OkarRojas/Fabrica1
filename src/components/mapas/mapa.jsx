import React from "react";
import "./mapa.css";
import pan1 from "../../assets/pam.jpg";
import pan2 from "../../assets/pan2.jpg";

const Mapa = () => {
  return (
    <div>
      <section className="puntos-section">
        <div className="puntos-container">
          {/* Título */}
          <div className="puntos-header">
            <h2 className="puntos-titulo">Encuentra ROZVI</h2>
            <p className="puntos-subtitulo">
              Nuestros productos en los siguientes puntos de venta de la ciudad
            </p>
          </div>

          {/* Grid principal */}
          <div className="puntos-grid">
            
            {/* Mapa */}
            <div className="puntos-mapa-col">
              <iframe 
                src="https://www.google.com/maps/embed?pb=TU_MAPA_AQUI" 
                className="puntos-mapa"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
             
            </div>

            {/* Productos + Dirección */}
            <div className="puntos-derecha-col">
              
              {/* Preview productos */}
              <div className="puntos-productos-grid">
                <img src={pan1} className="puntos-producto" alt="Pan 1" />
                <img src={pan2} className="puntos-producto" alt="Pan 2" />
              </div>

              {/* Tarjeta dirección */}
              <div className="puntos-direccion-card">
                <h3 className="puntos-direccion-titulo">Nuestro Local</h3>
                <p className="puntos-direccion-texto">Centro Comercial Arboletes</p>
                <p className="puntos-direccion-detalle">Carrera 12#21-06, Villavicencio</p>
              </div>
              
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Mapa;
