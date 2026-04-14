import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./envio.css";

const Envio = () => {
    const [productos, setProductos] = useState([]);
    const [total, setTotal] = useState("0.00");
    const navigate = useNavigate();

    useEffect(() => {
        // Recuperamos los datos del almacenamiento local
        const datosGuardados = localStorage.getItem('carrito_rozvi');
        
        if (datosGuardados) {
            const carritoRecuperado = JSON.parse(datosGuardados);
            setProductos(carritoRecuperado);

            // Calculamos el total recorriendo el arreglo recuperado
            // Usamos la misma lógica de tu CarritoContext para limpiar el precio
            const sumaTotal = carritoRecuperado.reduce((acc, item) => {
                const precio = parseFloat(item.precio.replace("$", ""));
                return acc + precio * item.cantidad;
            }, 0);

            setTotal(sumaTotal.toFixed(2));
        }
    }, []);

    const handleConfirmarPedido = (event) => {
        event.preventDefault();
        navigate("/checkout");
    };

    return (
        <div className="envio-hero">
            <h1>Resumen de tu Pedido</h1>
            
            <div className="lista-confirmacion">
                {productos.length > 0 ? (
                    productos.map((item) => (
                        <div key={item.id} className="item-confirmacion">
                            <p>
                                <strong>{item.nombre}</strong> x {item.cantidad} 
                                <span> - ${(parseFloat(item.precio.replace("$", "")) * item.cantidad).toFixed(2)}</span>
                            </p>
                        </div>
                    ))
                ) : (
                    <p>No hay productos para confirmar.</p>
                )}
            </div>

            <div className="total-confirmacion">
                <h3>Total a pagar: ${total}</h3>
            </div>

            <p>Entregamos tu pan fresco directamente a tu domicilio 🍞</p>

            <div className="datosdeenvio">
                <h2>Datos de Envío</h2>
                <form onSubmit={handleConfirmarPedido}>
                    <input type="text" placeholder="Nombre Completo" required />
                    <input type="text" placeholder="Dirección de Envío" required />
                    <input type="text" placeholder="Número de Teléfono" required />
                    <button type="submit">Confirmar Pedido</button>
                </form>
            </div>
        </div>
    );
}

export default Envio;