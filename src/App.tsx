import React from 'react';
import logo from './logo.svg';
import './App.css';
import MenuAppBar from './components/MenuAppBar';
import NamedItemTable from './components/NamedItemTable';

function App() {
    return (
        <div className="App">
            <MenuAppBar />
            <NamedItemTable
                title={"Achsfolg"}
                url={"http://127.0.0.1:8086/ModellBahn/api"}
                path={"/achsfolg"}
                />
        </div>
    );
}

export default App;
