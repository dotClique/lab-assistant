import { Tabs } from 'antd';
import '../styles/Tab.css';
import React, {useEffect, useState} from "react";
import {Commit, getCommits} from "../api/Commits";
import {Award, getAwards} from "../api/Awards";


const { TabPane } = Tabs;

function Tab() {
    const [{commits, awards}, setState] = useState<{ commits: Commit[], awards: Award[] }>({commits: [], awards: []});
    useEffect(() => {
        getCommits().then(commits => setState(prev => ({...prev, commits: commits})));
        getAwards().then(awards => setState(prev => ({...prev, awards: awards})));
    }, [])
    return (
        <div className="card-container">
            <Tabs type="card">
                <TabPane tab="Issues" key="1">
                    <p>Here you can see issues for the project</p>
                    <p>More content</p>
                    <p>More content</p>
                </TabPane>
                <TabPane tab="Commits" key="2">
                    <p>Here you can see commits for the project</p>
                    <ul>{commits.map(c => <li>{c.title}</li>)}</ul>
                </TabPane>
                <TabPane tab="Awards" key="3">
                    <p>Here you can see the awards used in the project</p>
                    <ul>{awards.map(a => <li>{a.name}</li>)}</ul>
                </TabPane>
            </Tabs>
        </div>
    )
}

export default Tab;