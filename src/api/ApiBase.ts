import Axios, {AxiosRequestConfig, AxiosResponse} from "axios";

// Define common GitLab repository information, to make api calls work properly
const gitlabInstanceUrl = "https://gitlab.stud.idi.ntnu.no";
const apiVersion = "v4"

/**
 * Function that makes a config that can be used by axios
 * @param token an access token generated in the repository settings
 * @param projectId the id of the repository
 * @param params object
 * @returns an customized axios config
 */
export function axiosConfig(token: string, projectId: string, params: object = {}): AxiosRequestConfig {
    return {
        headers: {
            "PRIVATE-TOKEN": token,
        },
        baseURL: `${gitlabInstanceUrl}/api/${apiVersion}/projects/${encodeURIComponent(projectId)}`,
        params: {
            ...params,
        }
    }
}

/**
 * Function that converts between camel case and snake case
 * @param camelCase a string in camelCase-notation
 * @returns a string in snakeCase-notation
 */
export function toSnakeCase(camelCase: string): string {
    // Replace all sequences beginning with an uppercase letter, with _ followed by that sequence in lowercase.
    return camelCase.match(/^[a-z]+|[A-Z]+[a-z]*/g)
        ?.map(word => word.toLowerCase())
            .join("_")
        ?? "";
}

/**
 * Function that checks if the user is authorized to access a repository,
 * meaning they possess the right combination of accessToken and projectId
 * @param accessToken an access token generated in the repository settings
 * @param projectId the id of the repository
 * @returns data or false, depending on if user is authorized to view project
 */
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

/**
* Function that retrieves all pages in a request
*/
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
