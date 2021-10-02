import Axios, {AxiosRequestConfig, AxiosResponse} from "axios";

const gitlabInstanceUrl = "https://gitlab.stud.idi.ntnu.no";
const apiVersion = "v4"

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

export function toSnakeCase(camelCase: string): string {
    // Replace all sequences beginning with an uppercase letter, with _ followed by that sequence in lowercase.
    return camelCase.match(/^[a-z]+|[A-Z]+[a-z]*/g)
        ?.map(word => word.toLowerCase())
            .join("_")
        ?? "";
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
