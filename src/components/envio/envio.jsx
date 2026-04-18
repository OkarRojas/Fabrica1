import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CarritoContext } from '../context/CarritoContext';
import "./envio.css";

const Envio = () => {
    const { items, total, limpiarCarrito } = useContext(CarritoContext);
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');

    const manejarEnvio = async (e) => {
        e.preventDefault();
        
        if (!items || items.length === 0) {
            return alert("No hay productos en tu pedido.");
        }

        const productosParaBackend = items.map(item => ({
            producto_id: item.id,
            cantidad: item.cantidad
        }));

        const datosPedido = {
            usuario_id: null, // Cuenta Sombra
            cliente_sombra: nombre,
            direccion_entrega: direccion,
            telefono: telefono,
            productos: productosParaBackend
        };

        try {
            const respuesta = await fetch('http://localhost:8000/crud/pedidos/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosPedido)
            });

            if (respuesta.ok) {
                const resultado = await respuesta.json();
                alert(`¡Gracias ${nombre}! Pedido #${resultado.id} recibido. 🥖`);
                limpiarCarrito(); // Vacía el carrito
                navigate("/");    // Vuelve al inicio
            } else {
                alert("Error al procesar el pedido en el servidor.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error de conexión.");
        }
    };

    return (
        <div className="envio-hero">
            <h1>Confirmación de Compra</h1>
            
            <div className="resumen-lista">
                {items && items.map((item) => (
                    <div key={item.id} className="item-resumen">
                        <p>{item.nombre} x {item.cantidad} - ${ (parseFloat(item.precio.replace("$","")) * item.cantidad).toFixed(2) }</p>
                    </div>
                ))}
                <h3>Total a pagar: ${total}</h3>
            </div>

            <form onSubmit={manejarEnvio} className="envio-form">
                <h2>Datos de Entrega</h2>
                <input type="text" placeholder="Nombre" value={nombre} onChange={(e)=>setNombre(e.target.value)} required />
                <input type="text" placeholder="Dirección" value={direccion} onChange={(e)=>setDireccion(e.target.value)} required />
                <input type="text" placeholder="Teléfono" value={telefono} onChange={(e)=>setTelefono(e.target.value)} required />
                <button type="submit" className="btn-finalizar">Finalizar Pedido 🍞</button>
            </form>
        </div>
    );
};

export default Envio;