// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/index.css';
import Login from './login';
import Home from './home';  // Create this file
import reportWebVitals from './reportWebVitals';

import Categories from './recpages/categories';
import Patterns from './recpages/patterns';
import Spending from './recpages/spending';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/spending" element={<Spending />} />
        <Route path="/patterns" element={<Patterns />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();