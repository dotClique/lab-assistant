import "./styles.css";
import {Alert} from "antd";
import { setLocalInfoViewedStatus } from "../../webstorage/WebStorage";

/**
 *  A welcome message that greets the user the first time they enter the website, and until they close it
 */
function Info() {
    return (
        <Alert type="info" message="Welcome!"
               description="Click on the different tabs to view various data from the repository" closable onClose={() => {
                   setLocalInfoViewedStatus("true");
               }}/>
    );
}

export default Info;
