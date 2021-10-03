import Axios from "axios";
import {AssetsContextType} from "../App";

// Define the types of a User
export interface User {
    id: number,
    name: string,
    username: string,
    state: string,
    // avatar_url: string,
    // web_url: string,
}

// Get all possible names a user can have from text files
export async function getNames() {
    return {
        nouns: (await Axios.get<string>("/nouns.txt")).data.split("\n"),
        adjectives: (await Axios.get<string>("/adjectives.txt")).data.split("\n"),
    }
}

// Function that anonymizes a username based on its user id
export function anonymize({nouns, adjectives}: {nouns: string[], adjectives: string[]}, userId: number): string {
    return adjectives[userId % adjectives.length] + " " + nouns[userId % nouns.length]
}

// Function that uses a hashcode to anonymize a string
export function anonymizeString({nouns, adjectives}: AssetsContextType["names"], str: string): string {
    const hashCode = Math.abs(str.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0)) % 10000
    return adjectives[hashCode % adjectives.length] + " " + nouns[hashCode % nouns.length]
}
