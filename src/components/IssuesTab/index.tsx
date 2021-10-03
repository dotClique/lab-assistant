import React, {useContext, useEffect, useState} from "react";
import {AuthContext, AssetsContext, ThemeContext} from "../../App";
import {getIssues, Issue, IssueState} from "../../api/Issues";
import {Card, Radio, RadioChangeEvent, Select, Space, Tag} from "antd";
import {anonymize} from "../../api/Users";
import {CheckCircleTwoTone, ClockCircleTwoTone} from '@ant-design/icons';
import {Radar} from "react-chartjs-2";
import './styles.css'
import {ChartDataset, ChartTypeRegistry} from "chart.js";

const {Option} = Select;

interface IssuesTabState {
    issues: Issue[],
    weekdayCreatedTally: number[],
    weekdayClosedTally: number[],
    issueStateFilter?: IssueState,
    issuesLabelFilter: string[],
    labels: string[],
    filteredIssues: Issue[],
}

export default function IssuesTab() {

    const auth = useContext(AuthContext);
    const [{
        issues,
        weekdayCreatedTally,
        weekdayClosedTally,
        issueStateFilter,
        issuesLabelFilter,
        labels,
        filteredIssues,
    }, setState] = useState<IssuesTabState>({
        issues: [],
        weekdayCreatedTally: [],
        weekdayClosedTally: [],
        issuesLabelFilter: [],
        labels: [],
        filteredIssues: [],
    });

    const assets = useContext(AssetsContext);

    const weekdayFromISODateString = (isoString: string) => {
        // Strip ISO string to only include date, and adjust week to start on monday
        // Requires hack to get modulo with negative numbers:
        // https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm
        return ((new Date(Date.parse(isoString.slice(0, 10))).getDay() - 1) % 7 + 7) % 7
    }

    useEffect(() => {
        let isActive = true;
        getIssues(auth.accessToken, auth.projectId).then(issues => {
            // Don't update if the component has unmounted
            if (!isActive) return;
            setState(prev => ({
                ...prev,
                issues: issues
            }));
        })
        return () => {
            isActive = false;
        };
    }, [auth])

    useEffect(() => {
        // Count number of issues created and closed per weekday
        const weekdayCreatedTally = new Array(7).fill(0)
        const weekdayClosedTally = new Array(7).fill(0)
        for (const i of filteredIssues) {
            weekdayCreatedTally[weekdayFromISODateString(i.created_at)] += 1
            if (i.closed_at !== null) {
                weekdayClosedTally[weekdayFromISODateString(i.closed_at)] += 1
            }
        }
        setState(prev => ({...prev, weekdayCreatedTally: weekdayCreatedTally, weekdayClosedTally: weekdayClosedTally}))
    }, [filteredIssues])

    useEffect(() => {
        const distinctLabels = (issues: Issue[]) => {
            const n: string[] = [];
            for (const issue of issues) {
                for (const label of issue.labels) {
                    if (!n.includes(label.name)) {
                        n.push(label.name);
                    }
                }
            }
            return n;
        }
        setState(prev => ({
            ...prev, labels: distinctLabels(prev.issues)
        }))
    }, [issues]);

    useEffect(() =>
        setState( p => ({
            ...p,
                filteredIssues: (p.issueStateFilter == null && p.issuesLabelFilter.length === 0) ?
            p.issues : p.issues.filter(i =>
            (p.issueStateFilter == null || i.state === p.issueStateFilter)
            && (p.issuesLabelFilter.length === 0 || i.labels.some(label => p.issuesLabelFilter.includes(label.name)))
            )
        })), [issues, issuesLabelFilter, issueStateFilter]);

    const {theme} = useContext(ThemeContext)

    const radioOptions: { label: string, value: IssueState | "" }[] = [
        {label: "All", value: ""},
        {label: "Closed", value: "closed"},
        {label: "Open", value: "opened"},
    ];

    const updateStateFilter = (e: RadioChangeEvent) => {
        const newValue = e.target.value === "" ? null : e.target.value;
        setState(prev => ({...prev, issueStateFilter: newValue}));
    };

    const updateLabelFilter = (value: string[]) => {
        setState(prev => ({...prev, issuesLabelFilter: value}));
    };

    const toggleLabelInFilter: React.MouseEventHandler<HTMLSpanElement> = e => {
        const label = e.currentTarget.innerText;
        setState(prev => ({...prev, issuesLabelFilter:
        prev.issuesLabelFilter.includes(label) ?
            [...prev.issuesLabelFilter.slice(0, prev.issuesLabelFilter.indexOf(label)),
                ...prev.issuesLabelFilter.slice(prev.issuesLabelFilter.indexOf(label)+1)]
            : [...prev.issuesLabelFilter, label]
        }))
    }
    const issuesDatasets: ChartDataset<keyof ChartTypeRegistry, number[]>[] = [
        {
            label: 'created',
            data: weekdayCreatedTally,
            fill: true,
            backgroundColor: theme === "orange" ? 'rgba(255, 85, 0, 0.4)' : 'rgba(63, 140, 228, 0.4)',
            borderColor: theme === "orange" ? 'rgb(255, 85, 0)' : 'rgb(63, 140, 228)'
        },
    ];

    if (issueStateFilter !== "opened") {
        issuesDatasets.push({
            label: 'closed',
            data: weekdayClosedTally,
            fill: true,
            backgroundColor: 'rgba(135,208,104,0.4)',
            borderColor: 'rgb(135,208,104)'
        });
    }

    return (
        <div className={"tab-content"}>
            <div className={"tab-parameters-content"}>
                <Space direction="vertical" className="noteable-filter-container">
                <Radio.Group onChange={updateStateFilter} size="large" options={radioOptions} defaultValue=""
                             optionType="button" buttonStyle="solid"/>
                <Select style={{minWidth: "20em", maxWidth: "100%", overflow: "visible"}} mode="multiple" allowClear
                        value={issuesLabelFilter} placeholder="Filter by labels"
                        onChange={updateLabelFilter}>{labels.map(l => <Option key={l} value={l}>{l}</Option>)}</Select>
            </Space>
            </div>
            <div className={"tab-data-content"}>
                <div className={"tab-data-list"}>
                    {filteredIssues.map(i =>
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
                                            <Tag className="clickable"
                                                 onClick={toggleLabelInFilter}
                                                 color={l.color}
                                                 style={{color: l.text_color}}>
                                                {l.name}
                                            </Tag>
                                        ))
                                        }
                                    </>
                                }
                                bordered={true}
                            >
                                <p><strong>Time spent:</strong> {Math.round(i.time_stats.total_time_spent / 3600)}h</p>
                                <p><strong>Author:</strong> {anonymize(assets.names, i.author.id)}</p>
                                <p><strong>Upvotes:</strong> {i.upvotes}</p>
                            </Card>
                            <br/>
                        </div>
                    )}
                </div>
                <div className={"tab-data-chart"}>
                    <Radar
                        data={{
                            labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                            datasets: issuesDatasets,
                        }}
                        options={
                            {
                                maintainAspectRatio: false,
                                plugins: {
                                    title: {
                                        display: true,
                                        text: (issueStateFilter == null ? "I" : issueStateFilter === "opened" ? "Open i" : "Closed i") + 'ssues per weekday',
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
                        }
                    />
                </div>
            </div>
        </div>
    )

}
