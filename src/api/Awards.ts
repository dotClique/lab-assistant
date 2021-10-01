import {axiosConfig, getAllPages} from "./ApiBase";

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

export async function getAwards(accessToken: string, projectId: string): Promise<Award[]> {
    const issueId = "5";
    const noteId = "413065";
    try {
        return (
            await getAllPages<Award[]>(
                `/issues/${issueId}/notes/${noteId}/award_emoji`,
                axiosConfig(accessToken, projectId, 100))
        ).map(page => page.data).flat();
    } catch (e) {
        console.error("Failed to retrieve awards", e);
        return [];
    }
}
