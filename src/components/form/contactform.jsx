import React, { useState } from 'react';
import './contactform.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    numero: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
    alert('¡Mensaje enviado!');
    setFormData({ name: '', email: '', numero: '', message: '' });
  };

  return (
    <section className="contact-section">
      <div className="contact-container">
        <div className="contact-left">
          <h2 className="contact-heading">Contactanos</h2>

          <div className="contact-info">
            <p className="contact-label">Nuestra dirección postal es:</p>
            <p className="contact-paragraph">Carrera 12#21-06</p>
            <p className="contact-paragraph">Villavicencio META</p>
            <p className="contact-phone">Teléfono: 705-742-3221</p>
          </div>

          <div className="contact-social">
            <a href="#" className="contact-social-link" aria-label="Facebook">
              <svg className="contact-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13.5 8.25h2.1V5.1h-2.47c-3.01 0-4.53 1.8-4.53 4.58v2.06H6v3.03h2.6V21h3.2v-6.23h2.7l.42-3.03h-3.12V9.9c0-1 .28-1.65 1.7-1.65Z" />
              </svg>
            </a>

            <a href="#" className="contact-social-link" aria-label="Twitter">
              <svg className="contact-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21.6 6.2c-.68.3-1.41.5-2.17.6a3.8 3.8 0 0 0 1.66-2.1 7.4 7.4 0 0 1-2.4.92 3.8 3.8 0 0 0-6.55 2.6c0 .3.04.6.1.88A10.8 10.8 0 0 1 4.6 5.2a3.8 3.8 0 0 0 1.17 5.08 3.7 3.7 0 0 1-1.72-.47v.05a3.8 3.8 0 0 0 3.05 3.72 3.8 3.8 0 0 1-1.71.07 3.8 3.8 0 0 0 3.55 2.64A7.6 7.6 0 0 1 4 17.93a10.8 10.8 0 0 0 5.83 1.7c7 0 10.84-5.8 10.84-10.84v-.5c.74-.53 1.38-1.2 1.9-2.08Z" />
              </svg>
            </a>

            <a href="#" className="contact-social-link" aria-label="Instagram">
              <svg className="contact-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm0 1.8A3.4 3.4 0 0 0 3.8 7.2v9.6a3.4 3.4 0 0 0 3.4 3.4h9.6a3.4 3.4 0 0 0 3.4-3.4V7.2a3.4 3.4 0 0 0-3.4-3.4H7.2Zm10.05 1.4a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z" />
              </svg>
            </a>

            <a href="#" className="contact-social-link contact-gplus" aria-label="Google Plus">
              G+
            </a>
          </div>
        </div>

        <div className="contact-right">
          <div className="contact-quote">
            <p className="contact-paragraph">La opinion y sactisfacion de nuestros clientes es importante.</p>
            <p className="contact-paragraph">¿que podemos hacer por ti?</p>
          </div>

          <form onSubmit={handleSubmit} className="contact-form">
            <input
              type="text"
              name="name"
              placeholder="ingresa tu nombre"
              value={formData.name}
              onChange={handleChange}
              className="contact-input"
              required
            />

            <input
              type="tel"
              name="numero"
              placeholder="ingresa tu numero de telefono"
              value={formData.numero}
              onChange={handleChange}
              className="contact-input"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="ingresa tu correo electronico"
              value={formData.email}
              onChange={handleChange}
              className="contact-input"
              required
            />

            <textarea
              name="message"
              rows="6"
              placeholder="ingresa tu mensaje"
              value={formData.message}
              onChange={handleChange}
              className="contact-textarea"
              required
            />

            <button type="submit" className="contact-button">
              enviar
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
