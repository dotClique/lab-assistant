import React, {useContext, useEffect, useState} from "react";
import {AuthContext, NamesContext, ThemeContext} from "../App";
import {getIssues, Issue} from "../api/Issues";
import {Card, Tag} from "antd";
import {anonymize} from "../api/Users";
import {CheckCircleTwoTone, ClockCircleTwoTone} from '@ant-design/icons';
import {Radar} from "react-chartjs-2";
import '../styles/IssuesTab.css'

interface IssuesTabState {
    issues: Issue[],
    weekdayCreatedTally: number[],
    weekdayClosedTally: number[]
}

export default function IssuesTab() {

    const auth = useContext(AuthContext);
    const [{issues, weekdayCreatedTally, weekdayClosedTally}, setState] = useState<IssuesTabState>({
        issues: [],
        weekdayCreatedTally: [],
        weekdayClosedTally: []
    });

    const names = useContext(NamesContext);

    const weekdayFromISODateString = (isoString: string) => {
        // Strip ISO string to only include date, and adjust week to start on monday
        return (new Date(Date.parse(isoString.slice(0,10))).getDay() - 1) % 7
    }

    useEffect(() => {
        getIssues(auth.accessToken, auth.projectId).then(issues => {
            // Count number of issues created and closed per weekday
            const weekdayCreatedTally = new Array(7).fill(0)
            const weekdayClosedTally = new Array(7).fill(0)
            for (const i of issues) {
                weekdayCreatedTally[weekdayFromISODateString(i.created_at)] += 1
                if (i.closed_at !== null) {
                    weekdayClosedTally[weekdayFromISODateString(i.closed_at)] += 1
                }
            }
            setState(prev => ({...prev,
                issues: issues, weekdayCreatedTally: weekdayCreatedTally, weekdayClosedTally: weekdayClosedTally
            }));
        });
    }, [auth, names])

    const {theme} = useContext(ThemeContext)

    return (
        <div className={"tab-content"}>
            <div>
                {issues.map(i =>
                    <div key={i.iid}>
                        <Card
                            title={
                                <>
                                    {i.closed_at === null ?
                                        <ClockCircleTwoTone className={"issue-closed-status-icon"}
                                                            twoToneColor={theme === "orange" ? "rgb(255, 85, 0)" : "rgb(63, 140, 228)"}/>
                                        :
                                        <CheckCircleTwoTone className={"issue-closed-status-icon"}
                                                            twoToneColor={"rgb(135,208,104)"}/>}
                                    <span className={"issue-card-title"}>{i.title}</span>
                                    <br/>
                                    {i.labels.length > 0 &&
                                    i.labels.map(l => (
                                        <Tag key={l}>{l}</Tag>
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
                                label: 'created',
                                data: weekdayCreatedTally,
                                fill: true,
                                backgroundColor: theme === "orange" ? 'rgba(255, 85, 0, 0.4)' : 'rgba(63, 140, 228, 0.4)',
                                borderColor: theme === "orange" ? 'rgb(255, 85, 0)' : 'rgb(63, 140, 228)'
                            }, {
                                label: 'closed',
                                data: weekdayClosedTally,
                                fill: true,
                                backgroundColor: 'rgba(135,208,104,0.4)',
                                borderColor: 'rgb(135,208,104)'
                            },
                        ],
                    }}
                    options={
                        {
                            maintainAspectRatio: false,
                            plugins: {
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