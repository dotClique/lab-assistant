import React, {useContext, useEffect, useState} from "react";
import {AuthContext, AssetsContext, ThemeContext} from "../App";
import {getIssues, Issue, IssueState} from "../api/Issues";
import {Card, Radio, RadioChangeEvent, Select, Space, Tag, Typography} from "antd";
import {anonymize} from "../api/Users";
import {CheckCircleTwoTone, ClockCircleTwoTone} from '@ant-design/icons';
import {Radar} from "react-chartjs-2";
import '../styles/IssuesTab.css'

const {Text} = Typography;
const {Option} = Select;

interface IssuesTabState {
    issues: Issue[],
    weekdayCreatedTally: number[],
    weekdayClosedTally: number[],
    issueStateFilter?: IssueState,
    issuesLabelFilter: string[],
    labels: string[],
}

export default function IssuesTab() {

    const auth = useContext(AuthContext);
    const [{
        issues,
        weekdayCreatedTally,
        weekdayClosedTally,
        issueStateFilter,
        issuesLabelFilter,
        labels
    }, setState] = useState<IssuesTabState>({
        issues: [],
        weekdayCreatedTally: [],
        weekdayClosedTally: [],
        issuesLabelFilter: [],
        labels: [],
    });

    const assets = useContext(AssetsContext);

    const weekdayFromISODateString = (isoString: string) => {
        // Strip ISO string to only include date, and adjust week to start on monday
        return (new Date(Date.parse(isoString.slice(0, 10))).getDay() - 1) % 7
    }

    useEffect(() => {
        let isActive = true;
        getIssues(auth.accessToken, auth.projectId).then(issues => {
            // Don't update if the component has unmounted
            if (!isActive) return;
            // Count number of issues created and closed per weekday
            const weekdayCreatedTally = new Array(7).fill(0)
            const weekdayClosedTally = new Array(7).fill(0)
            for (const i of issues) {
                weekdayCreatedTally[weekdayFromISODateString(i.created_at)] += 1
                if (i.closed_at !== null) {
                    weekdayClosedTally[weekdayFromISODateString(i.closed_at)] += 1
                }
            }
            setState(prev => ({
                ...prev,
                issues: issues, weekdayCreatedTally: weekdayCreatedTally, weekdayClosedTally: weekdayClosedTally
            }));
        })
        return () => {
            isActive = false;
        };
    }, [auth])

    useEffect(() => {
        const distinctLabels = (issues: Issue[]) => {
            const n: string[] = [];
            for (const issue of issues) {
                for (const label of issue.labels) {
                    if (!n.includes(label)) {
                        n.push(label);
                    }
                }
            }
            return n;
        }
        setState(prev => ({
            ...prev, labels: distinctLabels(prev.issues)
        }))
    }, [issues]);

    const {theme} = useContext(ThemeContext)

    const radioOptions: { label: string, value: IssueState | "" }[] = [
        {label: "Either", value: ""},
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

    const addLabelToFilter: React.MouseEventHandler<HTMLSpanElement> = e => {
        const label = e.currentTarget.innerText;
        if (!issuesLabelFilter.includes(label)) {
            setState(prev => ({...prev, issuesLabelFilter: [...prev.issuesLabelFilter, label]}))
        }
    }

    return (
        <div className={"tab-content"}>
            <div className={"tab-data-content"}>
                <div>
                    <Space direction="vertical" className="noteable-filter-container">
                        <Text strong={true}>Show issues that are:</Text>
                        <Radio.Group onChange={updateStateFilter} size="large" options={radioOptions} defaultValue=""
                                     optionType="button" buttonStyle="solid"/>
                        <Select style={{minWidth: "20em", maxWidth: "100%", overflow: "visible"}} mode="multiple" allowClear
                                value={issuesLabelFilter} placeholder="Labels to filter on"
                                onChange={updateLabelFilter}>{labels.map(l => <Option key={l} value={l}>{l}</Option>)}</Select>
                    </Space>
                    {((issueStateFilter == null && issuesLabelFilter.length === 0) ?
                        issues : issues.filter(i =>
                            (issueStateFilter == null || i.state === issueStateFilter)
                            && (issuesLabelFilter.length === 0 || issuesLabelFilter.some(label => i.labels.includes(label)))
                        )).map(i =>
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
                                            <Tag onClick={addLabelToFilter} key={l}>{l}</Tag>
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
                        }
                    />
                </div>
            </div>
        </div>
    )

}
