import React, {useContext, useEffect, useState} from "react";
import {AssetsContext, AuthContext, ThemeContext} from "../App";
import {Commit, DateStat, getCommits} from "../api/Commits";
import {DatePicker, List, Space, Spin} from "antd";
import {LoadingOutlined} from '@ant-design/icons';
import {Line} from "react-chartjs-2";
import '../styles/CommitsTab.css';
import {anonymizeString} from "../api/Users";
import moment from "moment";
import {ChartDataset, ChartOptions, ChartTypeRegistry} from "chart.js";

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

export default function CommitsTab(): React.ReactElement {

    // Use contexts
    const auth = useContext(AuthContext);
    const assets = useContext(AssetsContext);
    const {theme} = useContext(ThemeContext)

    // Get state
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
    }, setState] = useState<CommitsTabType>(initialState);

    // Retrieve commits
    useEffect(() => {
        let isActive = true;
        getCommits(auth.accessToken, auth.projectId).then(commits => {
            // Don't update if the component has unmounted
            if (isActive) setState(prev => ({...prev, commits: commits}));
        })
        return () => {
            isActive = false;
        }
    }, [auth])

    // Compute commit stats
    useEffect(() => {
        if (commits.length !== 0) setState(prev => ({...prev, ...getCommitStats(commits)}));
    }, [commits])

    // Filter commits on date range
    useEffect(() => {
        if (fromMoment?.toISOString() != null && toMoment?.toISOString() != null) {
            setState(prev => ({...prev, ...getFilteredCommits(fromMoment, toMoment, dates, commits)}))
        }
    }, [commits, dates, fromMoment, toMoment])

    // Update chart data
    const chartDatasets = getChartDatasets(dateStats, fromIndex, toIndex, theme);
    const chartData = {
        labels: dates.slice(fromIndex, toIndex + 1),
        datasets: chartDatasets,
    }

    return (
        <div className={"tab-content"}>

            <div className={"tab-parameters-content " + theme}>
                {/* Either loading-indicator or date interval picker */}
                {!(fromMoment !== null && fromMoment.isValid() && toMoment !== null && toMoment.isValid()) ?
                    // Loading
                    <Spin indicator={
                        <LoadingOutlined style={{color: theme === "orange" ? "rgb(255, 85, 0)" : "rgb(63, 140, 228)"}}
                                         spin/>
                    }>
                        {/* Placeholder range picker to display expected size after loading */}
                        <RangePicker size={"large"} disabled/>
                    </Spin>
                    :
                    // Date interval filter
                    <Space direction="vertical">
                        <RangePicker
                            size={"large"}
                            defaultValue={[fromMoment, toMoment]}
                            disabledDate={m => minMoment == null || maxMoment == null || m < minMoment || m > maxMoment}
                            onChange={range => {
                                if (range !== null) {
                                    setState(prev => ({...prev, fromMoment: range[0], toMoment: range[1]}));
                                }
                            }}
                        />
                    </Space>
                }
            </div>

            {/* Actual content */}
            <div className={"tab-data-content"}>

                {/* List of commits */}
                <div className={"tab-data-list " + theme}>
                    <List
                        size="large"
                        header={<div className="list-header">Project commits</div>}
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

                {/* Line-diagram of commits, with additions */}
                <div className={"tab-data-chart"}>
                    <Line data={chartData} options={chartOptions}/>
                </div>

            </div>

        </div>
    )
}

// Constants

const chartOptions: ChartOptions = {
    maintainAspectRatio: false,
    scales: {
        y1: {
            title: {
                display: true,
                text: 'Commits per day',
                font: {
                    size: 18
                }
            }
        },
        y2: {
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
};

const initialState: CommitsTabType = {
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
}

// Helper functions

/**
 * Get the dates that are between two dates, inclusive.
 */
function getDatesBetweenDates(startDate: Date, endDate: Date): Date[] {
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
 * Filter commits on selected date range
 */
function getFilteredCommits(fromMoment: moment.Moment, toMoment: moment.Moment, dates: string[], commits: Commit[]) {
    const fromIndex = dates.indexOf(fromMoment.toISOString().slice(0, 10))
    const toIndex = dates.indexOf(toMoment.toISOString().slice(0, 10))
    const filteredCommits: Commit[] = []
    for (const i of commits) {
        const dateIndex = dates.indexOf(i.created_at.slice(0, 10))
        if (dateIndex >= fromIndex && dateIndex <= toIndex) {
            filteredCommits.push(i)
        }
    }
    return {
        fromIndex: fromIndex,
        toIndex: toIndex,
        filteredCommits: filteredCommits,
    }
}

function getChartDatasets(dateStats: DateStat[], fromIndex: number, toIndex: number, theme: string)
    : ChartDataset<keyof ChartTypeRegistry, number[]>[] {
    return [
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
    ];
}

/**
 * Gather commits statistics
 */
function getCommitStats(commits: Commit[]) {
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
    return {activeDates, dateStats, minMoment, maxMoment};
}
