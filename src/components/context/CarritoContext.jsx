import React, { createContext, useContext, useState } from "react";

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false); 

  const agregarItem = (producto, cantidad) => {
    setItems(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        return prev.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [...prev, { ...producto, cantidad }];

    });
    setCarritoAbierto(true); 
  };

  const eliminarItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // ← NUEVO: suma 1
  const sumarUnidad = (id) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
      )
    );
  };

  // ← NUEVO: resta 1, si llega a 0 elimina
  const restarUnidad = (id) => {
    setItems(prev =>
      prev
        .map(item =>
          item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
        )
        .filter(item => item.cantidad > 0)
    );
  };

  const total = items.reduce((acc, item) => {
    const precio = parseFloat(item.precio.replace("$", ""));
    return acc + precio * item.cantidad;
  }, 0).toFixed(2);

  return (
    <CarritoContext.Provider value={{ items, agregarItem, eliminarItem, sumarUnidad, restarUnidad, total, carritoAbierto, setCarritoAbierto }}>
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => useContext(CarritoContext);
