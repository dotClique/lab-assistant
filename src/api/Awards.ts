import {axiosConfig, getAllPages, toSnakeCase} from "./ApiBase";
import Axios from "axios";
import {getAllNotes, Note, Noteable} from "./Notes";
import {getIssues} from "./Issues";
import {getMergeRequests} from "./MergeRequest";

// Define the types of the content of an award
export interface Award {
    "id": number,
    "name": string,
    "user": {
        "name": string,
        "username": string,
        "id": number,
        "state": string,
        "avatar_url": string,
        "web_url": string,
    },
    "created_at": string,
    "updated_at": string,
    "awardable_id": number,
    "awardable_type": string
}

// Define the types of a note-award pair
export interface NoteAwardPair {
    note: Note,
    award: Award
}

// Get all the awards on a specific note in a GitLab repository
export async function getAwardsOnNote(noteable: Noteable, noteableIid: number, noteId: number, accessToken: string, projectId: string): Promise<Award[]> {
    return (
        await getAllPages<Award[]>(
            `/${toSnakeCase(noteable)}s/${noteableIid}/notes/${noteId}/award_emoji`,
            axiosConfig(accessToken, projectId, {per_page: 100}))
    ).map(page => page.data).flat();
}

// Get all awards in a GitLab repository
export async function getAllAwards(accessToken: string, projectId: string): Promise<NoteAwardPair[]> {
    return (await Promise.all(
        (await getAllNotes(
                [
                    {name: "Issue", getAll: getIssues},
                    {name: "MergeRequest", getAll: getMergeRequests}
                ],
                accessToken,
                projectId)
        ).map(async note =>
            (await getAwardsOnNote(note.noteable_type, note.noteable_iid, note.id, accessToken, projectId))
                .map(award => ({
                    award: award,
                    note: note
                }))
        )
    )).flat();
}

// Get an emoji corresponding to a specific award string
export async function getEmoji(): Promise<{ [id: string]: string }> {
    return (await Axios.get<{ [id: string]: string }>("emoji.json", {responseType: "json"})).data;
}
