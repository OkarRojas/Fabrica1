import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importante para redirigir
import "./pedidos.css";

const Pedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [esAdmin, setEsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const usuarioString = localStorage.getItem("usuario");
        
        if (!usuarioString) {
            alert("Debes iniciar sesión para ver tus pedidos.");
            navigate("/login", { state: { from: "/pedidos" } });
            return;
        }

        let usuarioData = null;
        try {
            usuarioData = JSON.parse(usuarioString);
        } catch {
            navigate("/login", { state: { from: "/pedidos" } });
            return;
        }

        const idUsuario = usuarioData.id;
        const usuarioEsAdmin = Boolean(usuarioData.es_admin);
        setEsAdmin(usuarioEsAdmin);

        const urlPedidos = usuarioEsAdmin
            ? "http://localhost:8000/crud/pedidos/"
            : `http://localhost:8000/crud/pedidos/?usuario_id=${idUsuario}`;

        fetch(urlPedidos)
            .then(response => response.json())
            .then(data => {
                const pedidosFiltrados = usuarioEsAdmin
                    ? data
                    : data.filter(p => p.usuario_id === idUsuario);
                setPedidos(pedidosFiltrados);
            })
            .catch(error => console.error("Error al cargar pedidos:", error));
            
    }, [navigate]); // Agregamos navigate como dependencia

    return (
        <div className="pedidos">
            <h1>{esAdmin ? "Pedidos de Todos los Clientes" : "Mis Pedidos"}</h1>
            <p>{esAdmin ? "Revisa todos los pedidos registrados en el sistema" : "Revisa tus pedidos anteriores y su estado de entrega"}</p>

            <div className="lista-pedidos">
                {pedidos.length > 0 ? (
                    pedidos.map(p => (
                        <div key={p.id} className="pedido-card">
                            <h3>Pedido #{p.id}</h3>
                            <p>Cliente: <strong>{p.cliente_sombra || `Usuario #${p.usuario_id}`}</strong></p>
                            <p>Total: ${p.total}</p>
                            <p>Estado: <strong>{p.estado}</strong></p>
                            <p>Fecha: {new Date(p.fecha).toLocaleDateString()}</p>
                        </div>
                    ))
                ) : (
                    <p>Aún no tienes pedidos registrados.</p>
                )}
            </div>
        </div>
    );
}

export default Pedidos;