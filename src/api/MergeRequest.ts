import {User} from "./Users";
import {TimeStats} from "./Issues";
import {axiosConfig, getAllPages} from "./ApiBase";

export interface MergeRequest {
    id: number,
    iid: number,
    project_id: number,
    title: string,
    description: string,
    state: string,
    created_at: string,
    updated_at: string,
    merged_by: User | null,
    merged_at: string,
    closed_by: User | null,
    closed_at: string,
    target_branch: string,
    source_branch: string,
    user_notes_count: number,
    upvotes: number,
    downvotes: number,
    author: User | null,
    assignees: User[],
    assignee: User | null,
    reviewers: User[],
    // source_project_id,
    // target_project_id,
    labels: string[],
    work_in_progress: boolean,
    milestone: string,
    // merge_when_pipeline_succeeds,
    // merge_status,
    // sha,
    // merge_commit_sha,
    // squash_commit_sha,
    // discussion_locked,
    // should_remove_source_branch,
    // force_remove_source_branch,
    // reference,
    // references,
    // web_url,
    time_stats: TimeStats,
    // squash,
    // task_completion_status,
    // has_conflicts,
    // blocking_discussions_resolved,
    // subscribed,
    changes_count: number,
    // head_pipeline,
    // diff_refs,
    // merge_error,
    // first_contribution,
    // user,
}

export async function getMergeRequests(accessToken: string, projectId: string): Promise<MergeRequest[]> {
    try {
        return (
            await getAllPages<MergeRequest[]>("/merge_requests", axiosConfig(accessToken, projectId, 100))
        ).map(page => page.data).flat();
    } catch (e) {
        console.error("Failed to retrieve merge requests", e);
        return [];
    }
}
