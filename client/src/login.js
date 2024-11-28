import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./styles/Login.css"
// API configuration
const API_BASE_URL = 'http://localhost:3000/api/users';

// Components
const LoginForm = ({ onSubmit, setValues, values }) => (
  <form onSubmit={onSubmit}>
    <div className="input-group">
      <input
        type="text"
        placeholder="Username"
        onChange={e => setValues({ ...values, username: e.target.value })}
        className="form-input"
      />
    </div>
    <div className="input-group">
      <input
        type="password"
        placeholder="Password"
        onChange={e => setValues({ ...values, password: e.target.value })}
        className="form-input"
      />
    </div>
    <button type="submit" className="submit-button login-button">
      Login
    </button>
  </form>
);

const GoalInput = ({ currentGoal, onInputChange, onAddGoal }) => (
  <div className="goal-input-container">
    <input
      type="text"
      name="currentGoal"
      placeholder="Add a goal"
      value={currentGoal}
      onChange={onInputChange}
      className="goal-input"
    />
    <button type="button" onClick={onAddGoal} className="add-goal-button">
      Add
    </button>
  </div>
);

const GoalList = ({ goals, onRemoveGoal }) => (
  <div className="goals-list">
    {goals.map((goal, index) => (
      <div key={index} className="goal-item">
        <span>{goal}</span>
        <button
          type="button"
          onClick={() => onRemoveGoal(index)}
          className="remove-goal-button"
        >
          ×
        </button>
      </div>
    ))}
  </div>
);

const RegisterForm = ({ onSubmit, values, onInputChange, onAddGoal, onRemoveGoal }) => (
  <form onSubmit={onSubmit}>
    <div className="input-group">
      <input
        type="text"
        placeholder="Username"
        name="username"
        value={values.username}
        onChange={onInputChange}
        className="form-input"
      />
      <input
        type="text"
        placeholder="Email"
        name="email"
        value={values.email}
        onChange={onInputChange}
        className="form-input"
      />
      <input
        type="password"
        placeholder="Password"
        name="password"
        value={values.password}
        onChange={onInputChange}
        className="form-input"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        name="passwordConfirm"
        value={values.passwordConfirm}
        onChange={onInputChange}
        className="form-input"
      />
    </div>
    
    <GoalInput
      currentGoal={values.currentGoal}
      onInputChange={onInputChange}
      onAddGoal={onAddGoal}
    />
    
    <GoalList goals={values.goals} onRemoveGoal={onRemoveGoal} />
    
    <div className="input-group">
      <input
        type="number"
        name="budget"
        placeholder="Budget"
        value={values.budget}
        onChange={onInputChange}
        className="form-input"
      />
    </div>

    <button type="submit" className="submit-button signup-button">
      Sign Up
    </button>
  </form>
);

const Login = () => {
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  const [loginValues, setLoginValues] = useState({
    username: '',
    password: ''
  });

  const [accountValues, setAccountValues] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    goals: [],
    currentGoal: '',
    budget: ''
  });

  const handleLoginSuccess = (response) => {
    if (response.data.success) {
      window.postMessage({
        type: "FROM_PAGE",
        userData: {
          username: response.data.userData.username,
          token: response.data.userData.token
        }
      }, "http://localhost:3006");
      
      navigate('/home');
    } else {
      alert(response.data.message);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, loginValues);
      handleLoginSuccess(response);
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAccountValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (accountValues.currentGoal.trim()) {
      setAccountValues(prev => ({
        ...prev,
        goals: [...prev.goals, prev.currentGoal.trim()],
        currentGoal: ''
      }));
    }
  };

  const handleRemoveGoal = (index) => {
    setAccountValues(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    
    if (!accountValues.goals.length) {
      alert("Please add at least one goal!");
      return;
    }

    if (!accountValues.budget) {
      alert("Please enter your budget!");
      return;
    }

    if (accountValues.password !== accountValues.passwordConfirm) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        username: accountValues.username,
        email: accountValues.email,
        password: accountValues.password,
        goals: accountValues.goals,
        budget: accountValues.budget
      });
      
      alert(response.data.message);
      setAccountValues({
        username: '',
        email: '',
        password: '',
        passwordConfirm: '',
        goals: [],
        currentGoal: '',
        budget: ''
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container">
      <h1 className="title">FLUX</h1>
      
      <div className="form-container">
        <div className="form-section login-section">
          <h2 className="section-title">Already have an account? Login Here!</h2>
          <LoginForm 
            onSubmit={handleLoginSubmit}
            setValues={setLoginValues}
            values={loginValues}
          />
        </div>

        <div className="form-section signup-section">
          <h2 className="section-title">New to Flux? Sign up Here!</h2>
          <RegisterForm 
            onSubmit={handleAccountSubmit}
            values={accountValues}
            onInputChange={handleInputChange}
            onAddGoal={handleAddGoal}
            onRemoveGoal={handleRemoveGoal}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;