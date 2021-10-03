import {List} from "antd";
import {anonymizeString} from "../../api/Users";
import React from "react";
import {Commit} from "../../api/Commits";
import {AssetsContextType} from "../../App";

export interface CommitListProps {
    theme: string,
    commits: Commit[],
    names: AssetsContextType["names"],
}

/**
 * Nicely formatted list of commits
 */
export default function CommitList({theme, commits, names}: CommitListProps): React.ReactElement {
    return (
        <div className={"tab-data-list " + theme}>
            <List
                size="large"
                header={<div className="list-header">Project commits</div>}
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
    );
}