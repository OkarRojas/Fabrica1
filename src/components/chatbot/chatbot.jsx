import React, { useState, useRef, useEffect } from "react";
import "./chatbot.css";

const ChatBot = () => {
  const backend_url = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const [abierto, setAbierto] = useState(false);
  const [historial, setHistorial] = useState([
    { role: "assistant", content: "¡Hola! Soy Rozvi 🍞 ¿En qué te puedo ayudar hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historial, cargando]);

  const enviar = async () => {
    if (!input.trim() || cargando) return;

    const nuevoHistorial = [...historial, { role: "user", content: input }];
    setHistorial(nuevoHistorial);
    setInput("");
    setCargando(true);

    try {
      const res = await fetch(`${backend_url}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          historial: nuevoHistorial.filter(m => m.role !== "assistant" || historial.indexOf(m) > 0)
            .map(({ role, content }) => ({ role, content }))
        })
      });

      const data = await res.json();
      setHistorial(prev => [...prev, { role: "assistant", content: data.respuesta }]);
    } catch {
      setHistorial(prev => [...prev, {
        role: "assistant",
        content: "😕 Hubo un error al conectar con el servidor."
      }]);
    } finally {
      setCargando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <>
      {/* Burbuja flotante */}
      <button className="chatbot-toggle" onClick={() => setAbierto(prev => !prev)}>
        {abierto ? "✕" : "🍞"}
      </button>

      {/* Ventana de chat */}
      {abierto && (
        <div className="chatbot-ventana">

          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="chatbot-avatar">🍞</span>
              <div>
                <p className="chatbot-nombre">Rozvi</p>
                <p className="chatbot-estado">Asistente virtual</p>
              </div>
            </div>
            <button className="chatbot-cerrar" onClick={() => setAbierto(false)}>✕</button>
          </div>

          {/* Mensajes */}
          <div className="chatbot-mensajes">
            {historial.map((msg, i) => (
              <div key={i} className={`chatbot-mensaje ${msg.role}`}>
                <p>{msg.content}</p>
              </div>
            ))}

            {/* Indicador escribiendo */}
            {cargando && (
              <div className="chatbot-mensaje assistant">
                <div className="chatbot-typing">
                  <span/><span/><span/>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              type="text"
              className="chatbot-input"
              placeholder="Escribe un mensaje..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={cargando}
            />
            <button
              className="chatbot-send"
              onClick={enviar}
              disabled={cargando || !input.trim()}
            >
              ➤
            </button>
          </div>

        </div>
      )}
    </>
  );
};

export default ChatBot;
