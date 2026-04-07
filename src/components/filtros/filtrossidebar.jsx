import React from 'react';
import './filtros.css';

const FiltrosSidebar = ({
  busqueda, setBusqueda,
  categorias, setCategorias,
  precioMax, setPrecioMax,
  todasCategorias
}) => {

  const toggleCategoria = (cat) => {
    setCategorias(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setCategorias([]);
    setPrecioMax(100000);
  };

  return (
    <aside className="filtros-sidebar">

      <div className="filtros-header">
        <h3>🔍 Filtros</h3>
        <button className="filtros-limpiar" onClick={limpiarFiltros}>
          Limpiar
        </button>
      </div>

      {/* Búsqueda */}
      <div className="filtros-seccion">
        <label className="filtros-label">Buscar</label>
        <input
          type="text"
          className="filtros-input"
          placeholder="Ej: Pan de arroz..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Categorías */}
      <div className="filtros-seccion">
        <label className="filtros-label">Categoría</label>
        {todasCategorias.map(cat => (
          <label key={cat} className="filtros-checkbox-label">
            <input
              type="checkbox"
              checked={categorias.includes(cat)}
              onChange={() => toggleCategoria(cat)}
              className="filtros-checkbox"
            />
            {cat}
          </label>
        ))}
      </div>

      {/* Precio máximo */}
      <div className="filtros-seccion">
        <label className="filtros-label">
          Precio máximo: <strong>${precioMax}</strong>
        </label>
        <input
          type="range"
          min="1"
          max="100000"
          step="0.5"
          value={precioMax}
          onChange={e => setPrecioMax(parseFloat(e.target.value))}
          className="filtros-slider"
        />
        <div className="filtros-slider-labels">
          <span>$1</span>
          <span>$100000</span>
        </div>
      </div>

    </aside>
  );
};

export default FiltrosSidebar;
