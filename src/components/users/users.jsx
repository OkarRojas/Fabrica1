import React from "react";
import { useNavigate } from "react-router-dom";
import "./users.css";

const Users = () => {
    const navigate = useNavigate();

    return (
        <div className="users-hero">
            <h1>Nuestros Usuarios</h1>
            <p>Conoce a nuestra comunidad de amantes del pan 🍞</p>
            <button>iniciar sesion</button>
            <button>registrarse</button>
            <button onClick={() => navigate("/envio")}>continuar como invitado</button>
        </div>
    );
}

export default Users;