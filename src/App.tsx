import React, {useEffect, useState} from 'react';
import Header from "./components/Header";
import Tab from './components/Tab';
import Info from './components/Info';
import Page from "./components/Page";
import {getNames} from "./api/Users";
import {getEmoji} from "./api/Awards";
import './App.css';
import AuthForm from "./components/AuthForm";
import {
    getLocalTheme,
    setLocalTheme,
    clearSessionCredentials,
    getSessionAccessToken,
    getSessionProjectId,
    sessionHasCredentials,
    setSessionAccessToken,
    setSessionProjectId
} from "./webstorage/WebStorage";
import {isAuthorized} from "./api/ApiBase";


export const AuthContext = React.createContext({
    authorized: false,
    setAuthorized: (authorized: boolean) => {
    },
    accessToken: "",
    setAccessToken: (accessToken: string) => {
    },
    projectId: "",
    setProjectId: (projectId: string) => {
    }
})

export interface AuthContextType {
    authorized: boolean,
    setAuthorized: (authorized: boolean) => void,
    accessToken: string,
    setAccessToken: (accessToken: string) => void,
    projectId: string,
    setProjectId: (projectId: string) => void
}

export const ThemeContext = React.createContext<{ theme: string, toggleTheme: () => void }>({
    theme: "orange",
    toggleTheme: () => {
    }
})

export interface AssetsContextType {
    names: {
        nouns: string[],
        adjectives: string[],
    },
    emoji: {
        [name: string]: string,
    }
}

export const AssetsContext = React.createContext<AssetsContextType>({
    names: {nouns: ["unknown"], adjectives: [""]},
    emoji: {}
});

function App() {
    const localTheme = getLocalTheme();

    const sessionProjectId = getSessionProjectId();
    const sessionAccessToken = getSessionAccessToken();

    if (sessionAccessToken === "" || sessionProjectId === "") {
        // Empty access token and project id will be accepted in requests, so deny it here
        clearSessionCredentials()
    }

    const [{authorized, accessToken, projectId, theme, assets}, setState] = useState<{
        authorized: boolean,
        accessToken: string,
        projectId: string,
        theme: string,
        assets: AssetsContextType,
    }>({
        authorized: sessionHasCredentials(),
        accessToken: sessionAccessToken != null ? sessionAccessToken : "",
        projectId: sessionProjectId != null ? sessionProjectId : "",
        theme: localTheme ?? "orange",
        assets: {
            names: {
                nouns: ["unknown"], adjectives: [""]
            },
            emoji: {},
        }
    });
    const toggleTheme = () => {
        const newTheme = theme === "orange" ? "blue" : "orange";
        setState(prev => ({...prev, theme: newTheme}))
        setLocalTheme(newTheme);
    }

    useEffect(() => {
        getNames().then(names => setState(prev => ({...prev, assets: {...prev.assets, names: names}})))
        getEmoji().then(emoji => setState(prev => ({...prev, assets: {...prev.assets, emoji: emoji}})))
    }, []);

    /**
     * Verify API credentials, and redirect to auth form in case they are invalid
     */
    useEffect(() => {
        if (accessToken === "" || projectId === "") {
            // Credentials not set, no need to verify them
            return
        }
        isAuthorized(accessToken, projectId).then(authorized => {
            setState(prev => ({...prev, authorized: authorized}));
            if (!authorized) {
                clearSessionCredentials()
            }
        })
    }, [accessToken, projectId])

    const authContextProviderValue: AuthContextType = {
        authorized: authorized,
        setAuthorized: authorized => {
            setState(prevState => ({...prevState, authorized: authorized}));
            if (!authorized) {
                clearSessionCredentials()
            }
        },
        accessToken: accessToken,
        setAccessToken: accessToken => {
            setState(prevState => ({...prevState, accessToken: accessToken}))
            setSessionAccessToken(accessToken)
        },
        projectId: projectId,
        setProjectId: projectId => {
            setState(prevState => ({...prevState, projectId: projectId}))
            setSessionProjectId(projectId)
        },
    }

    return (
        <AuthContext.Provider value={authContextProviderValue}>
            <ThemeContext.Provider value={{theme: theme, toggleTheme: toggleTheme}}>
                <Page>
                    <Header/>
                    {!authorized ?
                        (
                            <div className={"authFormContainer"}>
                                <div className={"auth-form"}>
                                    <AuthForm/>
                                </div>
                            </div>
                        ) : (
                            <AssetsContext.Provider value={assets}>
                                <Info/>
                                <Tab/>
                            </AssetsContext.Provider>
                        )
                    }
                </Page>
            </ThemeContext.Provider>
        </AuthContext.Provider>
    );
}

export default App;
