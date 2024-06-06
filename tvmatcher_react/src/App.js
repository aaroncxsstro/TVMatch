import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './Context/AuthContext';
import Home from './pages/Home/Home';
import Create from './pages/Create/Create';
import { Explore, ExploreProvider } from './pages/Explore/Explore';
import Login from './pages/Login/Login';
import Room from './pages/Room/Room';
import Settings from './pages/Settings/Settings';
import Game from './pages/Game/Game';
import SerieDetail from './pages/SerieDetail/SerieDetail';
import BottomNav from './components/BottomNav/BottomNav';
import Library from './pages/Library/Library';

const App = () => {
  return (
    <GoogleOAuthProvider clientId="414799009091-1mji935if8jl343cdnk64hvv4jd8pro0.apps.googleusercontent.com">
      <AuthProvider>
        <Router>
          <ExploreProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRouteWithBottomNav />}>
                <Route path="home" element={<Home />} />
                <Route path="explore" element={<Explore />} />
                <Route path="settings" element={<Settings />} />
                <Route path="collection" element={<Library />} />
                <Route path="explore/:id" element={<SerieDetail />} />
                <Route path="create" element={<Create />} />
                <Route path="room/*" element={<RoomWithBottomNav />} />
                <Route path="game/*" element={<GameWithBottomNav />} />
              </Route>
              <Route path="room/:id" element={<RoomWithoutBottomNav />} />
              <Route path="game/:id" element={<GameWithoutBottomNav />} />
            </Routes>
          </ExploreProvider>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};


const PrivateRouteWithBottomNav = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div>
      <Outlet />
      <BottomNav />
    </div>
  );
};

const RoomWithBottomNav = () => {
  return (
    <div>
      <Outlet />
      <BottomNav />
    </div>
  );
};

const GameWithBottomNav = () => {
  return (
    <div>
      <Outlet />
      <BottomNav />
    </div>
  );
};

const RoomWithoutBottomNav = () => {
  return <Room />;
};

const GameWithoutBottomNav = () => {
  return <Game />;
};

export default App;
