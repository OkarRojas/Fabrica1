import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
    alert('¡Mensaje enviado!');
    setFormData({ name: '', email: '', message: '' });
  };

  const styles = {
    section: {
      backgroundColor: '#e9e9e9',
      padding: '70px 30px'
    },
    container: {
      maxWidth: '1120px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1fr 1.05fr',
      columnGap: '80px',
      rowGap: '48px',
      alignItems: 'start'
    },
    leftCol: {
      paddingTop: '6px'
    },
    heading: {
      margin: 0,
      marginBottom: '24px',
      fontSize: '52px',
      lineHeight: 1.05,
      fontWeight: 700,
      color: '#070707',
      letterSpacing: '0.2px'
    },
    textBlock: {
      fontSize: '34px',
      lineHeight: 1.45,
      color: '#111111'
    },
    label: {
      margin: '0 0 2px 0'
    },
    paragraph: {
      margin: 0
    },
    phone: {
      marginTop: '4px'
    },
    socialList: {
      marginTop: '26px',
      display: 'flex',
      alignItems: 'center',
      gap: '18px'
    },
    socialLink: {
      color: '#111111',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      textDecoration: 'none'
    },
    rightText: {
      margin: '0 0 28px 0',
      fontSize: '34px',
      lineHeight: 1.45,
      color: '#101010'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    input: {
      width: '100%',
      height: '48px',
      border: '1px solid #b4b4b4',
      backgroundColor: '#f4f4f4',
      fontSize: '31px',
      color: '#2a2a2a',
      padding: '0 18px',
      boxSizing: 'border-box',
      outline: 'none',
      borderRadius: 0
    },
    textarea: {
      width: '100%',
      minHeight: '156px',
      border: '1px solid #b4b4b4',
      backgroundColor: '#f4f4f4',
      fontSize: '31px',
      color: '#2a2a2a',
      padding: '14px 18px',
      boxSizing: 'border-box',
      outline: 'none',
      borderRadius: 0,
      resize: 'none',
      fontFamily: 'inherit'
    },
    button: {
      marginTop: '2px',
      width: '112px',
      height: '42px',
      backgroundColor: '#d8c297',
      border: 'none',
      color: '#111111',
      fontSize: '27px',
      letterSpacing: '3px',
      textTransform: 'lowercase',
      cursor: 'pointer'
    }
  };

  const iconStyle = { width: 33, height: 33, display: 'block' };

  return (
    <section className="contact-section" style={styles.section}>
      <div className="contact-container" style={styles.container}>
        <div className="contact-left" style={styles.leftCol}>
          <h2 className="contact-heading" style={styles.heading}>Contáctenos</h2>

          <div className="contact-info" style={styles.textBlock}>
            <p style={styles.label}>Nuestra dirección postal es:</p>
            <p style={styles.paragraph}>152A Charlotte Street,</p>
            <p style={styles.paragraph}>Peterborough ON</p>
            <p style={{ ...styles.paragraph, ...styles.phone }}>Teléfono: 705-742-3221</p>
          </div>

          <div className="contact-social" style={styles.socialList}>
            <a href="#" style={styles.socialLink} aria-label="Facebook">
              <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13.5 8.25h2.1V5.1h-2.47c-3.01 0-4.53 1.8-4.53 4.58v2.06H6v3.03h2.6V21h3.2v-6.23h2.7l.42-3.03h-3.12V9.9c0-1 .28-1.65 1.7-1.65Z" />
              </svg>
            </a>

            <a href="#" style={styles.socialLink} aria-label="Twitter">
              <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21.6 6.2c-.68.3-1.41.5-2.17.6a3.8 3.8 0 0 0 1.66-2.1 7.4 7.4 0 0 1-2.4.92 3.8 3.8 0 0 0-6.55 2.6c0 .3.04.6.1.88A10.8 10.8 0 0 1 4.6 5.2a3.8 3.8 0 0 0 1.17 5.08 3.7 3.7 0 0 1-1.72-.47v.05a3.8 3.8 0 0 0 3.05 3.72 3.8 3.8 0 0 1-1.71.07 3.8 3.8 0 0 0 3.55 2.64A7.6 7.6 0 0 1 4 17.93a10.8 10.8 0 0 0 5.83 1.7c7 0 10.84-5.8 10.84-10.84v-.5c.74-.53 1.38-1.2 1.9-2.08Z" />
              </svg>
            </a>

            <a href="#" style={styles.socialLink} aria-label="Instagram">
              <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm0 1.8A3.4 3.4 0 0 0 3.8 7.2v9.6a3.4 3.4 0 0 0 3.4 3.4h9.6a3.4 3.4 0 0 0 3.4-3.4V7.2a3.4 3.4 0 0 0-3.4-3.4H7.2Zm10.05 1.4a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z" />
              </svg>
            </a>

            <a
              href="#"
                className="contact-gplus"
                style={{ ...styles.socialLink, fontSize: 39, fontWeight: 700, lineHeight: 1 }}
              aria-label="Google Plus"
            >
              G+
            </a>
          </div>
        </div>

        <div className="contact-right">
          <div className="contact-quote" style={styles.rightText}>
            <p style={styles.paragraph}>Una gran visión sin grandes personas es irrelevante.</p>
            <p style={styles.paragraph}>Trabajemos juntos.</p>
          </div>

          <form onSubmit={handleSubmit} className="contact-form" style={styles.form}>
            <input
              type="text"
              name="name"
              placeholder="Enter your Name"
              value={formData.name}
              onChange={handleChange}
              className="contact-input"
              style={styles.input}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Enter a valid email address"
              value={formData.email}
              onChange={handleChange}
              className="contact-input"
              style={styles.input}
              required
            />

            <textarea
              name="message"
              rows="6"
              placeholder="Enter your message"
              value={formData.message}
              onChange={handleChange}
              className="contact-textarea"
              style={styles.textarea}
              required
            />

            <button type="submit" className="contact-button" style={styles.button}>
              enviar
            </button>
          </form>
        </div>
      </div>

      <style>
        {`
          @media (max-width: 980px) {
            .contact-container {
              grid-template-columns: 1fr;
              row-gap: 34px;
            }

            .contact-heading {
              font-size: 42px !important;
            }

            .contact-info,
            .contact-quote,
            .contact-input,
            .contact-textarea,
            .contact-button {
              font-size: 22px !important;
            }

            .contact-textarea {
              min-height: 132px !important;
            }
          }

          @media (max-width: 600px) {
            .contact-section {
              padding: 42px 18px !important;
            }

            .contact-heading {
              font-size: 36px !important;
            }

            .contact-social {
              gap: 14px !important;
            }

            .contact-gplus {
              font-size: 31px !important;
            }

            .contact-input {
              height: 44px !important;
              padding: 0 14px !important;
            }

            .contact-textarea {
              min-height: 118px !important;
              padding: 12px 14px !important;
            }

            .contact-button {
              width: 102px !important;
              height: 40px !important;
              letter-spacing: 2px !important;
            }
          }
        `}
      </style>
    </section>
  );
};

export default ContactForm;
