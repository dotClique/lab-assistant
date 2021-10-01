import React, {useContext, useEffect, useState} from "react";
import {AuthContext, NamesContext, ThemeContext} from "../App";
import {Commit, getCommits} from "../api/Commits";
import {List} from "antd";
import {Line} from "react-chartjs-2";
import '../styles/CommitsTab.css';
import {anonymizeString} from "../api/Users";

export default function CommitsTab() {

    const auth = useContext(AuthContext);
    const [{commits, dates, datesTally}, setState] = useState<{ commits: Commit[], dates: string[], datesTally: number[] }>({
        commits: [],
        dates: [],
        datesTally: []
    });

    const names = useContext(NamesContext);

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
        getCommits(auth.accessToken, auth.projectId).then(commits => {
            // Get all ISO date strings from date of first commit to current date
            const minDate = new Date(Math.min.apply(Math, commits.map(function(o) { return Date.parse(o.created_at.slice(0,10)); })))
            const maxDate = new Date()
            const activeDates: string[] = getDatesBetweenDates(minDate, maxDate).map(d => d.toISOString().slice(0,10))
            // Count commits per date
            const datesTally = new Array(activeDates.length).fill(0);
            for (const i of commits) {
                datesTally[activeDates.indexOf(i.created_at.slice(0,10))] += 1
            }
            setState(prev => ({...prev, commits: commits, dates: activeDates, datesTally: datesTally}));
        });
    }, [auth, names])

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
                                description={anonymizeString(names, item.author_email)}
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
                                label: '# of commits',
                                data: datesTally,
                                fill: false,
                                backgroundColor: theme === "orange" ? 'rgb(255, 85, 0)' : 'rgb(63, 140, 228)',
                                borderColor: theme === "orange" ? 'rgb(255, 85, 0, 0.4)' : 'rgba(63, 140, 228, 0.4)'
                            },
                        ],
                    }}
                    options={{
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            },
                            title: {
                                display: true,
                                text: 'Commits over time',
                                font: {
                                    size: 18
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