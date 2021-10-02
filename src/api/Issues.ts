import {axiosConfig, getAllPages} from "./ApiBase";
import {User} from "./Users";

export interface TimeStats {
    time_estimate: number,
    total_time_spent: number,
    // human_time_estimate: number,
    // human_total_time_spent: number,
}

export interface Issue {
    id: number,
    iid: number,
    project_id: number,
    title: string,
    description: string,
    state: string,
    created_at: string,
    updated_at: string,
    closed_at: string,
    closed_by: User | null,
    labels: string[],
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

export async function getIssues(accessToken: string, projectId: string): Promise<Issue[]> {
    return (
        getAllPages<Issue[]>("/issues", axiosConfig(accessToken, projectId, 100))
    ).then(res => res.map(page => page.data).flat()).catch(e => {
        console.error("Failed to retrieve issues", e);
        return [];
    });
}