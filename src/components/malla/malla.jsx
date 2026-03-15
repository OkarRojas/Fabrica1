import React from 'react';
import ProductCard from '../card/card.jsx';
import "./malla.css"

const productos = [
  { id: 1, nombre: 'Jugo de Piña', precio: '$4.99', volumen: '1 L', imagen: '/piña.jpg' },
  { id: 2, nombre: 'Jugo de Naranja', precio: '$4.99', volumen: '1 L', imagen: '/naranja.jpg' },
  { id: 3, nombre: 'Jugo Multifruta', precio: '$4.99', volumen: '1 L', imagen: '/multifruta.jpg' },
  { id: 4, nombre: 'Jugo de Piña', precio: '$4.99', volumen: '1 L', imagen: '/piña.jpg' },
  { id: 5, nombre: 'Jugo de Naranja', precio: '$4.99', volumen: '1 L', imagen: '/naranja.jpg' },
  { id: 6, nombre: 'Jugo Multifruta', precio: '$4.99', volumen: '1 L', imagen: '/multifruta.jpg' },
  { id: 7, nombre: 'Jugo de Piña', precio: '$4.99', volumen: '1 L', imagen: '/piña.jpg' },
  { id: 8, nombre: 'Jugo de Naranja', precio: '$4.99', volumen: '1 L', imagen: '/naranja.jpg' },
  { id: 9, nombre: 'Jugo Multifruta', precio: '$4.99', volumen: '1 L', imagen: '/multifruta.jpg' },
  { id: 10, nombre: 'Jugo de Piña', precio: '$4.99', volumen: '1 L', imagen: '/piña.jpg' },
  { id: 11, nombre: 'Jugo de Naranja', precio: '$4.99', volumen: '1 L', imagen: '/naranja.jpg' },
  { id: 12, nombre: 'Jugo Multifruta', precio: '$4.99', volumen: '1 L', imagen: '/multifruta.jpg' },
  { id: 13, nombre: 'Jugo de Piña', precio: '$4.99', volumen: '1 L', imagen: '/piña.jpg' },
  { id: 14, nombre: 'Jugo de Naranja', precio: '$4.99', volumen: '1 L', imagen: '/naranja.jpg' },
  { id: 15, nombre: 'Jugo Multifruta', precio: '$4.99', volumen: '1 L', imagen: '/multifruta.jpg' },
  { id: 16, nombre: 'Jugo de Piña', precio: '$4.99', volumen: '1 L', imagen: '/piña.jpg' },
  { id: 17, nombre: 'Jugo de Naranja', precio: '$4.99', volumen: '1 L', imagen: '/naranja.jpg' },
  { id: 18, nombre: 'Jugo Multifruta', precio: '$4.99', volumen: '1 L', imagen: '/multifruta.jpg' },

  // Agrega más para probar scroll
];

const malla = () => {
  return (
   <div className="h-[70vh] overflow-y-auto bg-gray-50 p-4 rounded-xl">
  <div className="product-grid-container">
    {productos.map(producto => <ProductCard key={producto.id} producto={producto} />)}
  </div>
</div>

  );
};

export default malla;
