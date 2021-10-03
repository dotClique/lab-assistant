import {Card, Tag} from "antd";
import {CheckCircleTwoTone, ClockCircleTwoTone} from "@ant-design/icons";
import {anonymize} from "../../api/Users";
import React, {MouseEventHandler} from "react";
import {Issue} from "../../api/Issues";
import {AssetsContextType} from "../../App";

export interface IssueListProps {
    issues: Issue[],
    theme: string,
    names: AssetsContextType["names"],
    toggleLabelInFilter: MouseEventHandler<HTMLSpanElement>,
}

export default function IssueList({issues, theme, names, toggleLabelInFilter}: IssueListProps): React.ReactElement {
    return (
        <div className={"tab-data-list"}>
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
                                    <Tag className="clickable"
                                         onClick={toggleLabelInFilter}
                                         color={l.color}
                                         key={l.name}
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
                        <p><strong>Author:</strong> {anonymize(names, i.author.id)}</p>
                        <p><strong>Upvotes:</strong> {i.upvotes}</p>
                    </Card>
                    <br/>
                </div>
            )}
        </div>
    );
}