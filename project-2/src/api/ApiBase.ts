import {AxiosRequestConfig} from "axios";

const gitlabInstanceUrl = "https://gitlab.stud.idi.ntnu.no";
const apiVersion = "v4"
const proxyUrl = "http://localhost:3123";
const projectId = encodeURIComponent("it2810-h21/team-25/project-2");

export const axiosConfig: AxiosRequestConfig = {
    headers: {
        "PRIVATE-TOKEN": "ZTziure4DK-wh_Z8Fmwq",
    },
    baseURL: `${proxyUrl}/${gitlabInstanceUrl}/api/${apiVersion}/projects/${projectId}`,
};