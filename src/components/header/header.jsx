import React from "react";
import "./header.css";

const Header = () => {
  return (
    <header className="header">

        <div className="columnas">
          
          <img src={"https://rozvi.com.co/wp-content/uploads/2021/03/1.png"} alt="Logo" className="logo" />
          <div className="header-content"> 
            <h1 className="header-title">"Amasamos por ti"</h1>
            <button>Pedir ahora</button>
          </div>
        </div>
    </header>
  );
}

export default Header;