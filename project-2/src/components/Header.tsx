import logo from "../gitlab-logo.png";
import "../styles/Header.css";

function Header() {
    return(
        <div className="Header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 id="title">Gitlab-repo Information</h1>
        </div>
    );
}

export default Header;