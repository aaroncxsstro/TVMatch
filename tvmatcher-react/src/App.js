import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import Create from './pages/Create/Create';
import { Explore, ExploreProvider } from './pages/Explore/Explore';
import Search from './pages/Search';
import Settings from './pages/Settings';
import Room from './pages/Room/Room';
import SerieDetail from './pages/SerieDetail/SerieDetail'; 
import BottomNav from './components/BottomNav/BottomNav';

const App = () => {
  return (
    <Router>
      <ExploreProvider>
        <div>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/:id" element={<SerieDetail />} /> 
            <Route path="/create" element={<Create />} />
            <Route path="/room/:id" element={<Room />} />
          </Routes>
        </div>
      </ExploreProvider>
      <div>
        <BottomNav />
      </div>
    </Router>
  );
};

export default App;