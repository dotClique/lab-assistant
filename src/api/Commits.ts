import Axios from 'axios';
import {axiosConfig} from "./ApiBase";

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
}

export async function getCommits(accessToken: string, projectId: string): Promise<Commit[]> {
    try {
        return (await Axios.get<Commit[]>(`/repository/commits`, axiosConfig(accessToken, projectId))).data;
    } catch (e) {
        return [];
    }
}