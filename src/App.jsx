import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/SignUp';
import Home from '../pages/Home';
import LandingPage from '../pages/LandingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage/>}/>
         <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path='/spin2win' element={<Home/>}/>
      </Routes>
    </Router>
  );
}

export default App;
