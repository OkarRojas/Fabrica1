import React, { useMemo, useState } from "react";
import { Wallet } from "@mercadopago/sdk-react";
import { useCarrito } from "../context/CarritoContext";
import "./checkout.css";

const Checkout = () => {
    const { items, total } = useCarrito();
    const [comprador, setComprador] = useState({ nombre: "", email: "", telefono: "" });
    const [loading, setLoading] = useState(false);
    const [preferenceId, setPreferenceId] = useState("");
    const [sandboxInitPoint, setSandboxInitPoint] = useState("");
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    const construirLinkMercadoPago = (rawLink, preferenceIdValue) => {
        const fallback = preferenceIdValue
            ? `https://sandbox.mercadopago.com.co/checkout/v1/redirect?pref_id=${encodeURIComponent(preferenceIdValue)}`
            : "";

        if (!rawLink) return fallback;

        try {
            const parsed = new URL(rawLink);
            const hostValido = parsed.hostname.includes("mercadopago.com");
            if (!hostValido) return fallback;

            const prefId = parsed.searchParams.get("pref_id") || parsed.searchParams.get("preference-id") || preferenceIdValue;
            if (!prefId) return parsed.toString();

            if (parsed.hostname.includes("sandbox.mercadopago.com.co")) {
                return `https://sandbox.mercadopago.com.co/checkout/v1/redirect?pref_id=${encodeURIComponent(prefId)}`;
            }

            return `https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=${encodeURIComponent(prefId)}`;
        } catch {
            return fallback;
        }
    };

    const normalizarPrecio = (precio) => {
        if (typeof precio === "number") return precio;
        if (typeof precio !== "string") return 0;
        const limpio = precio.replace(/[^\d,.-]/g, "").replace(",", ".");
        const numero = Number.parseFloat(limpio);
        return Number.isNaN(numero) ? 0 : numero;
    };

    const itemsNormalizados = useMemo(() => {
        return items.map((item) => ({
            id: String(item.id),
            title: item.nombre,
            quantity: Number(item.cantidad) || 1,
            unit_price: normalizarPrecio(item.precio),
        }));
    }, [items]);

    const totalCalculado = useMemo(() => {
        return itemsNormalizados
            .reduce((acc, item) => acc + item.unit_price * item.quantity, 0)
            .toFixed(2);
    }, [itemsNormalizados]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setComprador((prev) => ({ ...prev, [name]: value }));
    };

    const generarPreferencia = async (event) => {
        event.preventDefault();
        setError("");
        setMensaje("");
        setPreferenceId("");
        setSandboxInitPoint("");

        if (!itemsNormalizados.length) {
            setError("Tu carrito esta vacio. Agrega productos antes de pagar.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${apiBaseUrl}/pagos/crear-preferencia`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    items: itemsNormalizados,
                    comprador,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const detail = data?.detail || "No fue posible iniciar el pago.";
                throw new Error(detail);
            }

            if (!data.preference_id) {
                throw new Error("No recibimos el identificador de preferencia de pago.");
            }

            setPreferenceId(data.preference_id);
            setSandboxInitPoint(data.sandbox_init_point || "");
            setMensaje("Abriendo Mercado Pago en una nueva pestaña...");

            const destino = construirLinkMercadoPago(
                data.sandbox_init_point || data.init_point || "",
                data.preference_id,
            );
            if (destino) {
                window.location.assign(destino);
            } else {
                setMensaje("Preferencia creada, pero no recibimos un enlace de pago.");
            }
        } catch (apiError) {
            setError(apiError.message || "Ocurrio un error al conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="checkout-page">
            <div className="checkout-container">
                <h1 className="checkout-title">Finaliza tu compra</h1>

                <div className="checkout-grid">
                    <article className="checkout-summary">
                        <h2>Resumen del pedido</h2>
                        {itemsNormalizados.length === 0 ? (
                            <p className="checkout-empty">No hay productos en tu carrito.</p>
                        ) : (
                            <ul className="checkout-items">
                                {itemsNormalizados.map((item) => (
                                    <li key={item.id} className="checkout-item-row">
                                        <span>{item.title} x {item.quantity}</span>
                                        <strong>${(item.unit_price * item.quantity).toFixed(2)}</strong>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="checkout-total-row">
                            <span>Total</span>
                            <strong>${total || totalCalculado}</strong>
                        </div>
                    </article>

                    <article className="checkout-form-card">
                        <h2>Datos del comprador</h2>
                        <form className="checkout-form" onSubmit={generarPreferencia}>
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                value={comprador.nombre}
                                onChange={handleChange}
                                required
                            />

                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={comprador.email}
                                onChange={handleChange}
                                required
                            />

                            <label htmlFor="telefono">Telefono</label>
                            <input
                                id="telefono"
                                name="telefono"
                                type="tel"
                                value={comprador.telefono}
                                onChange={handleChange}
                                required
                            />

                            <button type="submit" className="checkout-btn" disabled={loading}>
                                {loading ? "Generando preferencia..." : "Continuar con Mercado Pago"}
                            </button>
                        </form>

                        {error && <p className="checkout-error">{error}</p>}

                        <div className="checkout-wallet-block">
                            <h3>Pago seguro</h3>
                            {preferenceId ? (
                                <>
                                    <Wallet initialization={{ preferenceId }} />
                                    {sandboxInitPoint && (
                                        <a
                                            className="checkout-fallback-link"
                                            href={sandboxInitPoint}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Abrir checkout sandbox manualmente
                                        </a>
                                    )}
                                </>
                            ) : (
                                <p className="checkout-wallet-help">Completa tus datos para habilitar el boton oficial de pago.</p>
                            )}
                        </div>

                        {mensaje && <p className="checkout-success-note">{mensaje}</p>}
                    </article>
                </div>
            </div>
        </section>
    );
}

export default Checkout;