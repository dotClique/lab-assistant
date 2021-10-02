const THEME = "theme";

export const getLocalTheme = (): string | null => localStorage.getItem(THEME);

export const setLocalTheme = (theme: string) => localStorage.setItem(THEME, theme);

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