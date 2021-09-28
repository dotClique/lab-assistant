import React, {useEffect, useState} from 'react';
import Header from "./components/Header";
import Tab from './components/Tab';
import Info from './components/Info';
import Page from "./components/Page";
import {getNames} from "./api/Users";

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
    const [{theme, names}, setState] = useState<{ theme: string, names: NamesContextType }>({
        theme: "orange",
        names: {nouns: ["unknown"], adjectives: [""]}
    });
    const toggleTheme = () => {
        setState(prev => ({...prev, theme: theme === "orange" ? "blue" : "orange"}))
    }
    useEffect(() => {
        getNames().then(names => setState(prev => ({...prev, names: names})))
    }, []);

    return (
        <ThemeContext.Provider value={{theme: theme, toggleTheme: toggleTheme}}>
            <NamesContext.Provider value={names}>
                <Page>
                    <Header/>
                    <Info/>
                    <Tab/>
                </Page>
            </NamesContext.Provider>
        </ThemeContext.Provider>
    );
}

export default App;
