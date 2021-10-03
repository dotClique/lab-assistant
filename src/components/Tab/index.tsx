import {Tabs} from 'antd';
import './styles.css';
import React, {useContext} from "react";
import AwardsTab from "../AwardsTab";
import IssuesTab from "../IssuesTab";
import CommitsTab from "../CommitsTab";
import {ThemeContext} from "../../App";

const {TabPane} = Tabs;

/**
 * Function that renders the tab component used to categorize data into tabs
 * @returns tab with three tab panes
 */
function Tab() {

    const {theme} = useContext(ThemeContext)

    return (
        <div className="card-container">
            <Tabs className={theme}>
                <TabPane tab="Issues" key="1">
                    <IssuesTab/>
                </TabPane>
                <TabPane tab="Commits" key="2">
                    <CommitsTab/>
                </TabPane>
                <TabPane tab="Awards" key="3">
                    <AwardsTab/>
                </TabPane>
            </Tabs>
        </div>
    )
}

export default Tab;
