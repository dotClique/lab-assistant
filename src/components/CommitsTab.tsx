import React, {useContext, useEffect, useState} from "react";
import {AuthContext, AssetsContext, ThemeContext} from "../App";
import {Commit, getCommits} from "../api/Commits";
import {List} from "antd";
import {Line} from "react-chartjs-2";
import '../styles/CommitsTab.css';
import {anonymizeString} from "../api/Users";

interface DateStat {
    commits: number,
    additions: number,
    deletions: number
}

export default function CommitsTab() {

    const auth = useContext(AuthContext);
    const [{
        commits,
        dates,
        dateStats
    }, setState] = useState<{ commits: Commit[], dates: string[], dateStats: DateStat[] }>({
        commits: [],
        dates: [],
        dateStats: []
    });

    const assets = useContext(AssetsContext);

    const getDatesBetweenDates = (startDate: Date, endDate: Date) => {
        let dates: Date[] = []
        const theDate = new Date(startDate) // copy to not modify the original
        while (theDate < endDate && theDate.getDate() !== endDate.getDate()) {
            dates = [...dates, new Date(theDate)] // append new date
            theDate.setDate(theDate.getDate() + 1) // go to next date
        }
        dates = [...dates, endDate]
        return dates
    }

    useEffect(() => {
        let isActive = true;
        getCommits(auth.accessToken, auth.projectId).then(commits => {
            // Don't update if the component has unmounted
            if (!isActive) return;
            // Get all ISO date strings from date of first commit to current date
            const minDate = new Date(Math.min.apply(Math, commits.map(function (o) {
                return Date.parse(o.created_at.slice(0, 10));
            })))
            const maxDate = new Date()
            const activeDates: string[] = getDatesBetweenDates(minDate, maxDate).map(d => d.toISOString().slice(0, 10))
            // Count commits, additions and deletions per date
            const dateStats = Array.from(new Array(activeDates.length)).map(() => ({
                commits: 0,
                additions: 0,
                deletions: 0
            }));
            for (const i of commits) {
                const dateIndex = activeDates.indexOf(i.created_at.slice(0, 10))
                dateStats[dateIndex].commits += 1
                dateStats[dateIndex].additions += i.stats.additions
                dateStats[dateIndex].deletions -= i.stats.deletions
            }
            setState(prev => ({...prev, commits: commits, dates: activeDates, dateStats: dateStats}));
        })
        return () => {
            isActive = false;
        }
    }, [auth])

    const {theme} = useContext(ThemeContext)

    return (
        <div className={"tab-content"}>
            <div className={"commits-list"}>
                <List
                    size="large"
                    header={<div style={{fontSize: 20}}><strong>Project commits</strong></div>}
                    bordered
                    dataSource={commits}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                title={item.title}
                                description={anonymizeString(assets.names, item.author_email)}
                            />
                        </List.Item>
                    )}
                />
            </div>
            <div className={"chart-container"}>
                <Line
                    data={{
                        labels: dates,
                        datasets: [
                            {
                                type: 'line',
                                yAxisID: "y1",
                                label: '# of commits',
                                data: dateStats.map(s => s.commits),
                                fill: false,
                                backgroundColor: theme === "orange" ? 'rgb(255, 85, 0)' : 'rgb(63, 140, 228)',
                                borderColor: theme === "orange" ? 'rgb(255, 85, 0, 0.8)' : 'rgba(63, 140, 228, 0.8)'
                            },
                            {
                                type: 'bar',
                                yAxisID: "y2",
                                label: 'additions',
                                data: dateStats.map(s => s.additions),
                                backgroundColor: 'rgba(82,184,122,0.6)'
                            },
                            {
                                type: 'bar',
                                yAxisID: "y2",
                                label: 'deletions',
                                data: dateStats.map(s => s.deletions),
                                backgroundColor: 'rgba(236,89,65,0.6)'
                            },
                        ],
                    }}
                    options={{
                        maintainAspectRatio: false,
                        scales: {
                            y1: {
                                type: 'linear',
                                position: 'left',
                                title: {
                                    display: true,
                                    text: 'Commits per day',
                                    font: {
                                        size: 18
                                    }
                                }
                            },
                            y2: {
                                type: 'linear',
                                position: 'right',
                                title: {
                                    display: true,
                                    text: 'Additions',
                                    font: {
                                        size: 18
                                    }
                                }
                            },
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'Commits over time',
                                font: {
                                    size: 22
                                },
                                padding: {
                                    top: 10,
                                    bottom: 20
                                }
                            }
                        }
                    }}
                />
            </div>
        </div>
    )

}
