import React, {useContext, useEffect, useState} from "react";
import {AuthContext, NamesContext, ThemeContext} from "../App";
import {getIssues, Issue} from "../api/Issues";
import {Card, Tag} from "antd";
import {anonymize} from "../api/Users";
import {CheckCircleTwoTone, ClockCircleTwoTone} from '@ant-design/icons';
import {Radar} from "react-chartjs-2";
import '../styles/IssuesTab.css'

export default function IssuesTab() {

    const auth = useContext(AuthContext);
    const [{issues, weekdayTally}, setState] = useState<{ issues: Issue[], weekdayTally: number[] }>({
        issues: [],
        weekdayTally: []
    });

    const names = useContext(NamesContext);
    useEffect(() => {
        getIssues(auth.accessToken, auth.projectId).then(issues => {
            // Count number of issues per weekday
            const weekdayTally = [0,0,0,0,0,0,0]
            for (const c of issues) {
                const dateString = c.created_at.slice(0,10)  // ISO date string
                const weekday = (new Date(Date.parse(dateString)).getDay() - 1) % 7
                weekdayTally[weekday] += 1
            }
            setState(prev => ({...prev, issues: issues, weekdayTally: weekdayTally}));
        });
    }, [auth, names])

    const {theme} = useContext(ThemeContext)

    return (
        <div className={"tab-content"}>
            <div>
                {issues.map(i =>
                    <div>
                        <Card
                            title={
                                <>
                                    {i.closed_at === null ?
                                        <ClockCircleTwoTone className={"issue-closed-status-icon"}
                                                            twoToneColor={theme === "orange" ? "#f50" : "#3F8CE4"}/>
                                        :
                                        <CheckCircleTwoTone className={"issue-closed-status-icon"}
                                                            twoToneColor={"#87d068"}/>}
                                    <span className={"issue-card-title"}>{i.title}</span>
                                    <br/>
                                    {i.labels.length > 0 &&
                                    i.labels.map(l => (
                                        <Tag>{l}</Tag>
                                    ))
                                    }
                                </>
                            }
                            bordered={true}
                        >
                            <p><strong>Time spent:</strong> {Math.round(i.time_stats.total_time_spent / 3600)}h</p>
                            <p><strong>Author:</strong> {anonymize(names, i.author.id)}</p>
                            <p><strong>Upvotes:</strong> {i.upvotes}</p>
                        </Card>
                        <br/>
                    </div>
                )}
            </div>
            <div className={"chart-container"}>
                <Radar
                    data={{
                        labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                        datasets: [
                            {
                                label: 'issues',
                                data: weekdayTally,
                                fill: true,
                                backgroundColor: theme === "orange" ? 'rgb(255, 85, 0, 0.4)' : 'rgba(63, 140, 228, 0.4)',
                                borderColor: theme === "orange" ? 'rgb(255, 85, 0)' : 'rgb(63, 140, 228)'
                            },
                        ],
                    }}
                    options={
                        {
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false
                                },
                                title: {
                                    display: true,
                                    text: 'Issues per weekday',
                                    font: {
                                        size: 18
                                    },
                                    padding: {
                                        top: 10,
                                        bottom: 20
                                    }
                                }
                            }
                        }
                    } />
            </div>
        </div>
    )

}
