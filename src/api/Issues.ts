import {axiosConfig, getAllPages} from "./ApiBase";
import {User} from "./Users";


// Define the types of a time statistic
export interface TimeStats {
    time_estimate: number,
    total_time_spent: number,
    // human_time_estimate: number,
    // human_total_time_spent: number,
}

// Define the type of an issue state (always either open or closed)
export type IssueState = "opened" | "closed";

// Define the types of a label detail
export interface LabelDetails {
    id: number,
    name: string,
    color: string,
    description: string,
    // description_html: string,
    text_color: string,
    // remove_on_close: boolean,
}

// Define the types of the content of an issue
export interface Issue {
    id: number,
    iid: number,
    project_id: number,
    title: string,
    description: string,
    state: IssueState,
    created_at: string,
    updated_at: string,
    closed_at: string,
    closed_by: User | null,
    labels: LabelDetails[],
    milestone: string,
    assignees: (User | null)[],
    author: User,
    type: string,
    assignee: User | null,
    user_notes_count: number,
    merge_requests_count: number,
    upvotes: number,
    downvotes: number,
    due_date: string,
    // confidential: boolean,
    // discussion_locked: boolean,
    issue_type: string,
    // web_url: string,
    time_stats: TimeStats,
    task_completion_status: {
        count: number,
        completed_count: number,
    },
    has_tasks: boolean,
    // _links: any,
    // references: any,
    // moved_to_id: any,
    // service_desk_reply_to: any,
}

// Get all issues in a GitLab repository
export async function getIssues(accessToken: string, projectId: string): Promise<Issue[]> {
    return (
        getAllPages<Issue[]>("/issues", axiosConfig(accessToken, projectId, {per_page: 100, with_labels_details: true}))
    ).then(res => res.map(page => page.data).flat()).catch(e => {
        console.error("Failed to retrieve issues", e);
        return [];
    });
}
