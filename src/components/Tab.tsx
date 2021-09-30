import {Tabs} from 'antd';
import '../styles/Tab.css';
import React, {useContext} from "react";
import AwardsTab from "./AwardsTab";
import IssuesTab from "./IssuesTab";
import CommitsTab from "./CommitsTab";
import {ThemeContext} from "../App";

const {TabPane} = Tabs;

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

/*
    Previous solutions without nice visualization:
    <ul>{commits.map(c => <li key={c.id}>{c.title}</li>)}</ul>
    <ul>{awards.map(a => <li key={a.id}>{a.name}</li>)}</ul>
*/

export default Tab;
