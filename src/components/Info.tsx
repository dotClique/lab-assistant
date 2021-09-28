import "../styles/Info.css";
import {Alert} from "antd";

function Info() {
    return (
        <Alert type="info" message="Welcome!"
               description="Click on the different tabs to view various data from the repository" showIcon closable/>
    );
}

export default Info;
