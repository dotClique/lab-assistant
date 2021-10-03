import "../styles/Info.css";
import {Alert} from "antd";
import { setLocalInfoViewedStatus } from "../webstorage/WebStorage";

function Info() {
    return (
        <Alert type="info" message="Welcome!"
               description="Click on the different tabs to view various data from the repository" closable onClose={() => {
                   setLocalInfoViewedStatus("true");
               }}/>
    );
}

export default Info;
