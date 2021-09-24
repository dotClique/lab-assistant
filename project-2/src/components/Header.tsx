import React from "react";
import logo from "../gitlab-logo.png";
import "./Header.css";

function Header() {
    return(
        <div className="Header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1>Gitlab-repo Information</h1>
        </div>
    );
}

export default Header;