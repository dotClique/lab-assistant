import {Card, List, Tabs} from 'antd';
import '../styles/Tab.css';
import React, {useContext, useEffect, useState} from "react";
import {Commit, getCommits} from "../api/Commits";
import {Award, getAwards} from "../api/Awards";
import {getIssues, Issue} from "../api/Issues";
import {AuthContext, NamesContext} from "../App";
import {anonymize} from "../api/Users";

const {TabPane} = Tabs;

interface TabsState {
    commits: Commit[],
    awards: Award[],
    issues: Issue[]
}

function Tab() {
  
    const auth = useContext(AuthContext);
    const [{commits, awards, issues}, setState] = useState<TabsState>({
        commits: [],
        awards: [],
        issues: []
    });
    const names = useContext(NamesContext);
    useEffect(() => {
        getCommits(auth.accessToken, auth.projectId).then(commits => setState(prev => ({...prev, commits: commits})));
        getAwards(auth.accessToken, auth.projectId).then(awards => setState(prev => ({...prev, awards: awards})));
        getIssues(auth.accessToken, auth.projectId).then(issues => setState(prev => ({...prev, issues: issues})));
    }, [auth, names])

    return (
        <div className="card-container">
            <Tabs>
                <TabPane tab="Issues" key="1">
                    <p>Here you can see issues for the project</p><br/>
                    <div>
                        {issues.map(i =>
                            <div>
                                <Card title={i.title} bordered={true} style={{ width: "45%" }}>
                                    <p><strong>Closed:</strong> {i.closed_at === null ? "❌" : "✔"}</p>
                                    <p><strong>Time spent:</strong> {Math.round(i.time_stats.total_time_spent / 3600)}h</p>
                                    <p><strong>Author:</strong> {anonymize(names, i.author.id)}</p>
                                    <p><strong>Upvotes:</strong> {i.upvotes}</p>
                                </Card>
                            <br/>
                            </div>
                        )}
                    </div>
                </TabPane>
                <TabPane tab="Commits" key="2">
                    <p>Here you can see commits for the project</p><br/>
                    <List
                        style={{width: "45%"}}
                        size="large"
                        header={<div style={{fontSize: 20}}><strong>Project commits</strong></div>}
                        bordered
                        dataSource={commits}
                        renderItem={item => <List.Item>{item.title}</List.Item>}
                    />
                </TabPane>
                <TabPane tab="Awards" key="3">
                    <p>Here you can see the awards used in the project</p><br/>
                    <div>
                        {awards.map(a => 
                            <div>
                                <Card title={a.name} bordered={true} style={{ width: "45%" }}>
                                    <p>Display actual emoji here</p>
                                </Card>
                                <br/>
                            </div>
                        )}
                    </div>
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
