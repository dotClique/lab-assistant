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


export const AuthContext = React.createContext({
    authenticated: false,
    setAuthenticated: (authenticated: boolean) => {
    },
    accessToken: "",
    setAccessToken: (accessToken: string) => {
    },
    projectId: "",
    setProjectId: (projectId: string) => {
    }
})

export interface AuthContextType {
    authenticated: boolean,
    setAuthenticated: (authenticated: boolean) => void,
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

    const [{authenticated, accessToken, projectId, theme, assets}, setState] = useState<{
        authenticated: boolean,
        accessToken: string,
        projectId: string,
        theme: string,
        assets: AssetsContextType,
    }>({
        authenticated: sessionHasCredentials(),
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

    const authContextProviderValue: AuthContextType = {
        authenticated: authenticated,
        setAuthenticated: authenticated => {
            setState(prevState => ({...prevState, authenticated: authenticated}));
            if (!authenticated) {
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
                    {!authenticated ?
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
