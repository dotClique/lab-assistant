import React, {useState} from 'react';
import Header from "./components/Header";
import Tab from './components/Tab';
import Info from './components/Info';
import Page from "./components/Page";
import {getNames} from "./api/Users";

export const ThemeContext = React.createContext<{theme: string, toggleTheme: () => void}>({
    theme: "orange",
    toggleTheme: () => {}
})

export const NamesContext = React.createContext<Promise<NamesContextType>>(
    new Promise(
        r => r({
            nouns: [],
            adjectives: [],
        })
    )
);

export interface NamesContextType {
    nouns: string[],
    adjectives: string[],
}

function App() {
  const [theme, setTheme] = useState("orange")
  const toggleTheme = () => {
      setTheme(theme === "orange" ? "blue" : "orange")
  }
  return (
    <ThemeContext.Provider value={{theme: theme, toggleTheme: toggleTheme}}>
        <NamesContext.Provider value={getNames()}>
            <Page>
                <Header />
                <Info />
                <Tab />
            </Page>
        </NamesContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;
