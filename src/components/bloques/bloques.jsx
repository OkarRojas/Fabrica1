import React from "react";
import "./bloques.css";
import pan1 from "../../assets/pan1.jpg";
import pan2 from "../../assets/pan2.jpg";

const Bloques = () => {
return (
    <div className="bloques">
        <div className="bloque1">
            <div className="contenido1">
                <h3>Quienes somos</h3>
                <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Culpa inventore aperiam ipsum! Voluptatum corporis repellat sunt, quaerat iusto non alias! Delectus neque consequuntur autem similique quae inventore voluptate sapiente adipisci.</p>
            </div>
            <img src={pan1} alt="pan1" />
        </div>
        <div className="bloque2">
            <img src={pan2} alt="pan2" />
            <div className="contenido2">
                <h3>Por que nosotros?</h3>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum. Quisquam, voluptatum.</p>
            </div>
        </div>
    </div>
);
}

export default Bloques;