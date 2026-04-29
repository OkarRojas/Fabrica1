import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./login.css";

const Login = () => {
    const backend_url = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
    const navigate = useNavigate();
    const location = useLocation();
    const rutaOrigen = location.state?.from || "/";
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const respuesta = await fetch(`${backend_url}/crud/clientes/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (respuesta.ok) {
                const usuario = await respuesta.json();
                localStorage.setItem("usuario", JSON.stringify(usuario));
                alert("Sesion iniciada correctamente");
                navigate(rutaOrigen);
            } else {
                const data = await respuesta.json().catch(() => ({}));
                alert(data.detail || "No se pudo iniciar sesion");
            }
        } catch (error) {
            console.error("Error al iniciar sesion:", error);
            alert("Error de conexion");
        }
    };

    return (
        <div className="login">
            <h1>Login</h1>
            <p>Inicia sesion para acceder a tu cuenta y disfrutar de nuestros deliciosos panes frescos 🍞</p>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">Contrasena:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <button type="submit">Iniciar sesion</button>
            </form>
        </div>
    );
};

export default Login;