import React from "react";
import { useNavigate } from "react-router-dom";
import "./registro.css";
import { useContext, useState } from "react";

const Registro = () => {

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        password: "",
        telefono: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const respuesta = await fetch('http://localhost:8000/crud/clientes/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (respuesta.ok) {
                alert("Registro exitoso. ¡Bienvenido a la familia Rozvi! 🥖");
                navigate("/login");
            } else {
                alert("Error al registrarse. Intenta nuevamente.");
            }
        } catch (error) {
            console.error("Error al enviar el formulario:", error);
            alert("Error al registrarse. Intenta nuevamente.");
        }
    };


    return (
        <div>
            <h1>Registro de Usuario</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="nombre">Nombre:</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                    />
                </div>
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
                    <label htmlFor="password">Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="telefono">Teléfono:</label>
                    <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="submit">Registrarse</button>
            </form>
        </div>
    );
}

export default Registro;