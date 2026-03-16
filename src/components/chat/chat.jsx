import React from 'react';
import "./chat.css";

const Chat = () => {
    return (
        <div className="chat">
            <p className="h1-chat">¿Tienes alguna pregunta?</p>
            <p className="h2-chat">¡Estamos aquí para ayudarte!</p>
            <button className="chat-button">Iniciar Chat</button>
        </div>
    );
}

export default Chat;