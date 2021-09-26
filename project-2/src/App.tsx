import React, {useEffect, useState} from 'react';
import Header from "./components/Header";
import Tab from './components/Tab';
import Info from './components/Info';
import {Commit, getCommits} from "./api/Commits";
import {Award, getAwards} from "./api/Awards";

function App() {
  const [{commits, awards}, setState] = useState<{ commits: Commit[], awards: Award[] }>({commits: [], awards: []});
  useEffect(() => {
      getCommits().then(commits => setState(prev => ({...prev, commits: commits})));
      getAwards().then(awards => setState(prev => ({...prev, awards: awards})));
  }, [])
  return (
    <div>
      <Header />
      <Info />
      <Tab />
      <ul>{commits.map(c => <li>{c.title}</li>)}</ul>
      <ul>{awards.map(a => <li>{a.name}</li>)}</ul>
    </div>
  );
}

export default App;
