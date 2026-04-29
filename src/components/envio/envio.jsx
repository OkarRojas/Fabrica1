import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CarritoContext } from '../context/CarritoContext';
import "./envio.css";

const Envio = () => {
    const { items, total, limpiarCarrito } = useContext(CarritoContext);
    const navigate = useNavigate();
    const backend_url = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
    const [nombre, setNombre] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');

    const construirLinkMercadoPago = (rawLink) => {
        if (!rawLink) return '';

        try {
            const parsed = new URL(rawLink);
            const hostValido = parsed.hostname.includes('mercadopago.com');
            if (!hostValido) return '';

            const prefId = parsed.searchParams.get('pref_id') || parsed.searchParams.get('preference-id');
            if (!prefId) return parsed.toString();

            if (parsed.hostname.includes('sandbox.mercadopago.com.co')) {
                return `https://sandbox.mercadopago.com.co/checkout/v1/redirect?pref_id=${encodeURIComponent(prefId)}`;
            }

            return `https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=${encodeURIComponent(prefId)}`;
        } catch {
            return '';
        }
    };

    const obtenerUsuarioDesdeStorage = () => {
        const usuarioGuardado = localStorage.getItem('usuario');
        if (!usuarioGuardado) return null;

        try {
            const usuario = JSON.parse(usuarioGuardado);
            const candidatoId = usuario?.id ?? usuario?.usuario_id ?? usuario?.cliente_id ?? usuario?.userId;
            const idNumerico = Number(candidatoId);
            const idValido = Number.isInteger(idNumerico) && idNumerico > 0 ? idNumerico : null;

            return {
                id: idValido,
                nombre: usuario?.nombre ?? usuario?.name ?? '',
                telefono: usuario?.telefono ?? usuario?.phone ?? '',
                direccion: usuario?.direccion_entrega ?? usuario?.direccion ?? '',
            };
        } catch {
            return null;
        }
    };

    useEffect(() => {
        const usuarioSesion = obtenerUsuarioDesdeStorage();
        if (!usuarioSesion) return;

        setNombre((prev) => prev || usuarioSesion.nombre || '');
        setTelefono((prev) => prev || usuarioSesion.telefono || '');
        setDireccion((prev) => prev || usuarioSesion.direccion || '');
    }, []);

    const manejarEnvio = async (e) => {
        e.preventDefault();
        
        if (!items || items.length === 0) {
            return alert("No hay productos en tu pedido.");
        }

        const productosParaBackend = items
            .filter(item => item != null)
            .map(item => ({
            producto_id: item.id,
            cantidad: item.cantidad
        }));

        if (productosParaBackend.length === 0) {
            return alert("No se pudieron procesar productos validos del carrito.");
        }

        const usuarioSesion = obtenerUsuarioDesdeStorage();
        const usuario_id = usuarioSesion?.id ?? null;
        const nombreFinal = usuarioSesion?.nombre || nombre;
        const telefonoFinal = telefono || usuarioSesion?.telefono || '';
        const cliente_sombra = usuario_id ? null : nombreFinal;

        const datosPedido = {
            usuario_id,
            cliente_sombra,
            direccion_entrega: direccion,
            telefono: telefonoFinal,
            productos: productosParaBackend
        };

        try {
            const respuesta = await fetch(`${backend_url}/crud/pedidos/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosPedido)
            });

            if (respuesta.ok) {
                const resultado = await respuesta.json();
                alert(`¡Gracias ${nombreFinal || 'cliente'}! Pedido #${resultado.id} recibido. 🥖`);
                limpiarCarrito(); // Vacía el carrito

                if (resultado?.payment_link) {
                    const linkSeguro = construirLinkMercadoPago(resultado.payment_link);
                    if (!linkSeguro) {
                        alert('El pedido fue creado, pero el link de Mercado Pago no es valido.');
                        return;
                    }
                    window.location.assign(linkSeguro);
                } else {
                    alert("El pedido fue creado, pero no se recibio un link de pago valido.");
                }
            } else {
                const data = await respuesta.json().catch(() => ({}));
                alert(data.detail || "Error al procesar el pedido en el servidor.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("No se pudo conectar con el servidor. Verifica que el backend este encendido e intenta de nuevo.");
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