import React from "react";
import "./checkout.css";
import qrCode from "../../../assets/Commons_QR_Code.png";

const Checkout = () => {
    return (
        <div className="checkout-hero">
            <h1>Checkout</h1>
            <p>Completa tu compra con los siguientes datos
                1. Revisa tu pedido
                2. Ingresa tus datos de envío
                3. Confirma tu compra 
                4. escanea el código QR
                5. paga la cantidad total
                6. presiona el boton de confirmar pedido
                7. nos comunicaremos contigoi para coordinar la entrega de tu pan fresco 🍞
            </p>

            <img src={qrCode} alt="QR Code" className="qr-code" />

            <button>Confirmar Pedido</button>
        </div>
    );
}

export default Checkout;