import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  function handleLoginSuccess(response) {
    if (response.data.success) {
      // Send message to extension
      window.postMessage({
        type: "FROM_PAGE",
        userData: {
          username: response.data.userData.username,
          token: response.data.userData.token
        }
      }, "http://localhost:3006");
  
      console.log("Sent login data to extension:", response.data);
      navigate('/home');
    } else {
      console.error('Login failed:', response.data.message);
      alert(response.data.message);
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    console.log('Attempting login with:', loginValues);
    
    try {
      const response = await axios.post('http://localhost:3000/login', {
        username: loginValues.username,
        password: loginValues.password
      });

      console.log('Login response:', response);
      handleLoginSuccess(response);
    } catch (error) {
      console.error('Login error:', error);
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
    if (accountValues.goals.length === 0) {
      alert("Please add at least one goal!");
      return;
    }

    if (accountValues.budget.length === 0) {
      alert("Please enter your budget!");
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/register', {
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
      
      console.log("Success:", response.data);
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: "'Segoe UI', 'Roboto', sans-serif"
    },
    title: {
      fontSize: '4.5rem',
      fontWeight: '800',
      background: 'linear-gradient(45deg, #F7DC11, #E4801D)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textAlign: 'center',
      marginBottom: '3rem',
      letterSpacing: '0.15em',
      textShadow: '2px 2px 20px rgba(247, 220, 17, 0.3)',
      transform: 'perspective(500px) translateZ(0)',
      transition: 'transform 0.3s ease'
    },
    formContainer: {
      display: 'flex',
      gap: '3rem',
      maxWidth: '15000px',
      width: '100%',
      flexWrap: 'wrap',
      justifyContent: 'center',
      perspective: '1000px'
    },
    formSection: {
      flex: '1 1 400px',
      background: 'linear-gradient(145deg, rgba(20, 20, 20, 0.9), rgba(30, 30, 30, 0.8))',
      backdropFilter: 'blur(20px)',
      padding: '2.5rem',
      borderRadius: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      margin: '1rem',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transform: 'translateZ(0)'
    },
    loginSection: {
      borderLeft: '3px solid #B50D13'
    },
    signupSection: {
      borderLeft: '3px solid #2D9CCE'
    },
    sectionTitle: {
      fontSize: '1.8rem',
      fontWeight: '600',
      color: '#F7DC11',
      textAlign: 'left',
      marginBottom: '2rem',
      letterSpacing: '0.05em'
    },
    inputGroup: {
      position: 'relative',
      marginBottom: '1.5rem',
      justifyContent: 'center',
      alignItems: 'center'
    },
    input: {
      width: '90%',
      padding: '1rem 1.2rem',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      color: '#fff',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.3s ease',
      letterSpacing: '0.03em',
      textAlign: 'center'
    },
    button: {
      width: '100%',
      padding: '1rem',
      border: 'none',
      borderRadius: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '1rem',
      letterSpacing: '0.05em',
      marginTop: '2rem',
      position: 'relative',
      overflow: 'hidden'
    },
    loginButton: {
      background: 'linear-gradient(45deg, #B50D13, #D85116)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(181, 13, 19, 0.3)'
    },
    signupButton: {
      background: 'linear-gradient(45deg, #2D9CCE, #E4801D)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(45, 156, 206, 0.3)'
    },
    goalInput: {
      width: '70%',
      padding: '1rem 1.2rem',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      color: '#fff',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.3s ease',
      letterSpacing: '0.03em',
      textAlign: 'center'
    },
    addGoalButton: {
      width: '20%',
      padding: '1rem',
      marginLeft: '10px',
      border: 'none',
      borderRadius: '12px',
      background: 'linear-gradient(45deg, #F7DC11, #E4801D)',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    goalsList: {
      marginTop: '1rem',
      width: '90%',
      margin: '0 auto'
    },
    goalItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.5rem 1rem',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '8px',
      marginBottom: '0.5rem',
      color: '#fff'
    },
    removeGoalButton: {
      background: 'none',
      border: 'none',
      color: '#ff4444',
      cursor: 'pointer',
      fontSize: '1.2rem',
      padding: '0 0.5rem'
    }
  };

  const handleSectionHover = (e, enter) => {
    if (enter) {
      e.currentTarget.style.transform = 'translateZ(20px)';
      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
    } else {
      e.currentTarget.style.transform = 'translateZ(0)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
    }
  };

  const handleInputFocus = (e, focus) => {
    if (focus) {
      e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
      e.target.style.borderColor = '#F7DC11';
      e.target.style.boxShadow = '0 0 15px rgba(247, 220, 17, 0.1)';
    } else {
      e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      e.target.style.boxShadow = 'none';
    }
  };

  const handleButtonHover = (e, enter) => {
    if (enter) {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 6px 20px rgba(247, 220, 17, 0.2)';
    } else {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 4px 15px rgba(181, 13, 19, 0.3)';
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>FLUX</h1>
      
      <div style={styles.formContainer}>
        {/* Login Section */}
        <div 
          style={{...styles.formSection, ...styles.loginSection}}
          onMouseEnter={(e) => handleSectionHover(e, true)}
          onMouseLeave={(e) => handleSectionHover(e, false)}
        >
          <h2 style={styles.sectionTitle}>Already have an account? Login Here!</h2>
          <form onSubmit={handleLoginSubmit}>
            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="Username"
                onChange={e => setLoginValues({ ...loginValues, username: e.target.value })}
                style={styles.input}
                onFocus={(e) => handleInputFocus(e, true)}
                onBlur={(e) => handleInputFocus(e, false)}
              />
            </div>
            <div style={styles.inputGroup}>
              <input
                type="password"
                placeholder="Password"
                onChange={e => setLoginValues({ ...loginValues, password: e.target.value })}
                style={styles.input}
                onFocus={(e) => handleInputFocus(e, true)}
                onBlur={(e) => handleInputFocus(e, false)}
              />
            </div>
            <button
              type="submit"
              style={{...styles.button, ...styles.loginButton}}
              onMouseEnter={(e) => handleButtonHover(e, true)}
              onMouseLeave={(e) => handleButtonHover(e, false)}
            >
              Login
            </button>
          </form>
        </div>

        {/* Sign Up Section */}
        <div 
          style={{...styles.formSection, ...styles.signupSection}}
          onMouseEnter={(e) => handleSectionHover(e, true)}
          onMouseLeave={(e) => handleSectionHover(e, false)}
        >
          <h2 style={styles.sectionTitle}>New to Flux? Sign up Here!</h2>
          <form onSubmit={handleAccountSubmit}>
            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="Username"
                name="username"
                value={accountValues.username}
                onChange={handleInputChange}
                style={styles.input}
                onFocus={(e) => handleInputFocus(e, true)}
                onBlur={(e) => handleInputFocus(e, false)}
              />
              <input
                type="text"
                placeholder="Email"
                name="email"
                value={accountValues.email}
                onChange={handleInputChange}
                style={styles.input}
                onFocus={(e) => handleInputFocus(e, true)}
                onBlur={(e) => handleInputFocus(e, false)}
              />
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={accountValues.password}
                onChange={handleInputChange}
                style={styles.input}
                onFocus={(e) => handleInputFocus(e, true)}
                onBlur={(e) => handleInputFocus(e, false)}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                name="passwordConfirm"
                value={accountValues.passwordConfirm}
                onChange={handleInputChange}
                style={styles.input}
                onFocus={(e) => handleInputFocus(e, true)}
                onBlur={(e) => handleInputFocus(e, false)}
              />
            </div>
            {/* Goals Section */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <input
                type="text"
                name="currentGoal"
                placeholder="Add a goal"
                value={accountValues.currentGoal}
                onChange={handleInputChange}
                style={styles.goalInput}
                onFocus={(e) => handleInputFocus(e, true)}
                onBlur={(e) => handleInputFocus(e, false)}
              />
              <button
                type="button"
                onClick={handleAddGoal}
                style={styles.addGoalButton}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
              >
                Add
              </button>
              </div>

              <div style={styles.goalsList}>
                {accountValues.goals.map((goal, index) => (
                  <div key={index} style={styles.goalItem}>
                    <span>{goal}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(index)}
                      style={styles.removeGoalButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div style={styles.inputGroup}>
                <input
                  type='Number'
                  name="budget"
                  placeholder="budget"
                  value={accountValues.budget}
                  onChange={handleInputChange}
                  style={styles.input}
                  onFocus={(e) => handleInputFocus(e, true)}
                  onBlur={(e) => handleInputFocus(e, false)}
                />
              </div>
        
            <button
              type="submit"
              style={{...styles.button, ...styles.signupButton}}
              onMouseEnter={(e) => handleButtonHover(e, true)}
              onMouseLeave={(e) => handleButtonHover(e, false)}
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;