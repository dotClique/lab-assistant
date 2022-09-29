import {Tabs} from 'antd';
import './styles.css';
import React, {useContext} from "react";
import AwardsTab from "../AwardsTab";
import IssuesTab from "../IssuesTab";
import CommitsTab from "../CommitsTab";
import {ThemeContext} from "../../App";

/**
 * Function that renders the tab component used to categorize data into tabs
 * @returns tab with three tab panes
 */
function Tab() {

    const {theme} = useContext(ThemeContext)

    return (
        <div className="card-container">
            <Tabs className={theme} items={[
                {label: "Issues", key: "1", children: <IssuesTab/>},
                {label: "Commits", key: "2", children: <CommitsTab/>},
                {label: "Awards", key: "3", children: <AwardsTab/>},
            ]}/>
        </div>
    )
}

export default Tab;
