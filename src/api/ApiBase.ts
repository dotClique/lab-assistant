import Axios, {AxiosRequestConfig, AxiosResponse} from "axios";

const gitlabInstanceUrl = "https://gitlab.stud.idi.ntnu.no";
const apiVersion = "v4"

const THEME = "theme";

export const getLocalTheme = (): string | null => localStorage.getItem(THEME);

export const setLocalTheme = (theme: string) => localStorage.setItem(THEME, theme);

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

// Session Storage helpers

const GITLAB_ACCESS_TOKEN_KEY = "gitLabAccessToken"
const GITLAB_PROJECT_ID_KEY = "gitLabProjectId"

export const getSessionAccessToken = (): string | null => sessionStorage.getItem(GITLAB_ACCESS_TOKEN_KEY);

export const setSessionAccessToken = (token: string) => sessionStorage.setItem(GITLAB_ACCESS_TOKEN_KEY, token)

export const getSessionProjectId = (): string | null => sessionStorage.getItem(GITLAB_PROJECT_ID_KEY);

export const setSessionProjectId = (token: string) => sessionStorage.setItem(GITLAB_PROJECT_ID_KEY, token);

export const sessionHasCredentials = (): boolean => {
    return getSessionAccessToken() !== null && getSessionProjectId() !== null;
};

export const clearSessionCredentials = () => {
    sessionStorage.removeItem(GITLAB_ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(GITLAB_PROJECT_ID_KEY)
}
