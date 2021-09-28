import Axios from "axios";
import {NamesContextType} from "../App";

export interface User {
    id: number,
    name: string,
    username: string,
    state: string,
    // avatar_url: string,
    // web_url: string,
}

export async function getNames() {
    return {
        nouns: (await Axios.get<string>("/nouns.txt")).data.split("\n"),
        adjectives: (await Axios.get<string>("/adjectives.txt")).data.split("\n"),
    }
}

export function anonymize({nouns, adjectives}: NamesContextType, user: User | null): User | null {
    return user === null
        ? user
        : {
            ...user,
            name: adjectives[user.id % adjectives.length] + " " + nouns[user.id % nouns.length]
        };
}
