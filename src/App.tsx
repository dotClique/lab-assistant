import React, {useState} from 'react';
import Header from "./components/Header";
import Tab from './components/Tab';
import Info from './components/Info';
import Page from "./components/Page";

export const ThemeContext = React.createContext({
    theme: "orange",
    toggleTheme: () => {}
})

function App() {
  const [theme, setTheme] = useState("orange")
  const toggleTheme = () => {
      setTheme(theme === "orange" ? "blue" : "orange")
  }
  return (
    <ThemeContext.Provider value={{theme: theme, toggleTheme: toggleTheme}}>
        <Page>
            <Header />
            <Info />
            <Tab />
        </Page>
    </ThemeContext.Provider>
  );
}

export default App;
