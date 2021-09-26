import logo from "../gitlab-logo-w.png";
import "../styles/Header.css";

function Header() {
    return(
        <div className="header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className={"header-text"}>Gitlab-repo Information</h1>
        </div>
    );
}

export default Header;
