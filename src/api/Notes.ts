import {axiosConfig, getAllPages, toSnakeCase} from "./ApiBase";
import {User} from "./Users";

// Define the types of the content of a note
export interface Note {
    id: number,
    // type,
    body: string,
    // attachment,
    author: Pick<User, 'id' | 'name' | 'username' | 'state'>,
    created_at: string,
    updated_at: string,
    // system,
    noteable_id: number,
    noteable_type: Noteable,
    // resolvable,
    // confidential,
    noteable_iid: number,
    // commands_changes,
}

// Define the type of a Noteable (always either issue or merge request)
export type Noteable = "Issue" | "MergeRequest";

// Define the types of the content of a NotableType
export interface NoteableType {
    iid: number,
    user_notes_count: number,
}

// Retrieve all notes on a specific merge request or issue from a GitLab repository
export async function getAllNotesOnNoteable(noteableType: string, noteableIid: number, accessToken: string, projectId: string): Promise<Note[]> {
    try {
        return (
            await getAllPages<Note[]>(`/${toSnakeCase(noteableType)}s/${noteableIid}/notes`, axiosConfig(accessToken, projectId, {per_page: 100}))
        ).map(page => page.data).flat();
    } catch (e) {
        console.error(`Failed to retrieve notes on Noteable ${noteableIid} of type ${noteableType}`, e);
        return [];
    }
}

export type GetterOfAllNoteablesOfType = (accessToken: string, projectId: string) => Promise<NoteableType[]>;

// Retrieve all notes on merge requests or issues in a GitLab repository
export async function getAllNotesOnNoteableType(noteableType: Noteable, getAll: GetterOfAllNoteablesOfType, accessToken: string, projectId: string): Promise<Note[]> {
    return (
        await Promise.all(
            (await getAll(accessToken, projectId))
                .filter(noteable => noteable.user_notes_count > 0)
                .map(noteable => getAllNotesOnNoteable(noteableType, noteable.iid, accessToken, projectId))
        )
    ).flat();
}

// REtrieve absolutely all notes in a GitLab repository
export async function getAllNotes(noteableTypes: { getAll: (accessToken: string, projectId: string) => Promise<NoteableType[]>, name: Noteable }[], accessToken: string, projectId: string): Promise<Note[]> {
    return (
        await Promise.all(
            noteableTypes.map(noteableType => getAllNotesOnNoteableType(noteableType.name, noteableType.getAll, accessToken, projectId))
        )
    ).flat();
}
