import Axios, {AxiosRequestConfig} from "axios";

const gitlabInstanceUrl = "https://gitlab.stud.idi.ntnu.no";
const apiVersion = "v4"

export const axiosConfig = (token: string, projectId: string): AxiosRequestConfig => {
    return {
        headers: {
            "PRIVATE-TOKEN": token,
        },
        baseURL: `${gitlabInstanceUrl}/api/${apiVersion}/projects/${encodeURIComponent(projectId)}`
    }
};

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