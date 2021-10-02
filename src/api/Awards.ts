import {axiosConfig, getAllPages, toSnakeCase} from "./ApiBase";
import Axios from "axios";
import {getAllNotes, Note, Noteable} from "./Notes";
import {getIssues} from "./Issues";
import {getMergeRequests} from "./MergeRequest";

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

export interface NoteAwardPair {
    note: Note,
    award: Award
}

export async function getAwardsOnNote(noteable: Noteable, noteableIid: number, noteId: number, accessToken: string, projectId: string): Promise<Award[]> {
    return (
        await getAllPages<Award[]>(
            `/${toSnakeCase(noteable)}s/${noteableIid}/notes/${noteId}/award_emoji`,
            axiosConfig(accessToken, projectId, 100))
    ).map(page => page.data).flat();
}

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

export async function getEmoji(): Promise<{ [id: string]: string }> {
    return (await Axios.get<{ [id: string]: string }>("/emoji.json", {responseType: "json"})).data;
}
