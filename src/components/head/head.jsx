import React, { useState } from "react";
import "./head.css";
import { NavLink } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import logo from '../../assets/logo.png';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/productos', label: 'Productos' },
  { to: '/contacto', label: 'Contacto' },
];

const Head = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const usuarioSesionRaw = localStorage.getItem("usuario");
  let usuarioSesion = null;

  if (usuarioSesionRaw) {
    try {
      usuarioSesion = JSON.parse(usuarioSesionRaw);
    } catch {
      usuarioSesion = null;
    }
  }

  const handleCerrarSesion = () => {
    localStorage.removeItem("usuario");
    setMenuOpen(false);
    navigate("/users");
  };

  const handleIrA = (ruta) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  return (
    <header className="head-nav">
      <div className="head-shell">
        <div className="brand-group">
          <img src={logo} alt="Logo ROZVI" className="brand-logo" />
          <h1 className="brand-title">ROZVI</h1>
        </div>

        <nav className="menu-shell">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `menu-link ${isActive ? 'is-active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hamburger-menu">
          <button
            type="button"
            className="hamburger-trigger"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Abrir menu de usuario"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>

          {menuOpen && (
            <div className="hamburger-dropdown">
              <button type="button" className="dropdown-item" onClick={() => handleIrA("/login")}>
                Login
              </button>
              {usuarioSesion?.es_admin && (
                <button type="button" className="dropdown-item" onClick={() => handleIrA("/pedidos")}>
                  Pedidos globales
                </button>
              )}
              <button type="button" className="dropdown-item" onClick={() => handleIrA("/pedidos")}>
                Mis pedidos
              </button>
              <button type="button" className="dropdown-item logout" onClick={handleCerrarSesion}>
                Cerrar sesion
              </button>
            </div>
          )}
        </div>
        </div>
    </header>
  );
}

export default Head;