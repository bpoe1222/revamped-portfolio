import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Nav from './components/navbar/navbar'
import Page from './components/pagenotfound/pagenotfound';
import Resume from './Resume';
import Contact from './Contact';
import Blog from './Blog';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Nav />
      <Routes>
        <Route exact path="/" element={<App />}></Route>
        <Route exact path="*" element={<Page />}></Route>
        <Route exact path="/resume" element={<Resume />}></Route>
        <Route exact path='/contact' element={<Contact />}></Route>
        <Route exact path='/blog' element={<Blog />}></Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
