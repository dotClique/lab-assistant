import logo from "../gitlab-logo-w.png";
import React, {useContext} from "react";
import "../styles/Header.css";
import {AuthContext, ThemeContext} from "../App"
import { Tag } from "antd";

function Header() {
    const {theme, toggleTheme} = useContext(ThemeContext)
    const auth = useContext(AuthContext)
    return (
        <div className={"header" + (theme === "blue" ? " blue" : "")}>
            <img src={logo} className="App-logo" alt="logo" onClick={toggleTheme}/>
            <div className={"header-text-container"}>
                <h1 className="header-text">Lab Assistant</h1>
                {auth.authenticated &&
                    (
                        <Tag color={theme === "orange" ? "#f50" : "#3F8CE4"}>Project: {auth.projectId}</Tag>
                    )
                }
            </div>
        </div>
    );
}

export default Header;
