import React from "react";
import "./header.css";

const Header = () => {
  return (
    <header className="header">

        <div className="columnas">
          
          <div className="header-content"> 
            <h1 className="rozvi">ROZVI</h1>
            <h2 className="header-title">"Amasamos por ti"</h2>
            <button className="bg-white/95 backdrop-blur-xl text-gray-900 px-20 py-10 rounded-3xl text-3xl font-bold shadow-2xl border-4 border-white/50 hover:border-yellow-500 hover:shadow-yellow-xl hover:scale-[1.05] hover:bg-yellow-50 transition-all duration-500 group">
              Pedir Ahora
            </button>

          </div>
        </div>
    </header>
  );
}

export default Header;