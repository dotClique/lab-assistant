import logo from "../../gitlab-logo-w.png";
import React, {useContext} from "react";
import "./styles.css";
import {AuthContext, ThemeContext} from "../../App"
import {Switch, Tag} from "antd";
import {BgColorsOutlined} from '@ant-design/icons';

function Header() {
    const {theme, toggleTheme} = useContext(ThemeContext)
    const auth = useContext(AuthContext)
    return (
        <div className={"header " + theme} role={"banner"}>
            <img src={logo} className="App-logo" alt="logo" onClick={toggleTheme}/>
            <div className={"header-text-container"}>
                <h1 className="header-text">Lab Assistant</h1>
                {auth.authorized &&
                    (
                        <Tag color={theme === "orange" ? "rgb(255, 85, 0)" : "rgb(63, 140, 228)"}>Project: {auth.projectId}</Tag>
                    )
                }
            </div>
            <div className={"theme-switch-container"}>
                <BgColorsOutlined className={"theme-switch-icon"} />
                <Switch checked={theme !== "orange"} className={"theme-switch " + theme} onChange={toggleTheme} />
            </div>
        </div>
    );
}

export default Header;
