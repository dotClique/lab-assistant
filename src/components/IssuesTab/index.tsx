import React, {useContext, useEffect, useState} from "react";
import {AssetsContext, AuthContext, ThemeContext} from "../../App";
import {getIssues, Issue, IssueState} from "../../api/Issues";
import {Radio, RadioChangeEvent, Select, Space} from "antd";
import {Radar} from "react-chartjs-2";
import './styles.css'
import {ChartDataset} from "chart.js";
import {getRadarOptions, weekdays} from "./utlis";
import IssueList from "../IssueList";
// Lazy migration path to avoid tree-shaking, see https://react-chartjs-2.js.org/docs/migration-to-v4/#tree-shaking
import 'chart.js/auto'

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
    // Use auth context
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
    
    // Use assets context
    const assets = useContext(AssetsContext);

    const weekdayFromISODateString = (isoString: string) => {
        // Strip ISO string to only include date, and adjust week to start on monday
        // Requires hack to get modulo with negative numbers:
        // https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm
        return ((new Date(Date.parse(isoString.slice(0, 10))).getDay() - 1) % 7 + 7) % 7
    }

    // Retrieve issues
    useEffect(() => {
        let isActive = true;
        getIssues(auth.accessToken, auth.projectId).then(issues => {
            // Don't update if the component has unmounted
            if (!isActive) return;
            setState(prev => ({...prev, issues: issues}));
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

    // Retrieve all unique labels of issues
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

    // Filter issues
    useEffect(() =>
        setState( p => ({
            ...p,
                filteredIssues: (p.issueStateFilter == null && p.issuesLabelFilter.length === 0) ?
            p.issues : p.issues.filter(i =>
            (p.issueStateFilter == null || i.state === p.issueStateFilter)
            && (p.issuesLabelFilter.length === 0 || i.labels.some(label => p.issuesLabelFilter.includes(label.name)))
            )
        })), [issues, issuesLabelFilter, issueStateFilter]);

    // Use theme context
    const {theme} = useContext(ThemeContext)

    // Define radio options for filter
    const radioOptions: { label: string, value: IssueState | "" }[] = [
        {label: "All", value: ""},
        {label: "Closed", value: "closed"},
        {label: "Open", value: "opened"},
    ];

    // Update state filter based on radio option
    const updateStateFilter = (e: RadioChangeEvent) => {
        const newValue = e.target.value === "" ? null : e.target.value;
        setState(prev => ({...prev, issueStateFilter: newValue}));
    };

    // Update label filer based on chosen label
    const updateLabelFilter = (value: string[]) => {
        setState(prev => ({...prev, issuesLabelFilter: value}));
    };

    // Add label of issue to filter on click
    const toggleLabelInFilter: React.MouseEventHandler<HTMLSpanElement> = e => {
        const label = e.currentTarget.innerText;
        setState(prev => ({...prev, issuesLabelFilter:
        prev.issuesLabelFilter.includes(label) ?
            [...prev.issuesLabelFilter.slice(0, prev.issuesLabelFilter.indexOf(label)),
                ...prev.issuesLabelFilter.slice(prev.issuesLabelFilter.indexOf(label)+1)]
            : [...prev.issuesLabelFilter, label]
        }))
    }

    // Define the issues datasets
    const issuesDatasets: ChartDataset<"radar", number[]>[] = [
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
                <IssueList issues={filteredIssues} names={assets.names} theme={theme} toggleLabelInFilter={toggleLabelInFilter}/>

                <div className={"tab-data-chart"}>
                    <Radar
                        data={{datasets: issuesDatasets, labels: weekdays}}
                        options={getRadarOptions(issueStateFilter)}
                    />
                </div>
            </div>
        </div>
    )
}
