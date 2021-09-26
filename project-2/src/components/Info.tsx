import "../styles/Info.css";
import {InfoCircleOutlined} from '@ant-design/icons';

function Info() {
    return(
        <div className="info-section">
            <InfoCircleOutlined style={{fontSize: "30px", float: 'left', color: 'rgb(107, 107, 107)'}}/>
            <h3>Click on the different tabs to view various data from the repository.</h3>
        </div>
    );
};

export default Info;