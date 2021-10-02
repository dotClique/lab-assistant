import Axios, {AxiosRequestConfig, AxiosResponse} from "axios";

const gitlabInstanceUrl = "https://gitlab.stud.idi.ntnu.no";
const apiVersion = "v4"

const THEME = "theme";

export const getLocalStorageTheme = (): string | null => localStorage.getItem(THEME);

export const setLocalStorageTheme = (theme: string) => localStorage.setItem(THEME, theme);

export function axiosConfig(token: string, projectId: string, perPage: number | null = null): AxiosRequestConfig {
    return {
        headers: {
            "PRIVATE-TOKEN": token,
        },
        baseURL: `${gitlabInstanceUrl}/api/${apiVersion}/projects/${encodeURIComponent(projectId)}`,
        params: {
            per_page: perPage
        }
    }
}

export async function isAuthorized(accessToken: string, projectId: string): Promise<boolean> {
    try {
        return (
            await Axios.get(`/`, axiosConfig(accessToken, projectId))
        ).data;
    } catch (e) {
        console.log("Failed to authorize", e)
        return false
    }
}

export async function getAllPages<T>(url: string, config: AxiosRequestConfig): Promise<AxiosResponse<T>[]> {
    const pages: AxiosResponse<T>[] = [];
    let nextLink = url;
    while (true) {
        const next = await Axios.get<T>(nextLink, config);
        pages.push(next);
        const nextLinks = (next.headers["link"] as string)
            .split(", ")
            .map(
                l => l.split("; ")
            )
            .filter(link => link[1] === "rel=\"next\"");
        if (nextLinks.length < 1) {
            return pages
        }
        nextLink = nextLinks[0][0].slice(1, -1);
    }
}