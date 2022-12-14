import {axiosConfig, getAllPages} from "./ApiBase";

// Define the types of a date statistics
export interface DateStat {
    commits: number,
    additions: number,
    deletions: number
}

// Define the types of the content of a commit
export interface Commit {
    id: string
    short_id: string
    created_at: string
    // parent_ids: string
    title: string
    message: string
    author_name: string
    author_email: string
    authored_date: string
    committer_name: string
    committer_email: string
    committed_date: string
    web_url: string
    stats: DateStat
}

// Get all commits in a GitLab repository
export async function getCommits(accessToken: string, projectId: string): Promise<Commit[]> {
    return (
        getAllPages<Commit[]>(`/repository/commits`, axiosConfig(accessToken, projectId, {per_page: 100, with_stats: true}))
    ).then(res => res.map(page => page.data).flat()).catch(e => {
        console.error("Failed to retrieve commits", e);
        return [];
    });
}
