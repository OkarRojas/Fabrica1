import React from "react";
import "./head.css";
import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo.png';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/productos', label: 'Productos' },
  { to: '/contacto', label: 'Contacto' },
];

const Head = () => {
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
        </div>
    </header>
  );
}

export default Head;