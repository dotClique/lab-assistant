import logo from "../gitlab-logo-w.png";
import React, {useContext} from "react";
import "../styles/Header.css";
import {ThemeContext} from "../App"

function Header() {
    const theme = useContext(ThemeContext)
    return (
        <div className={"header" + (theme.theme === "blue" ? " blue" : "")}>
            <img src={logo} className="App-logo" alt="logo" onClick={theme.toggleTheme}/>
            <h1 className="header-text">Lab Assistant</h1>
        </div>
    );
}

export default Header;
