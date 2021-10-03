import React, {useContext, useEffect, useState} from "react";
import {AssetsContext, AuthContext, ThemeContext} from "../../App";
import {getCommits} from "../../api/Commits";
import {DatePicker, Space, Spin} from "antd";
import {LoadingOutlined} from '@ant-design/icons';
import {Line} from "react-chartjs-2";
import '../CommitList/styles.css';
import {chartOptions, CommitsTabType, getChartDatasets, getCommitStats, getFilteredCommits, initialState} from "./util";
import CommitList from "../CommitList";

const {RangePicker} = DatePicker;

/**
 * Tab showing commit statistics
 */
export default function CommitsTab(): React.ReactElement {

    // Use contexts
    const auth = useContext(AuthContext);
    const assets = useContext(AssetsContext);
    const {theme} = useContext(ThemeContext)

    // Get state
    const [{commits, dates, dateStats, minMoment, maxMoment, fromMoment, toMoment, fromIndex, toIndex, filteredCommits},
        setState
    ] = useState<CommitsTabType>(initialState);

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
                <CommitList theme={theme} commits={filteredCommits} names={assets.names}/>
                {/* Line-diagram of commits, with additions */}
                <div className={"tab-data-chart"}>
                    <Line data={chartData} options={chartOptions}/>
                </div>
            </div>

        </div>
    )
}
