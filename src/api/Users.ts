import Axios from "axios";
import {AssetsContextType} from "../App";

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

export function anonymize({nouns, adjectives}: {nouns: string[], adjectives: string[]}, userId: number): string {
    return adjectives[userId % adjectives.length] + " " + nouns[userId % nouns.length]
}

export function anonymizeString({nouns, adjectives}: AssetsContextType["names"], str: string): string {
    const hashCode = Math.abs(str.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0)) % 10000
    return adjectives[hashCode % adjectives.length] + " " + nouns[hashCode % nouns.length]
}
