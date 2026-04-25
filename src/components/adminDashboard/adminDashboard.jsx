import React, { useCallback, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, ShoppingBag, AlertTriangle } from 'lucide-react';
import './adminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        ingresos_totales: 0,
        total_pedidos: 0,
        total_clientes: 0,
        total_productos: 0,
        productos_top: [],
        alertas_stock: [],
    });
    const [productos, setProductos] = useState([]);
    const [stockInputs, setStockInputs] = useState({});
    const [stockSavingId, setStockSavingId] = useState(null);
    const [stockMessage, setStockMessage] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [lastSyncAt, setLastSyncAt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const buildAdminHeaders = (withJson = false) => {
        const adminSecret = import.meta.env.VITE_ADMIN_SECRET_KEY;
        const headers = adminSecret ? { auto: `Bearer ${adminSecret}` } : {};
        if (withJson) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    };

    const cargarStats = async () => {
        const res = await fetch(`${apiBaseUrl}/crud/admin/stats/`, { headers: buildAdminHeaders() });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const detail = typeof data?.detail === 'string' ? data.detail : 'No se pudieron cargar las metricas.';
            throw new Error(detail);
        }
        if (data?.detail) {
            throw new Error(typeof data.detail === 'string' ? data.detail : 'No se pudieron cargar las metricas.');
        }
        setStats(prev => ({ ...prev, ...data }));
    };

    const cargarProductos = async () => {
        const res = await fetch(`${apiBaseUrl}/crud/productos/`);
        const data = await res.json().catch(() => []);
        if (!res.ok || !Array.isArray(data)) {
            throw new Error('No se pudieron cargar los productos.');
        }

        setProductos((prevProductos) => {
            const previousStockById = prevProductos.reduce((acc, producto) => {
                acc[producto.id] = String(producto.stock ?? 0);
                return acc;
            }, {});

            setStockInputs((prevInputs) => {
                const nextInputs = {};
                data.forEach((producto) => {
                    const latestStock = String(producto.stock ?? 0);
                    const previousStock = previousStockById[producto.id];
                    const previousInput = prevInputs[producto.id];
                    const hasUnsavedValue = previousInput != null && previousStock != null && previousInput !== previousStock;
                    nextInputs[producto.id] = hasUnsavedValue ? previousInput : latestStock;
                });
                return nextInputs;
            });

            return data;
        });
    };

    const sincronizarDatos = useCallback(async (silent = false) => {
        if (!silent) {
            setRefreshing(true);
            setError('');
        }

        try {
            await Promise.all([cargarStats(), cargarProductos()]);
            setLastSyncAt(new Date());
        } catch (err) {
            if (!silent) {
                setError(err.message || 'No fue posible cargar datos del panel.');
            }
        } finally {
            if (!silent) {
                setRefreshing(false);
            }
        }
    }, [apiBaseUrl]);

    useEffect(() => {
        setLoading(true);
        sincronizarDatos()
            .finally(() => setLoading(false));
    }, [sincronizarDatos]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            sincronizarDatos(true);
        }, 15000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                sincronizarDatos(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [sincronizarDatos]);

    const handleStockInputChange = (productoId, value) => {
        if (/^\d*$/.test(value)) {
            setStockInputs(prev => ({ ...prev, [productoId]: value }));
        }
    };

    const actualizarStock = async (productoId) => {
        setStockMessage('');

        const nuevoStock = Number(stockInputs[productoId]);
        if (!Number.isInteger(nuevoStock) || nuevoStock < 0) {
            setStockMessage('Ingresa un stock valido (numero entero mayor o igual a 0).');
            return;
        }

        try {
            setStockSavingId(productoId);
            const res = await fetch(`${apiBaseUrl}/crud/productos/${productoId}`, {
                method: 'PATCH',
                headers: buildAdminHeaders(true),
                body: JSON.stringify({ stock: nuevoStock }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const detail = typeof data?.detail === 'string'
                    ? data.detail
                    : 'No se pudo actualizar el stock.';
                throw new Error(detail);
            }

            setProductos(prev => prev.map(item => (
                item.id === productoId ? { ...item, stock: data.stock } : item
            )));

            setStats(prev => ({
                ...prev,
                alertas_stock: (prev.alertas_stock || [])
                    .map(alerta => (alerta.id === productoId ? { ...alerta, stock: data.stock } : alerta))
                    .filter(alerta => alerta.stock < 10),
            }));

            setStockInputs(prev => ({ ...prev, [productoId]: String(data.stock) }));
            setStockMessage('Stock actualizado correctamente.');
            sincronizarDatos(true);
        } catch (err) {
            setStockMessage(err.message || 'No se pudo actualizar el stock.');
        } finally {
            setStockSavingId(null);
        }
    };

    if (loading) return <div className="loading">Cargando métricas de ROZVI...</div>;

    return (
        <div className="dashboard-container">
            <h1>Panel de Control - ROZVI 📊</h1>
            {error && <div className="dashboard-error">{error}</div>}

            <div className="dashboard-toolbar">
                <button
                    type="button"
                    className="stock-btn"
                    onClick={() => sincronizarDatos()}
                    disabled={refreshing || loading}
                >
                    {refreshing ? 'Actualizando...' : 'Recargar datos'}
                </button>
                <span className="sync-label">
                    Ultima sincronizacion: {lastSyncAt ? lastSyncAt.toLocaleTimeString() : 'sin datos'}
                </span>
            </div>
            
            {/* Tarjetas de Resumen */}
            <div className="stats-grid">
                <div className="stat-card">
                    <DollarSign size={30} color="#27ae60" />
                    <div>
                        <p>Ingresos Totales</p>
                        <h3>${Number(stats.ingresos_totales || 0).toLocaleString()}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <ShoppingBag size={30} color="#e67e22" />
                    <div>
                        <p>Total Pedidos</p>
                        <h3>{stats.total_pedidos}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <AlertTriangle size={30} color="#e74c3c" />
                    <div>
                        <p>Alertas de Stock</p>
                        <h3>{stats.alertas_stock?.length || 0}</h3>
                    </div>
                </div>
            </div>

            <div className="charts-section">
                {/* Gráfica de Productos Más Vendidos */}
                <div className="chart-container">
                    <h3>Top 5 Productos Vendidos</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.productos_top || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total_vendido" fill="#d35400">
                                {(stats.productos_top || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#e67e22' : '#d35400'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Lista de Alertas */}
                <div className="alerts-list">
                    <h3>⚠️ Reposición Urgente</h3>
                    <ul>
                        {(stats.alertas_stock || []).map(prod => (
                            <li key={prod.id}>
                                <span>{prod.nombre}</span>
                                <span className="stock-badge">Quedan: {prod.stock}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="stock-admin-section">
                <h3>Gestion de Stock</h3>
                {stockMessage && <p className="stock-message">{stockMessage}</p>}
                <div className="stock-table-wrap">
                    <table className="stock-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Stock Actual</th>
                                <th>Nuevo Stock</th>
                                <th>Accion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productos.map((prod) => (
                                <tr key={prod.id}>
                                    <td>{prod.nombre}</td>
                                    <td>{prod.stock}</td>
                                    <td>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={stockInputs[prod.id] ?? ''}
                                            onChange={(e) => handleStockInputChange(prod.id, e.target.value)}
                                            className="stock-input"
                                        />
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="stock-btn"
                                            onClick={() => actualizarStock(prod.id)}
                                            disabled={stockSavingId === prod.id}
                                        >
                                            {stockSavingId === prod.id ? 'Guardando...' : 'Actualizar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;