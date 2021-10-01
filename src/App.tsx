import React, {useEffect, useState} from 'react';
import Header from "./components/Header";
import Tab from './components/Tab';
import Info from './components/Info';
import Page from "./components/Page";
import {getNames} from "./api/Users";
import AuthForm from "./components/AuthForm";
import './App.css';


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

export const NamesContext = React.createContext<NamesContextType>({nouns: ["unknown"], adjectives: [""]});

export interface NamesContextType {
    nouns: string[],
    adjectives: string[],
}

function App() {
    const [{authenticated, accessToken, projectId, theme, names}, setState] = useState<{
        authenticated: boolean,
        accessToken: string,
        projectId: string,
        theme: string,
        names: NamesContextType
    }>({
        authenticated: false,
        accessToken: "",
        projectId: "",
        theme: "orange",
        names: {nouns: ["unknown"], adjectives: [""]}
    });
    const toggleTheme = () => {
        setState(prev => ({...prev, theme: theme === "orange" ? "blue" : "orange"}))
    }
    useEffect(() => {
        getNames().then(names => setState(prev => ({...prev, names: names})))
    }, []);

    const authContextProviderValue: AuthContextType = {
        authenticated: authenticated,
        setAuthenticated: authenticated => setState(prevState => ({...prevState, authenticated: authenticated})),
        accessToken: accessToken,
        setAccessToken: accessToken => setState(prevState => ({...prevState, accessToken: accessToken})),
        projectId: projectId,
        setProjectId: projectId => setState(prevState => ({...prevState, projectId: projectId})),
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
                            <NamesContext.Provider value={names}>
                                <Info/>
                                <Tab/>
                            </NamesContext.Provider>
                        )
                    }
                </Page>
            </ThemeContext.Provider>
        </AuthContext.Provider>
    );
}

export default App;
