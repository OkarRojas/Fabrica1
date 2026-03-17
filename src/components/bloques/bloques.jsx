import React from "react";
import "./bloques.css";
import pan1 from "../../assets/pam.jpg";

const Bloques = () => {
return (
    <div>
        <section className="bloques-section">
  <div className="bloques-grid">
    <div className="bloques-left-col">
      <h2 className="bloques-titulo">
        ROZVI
      </h2>
      <p className="bloques-subtitulo">
        Panadería familiar que amasa con amor desde 1990. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Amet beatae consequuntur laboriosam? Placeat doloremque fuga illo animi quisquam quo odio
      </p>
      <a href="#" className="bloques-cta">
        Conócenos
      </a>
    </div>
    
    <div className="bloques-img-col">
      <img src={pan1}
           className="bloques-img"
           alt="Pan ROZVI" />
    </div>
    
    <div className="bloques-right-col">
      <h3 className="bloques-features-title">¿Por qué ROZVI?</h3>
      <div className="bloques-features-list">
        <div className="bloques-feature-item">
          <div className="bloques-feature-icon">✓</div>
          <div>Ingredientes 100% naturales</div>
        </div>
        <div className="bloques-feature-item">
          <div className="bloques-feature-icon">✓</div>
          <div>Horneado fresco diario</div>
        </div>
        <div className="bloques-feature-item">
          <div className="bloques-feature-icon">✓</div>
          <div>Entrega en 2 horas</div>
        </div>
      </div>
    </div>
  </div>
</section>

    </div>
);
}

export default Bloques;