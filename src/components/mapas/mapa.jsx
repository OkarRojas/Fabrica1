import React from "react";
import "./mapa.css";

const Mapa = () => {
    return (
        <div className="mapa">
            <h2>Encuentra nuestros productos en los siguientes puntos de venta:</h2>
            <div className="columnas">
            <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5627.758397889848!2d-73.61512371282441!3d4.13627124664569!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3e2f63527e536d%3A0xb1ba03049f3adc18!2sPAN%20DE%20ARROZ%20ROZVI%20-Rozquetas%20Villavicencio!5e0!3m2!1ses-419!2sco!4v1772495762604!5m2!1ses-419!2sco" width="750" height="450" style={{border: 0}} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="rectangulo">
                <h3>Punto de venta Rozvi</h3>
                <p>Dirección: Calle 40 # 35-20, Villavicencio, Meta</p>
                <h3>Galeria del 7 De agosto</h3>
                <p>Dirección: Calle 40 # 35-20, Villavicencio, Meta</p>
            </div>
            </div>
        </div>
    );
}

export default Mapa;