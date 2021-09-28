import "../styles/Info.css";
import {InfoCircleOutlined} from '@ant-design/icons';

function Info() {
    return(
        <div className={"info-section"}>
            <InfoCircleOutlined className={"info-icon"}/>
            <h3>Click on the different tabs to view various data from the repository.</h3>
        </div>
    );
}

export default Info;