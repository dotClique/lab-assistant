import {Tabs} from 'antd';
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
            <Tabs type="card">
                <TabPane tab="Issues" key="1">
                    <p>Here you can see issues for the project</p>
                    <ul>
                        {issues.map(i =>
                            <li key={i.iid}>
                                {i.title}
                                <ul>
                                    <li key={1}>Closed: {i.closed_at === null ? "❌" : "✔"}</li>
                                    <li key={2}>Time spent: {Math.round(i.time_stats.total_time_spent / 3600)}h</li>
                                    <li key={3}>Author: {anonymize(names, i.author.id)}</li>
                                    <li key={4}>Upvotes: {i.upvotes}</li>
                                </ul>
                            </li>
                        )}
                    </ul>
                </TabPane>
                <TabPane tab="Commits" key="2">
                    <p>Here you can see commits for the project</p>
                    <ul>{commits.map(c => <li key={c.id}>{c.title}</li>)}</ul>
                </TabPane>
                <TabPane tab="Awards" key="3">
                    <p>Here you can see the awards used in the project</p>
                    <ul>{awards.map(a => <li key={a.id}>{a.name}</li>)}</ul>
                </TabPane>
            </Tabs>
        </div>
    )
}

export default Tab;
