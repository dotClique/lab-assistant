import React, {useContext, useEffect, useState} from "react";
import {AuthContext, AssetsContext, ThemeContext} from "../App";
import {Commit, getCommits} from "../api/Commits";
import {List, DatePicker, Spin} from "antd";
import {LoadingOutlined} from '@ant-design/icons';
import {Line} from "react-chartjs-2";
import '../styles/CommitsTab.css';
import {anonymizeString} from "../api/Users";
import moment from "moment";

const {RangePicker} = DatePicker;

interface CommitsTabType {
    commits: Commit[],
    dates: string[],
    dateStats: DateStat[],
    minMoment: moment.Moment | null,
    maxMoment: moment.Moment | null,
    fromMoment: moment.Moment | null,
    toMoment: moment.Moment | null,
    fromIndex: number,
    toIndex: number,
    filteredCommits: Commit[]
}

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
        dateStats,
        minMoment,  // latest date for the loaded commits
        maxMoment,  // most recent date for the loaded commits
        fromMoment,  // selected from date (as moment)
        toMoment,  // selected to date (as moment)
        fromIndex,  // index of from date in dates (for faster lookup)
        toIndex,  // index of to date in dates (for faster lookup)
        filteredCommits  // commits within range (fromMoment, toMoment)
    }, setState] = useState<CommitsTabType>({
        commits: [],
        dates: [],
        dateStats: [],
        minMoment: null,
        maxMoment: null,
        fromMoment: null,
        toMoment: null,
        fromIndex: 0,
        toIndex: 0,
        filteredCommits: []
    });

    const assets = useContext(AssetsContext);

    const getDatesBetweenDates = (startDate: Date, endDate: Date): Date[] => {
        let dates: Date[] = []
        const theDate = new Date(startDate) // copy to not modify the original
        while (theDate < endDate && theDate.getDate() !== endDate.getDate()) {
            dates = [...dates, new Date(theDate)] // append new date
            theDate.setDate(theDate.getDate() + 1) // go to next date
        }
        dates = [...dates, endDate]
        return dates
    }

    /**
     * Retrieve commits
     */
    useEffect(() => {
        let isActive = true;
        getCommits(auth.accessToken, auth.projectId).then(commits => {
            // Don't update if the component has unmounted
            if (!isActive) return;
            setState(prev => ({...prev, commits: commits}));
        })
        return () => {
            isActive = false;
        }
    }, [auth])

    /**
     * Gather commits statistics
     */
    useEffect(() => {
        if (commits.length === 0) {
            return
        }
        // Get all ISO date strings from date of first commit to current date
        const commitDates = commits.map(c => Date.parse(c.created_at.slice(0, 10)))
        const minDate = new Date(Math.min.apply(Math, commitDates))
        const maxDate = new Date(Math.max.apply(Math, commitDates))
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
        const minMoment = moment(minDate)
        const maxMoment = moment(maxDate)
        setState(prev => ({
            ...prev,
            dates: activeDates, dateStats: dateStats,
            minMoment: minMoment, maxMoment: maxMoment,
            fromMoment: minMoment, toMoment: maxMoment
        }));
    }, [commits])

    /**
     * Filter commits on selected date range
     */
    useEffect(() => {
        if (fromMoment?.toISOString() != null && toMoment?.toISOString() != null) {
            const fromIndex = dates.indexOf(fromMoment.toISOString().slice(0, 10))
            const toIndex = dates.indexOf(toMoment.toISOString().slice(0, 10))
            const filteredCommits: Commit[] = []
            for (const i of commits) {
                const dateIndex = dates.indexOf(i.created_at.slice(0, 10))
                if (dateIndex >= fromIndex && dateIndex <= toIndex) {
                    filteredCommits.push(i)
                }
            }
            setState(prev => ({...prev, fromIndex: fromIndex, toIndex: toIndex, filteredCommits: filteredCommits}))
        }
    }, [commits, dates, fromMoment, toMoment])

    const {theme} = useContext(ThemeContext)

    return (
        <div className={"tab-content"}>
            <div className={"tab-parameters-content " + theme}>
                {!(fromMoment !== null && fromMoment.isValid() && toMoment !== null && toMoment.isValid()) ?
                    <Spin indicator={
                        <LoadingOutlined style={{color: theme === "orange" ? "rgb(255, 85, 0)" : "rgb(63, 140, 228)"}}
                                         spin/>
                    }>
                        {/* Placeholder range picker to display expected size after loading */}
                        <RangePicker size={"large"} disabled/>
                    </Spin>
                    :
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <RangePicker
                            size={"large"}
                            defaultValue={[fromMoment, toMoment]}
                            disabledDate={(m: moment.Moment) => {
                                return minMoment === null || maxMoment === null || m < minMoment || m > maxMoment;
                            }}
                            onChange={(range) => {
                                if (range !== null) {
                                    setState(prev => ({...prev, fromMoment: range[0], toMoment: range[1]}));
                                }
                            }}
                        />
                    </div>
                }
            </div>
            <div className={"tab-data-content"}>
                <div className={"commits-list"}>
                    <List
                        size="large"
                        header={<div style={{fontSize: 20}}><strong>Project commits</strong></div>}
                        bordered
                        dataSource={filteredCommits}
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
                            labels: dates.slice(fromIndex, toIndex + 1),
                            datasets: [
                                {
                                    type: 'line',
                                    yAxisID: "y1",
                                    label: '# of commits',
                                    data: dateStats.slice(fromIndex, toIndex + 1).map(s => s.commits),
                                    fill: false,
                                    backgroundColor: theme === "orange" ? 'rgb(255, 85, 0)' : 'rgb(63, 140, 228)',
                                    borderColor: theme === "orange" ? 'rgb(255, 85, 0, 0.8)' : 'rgba(63, 140, 228, 0.8)'
                                },
                                {
                                    type: 'bar',
                                    yAxisID: "y2",
                                    label: 'additions',
                                    data: dateStats.slice(fromIndex, toIndex + 1).map(s => s.additions),
                                    backgroundColor: 'rgba(82,184,122,0.6)'
                                },
                                {
                                    type: 'bar',
                                    yAxisID: "y2",
                                    label: 'deletions',
                                    data: dateStats.slice(fromIndex, toIndex + 1).map(s => s.deletions),
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
        </div>
    )

}
