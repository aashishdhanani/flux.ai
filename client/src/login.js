import axios from 'axios';
import { React, useState } from 'react';
import './styles/login.css';

function Login() {
  
  // This line must be present on every main page so that session information is circulated properly
  axios.defaults.withCredentials = true;

  // Keeps track of the values the user has entered in the Log In fields
  const [loginValues, setLoginValues] = useState({
      username: '',
      password: ''
  });
  // Called when Sign In is pressed
  const handleLoginSubmit = (e) => {
      e.preventDefault();
      axios.post('http://localhost:5001/login', loginValues)
          .then(res => {
              // Server sends back status message, display it
              alert(res.data.message);
              console.log(res);

              // Server sends back a boolean success, indicating if login was successful
              if (res.data.success) {
                  // Redirect to home page
                  window.location.href = "/home"
              }
          })
          .catch(err => console.log(err));
  };

  // Keeps track of the values the user has entered in the Sign Up fields
  const [accountValues, setAccountValues] = useState({
      username: '',
      email: '',
      password: '',
  });


  // Called when Create Account is pressed
  const handleAccountSubmit = async (e) => {
    e.preventDefault(); // Important! Prevents form from default submission
    
    // Log to see what we're sending
    console.log("Sending data:", accountValues);

    try {
        const response = await axios.post('http://localhost:5001/register', {
            username: accountValues.username,
            email: accountValues.email,
            password: accountValues.password
        });
        console.log("Success:", response.data);
    } catch (error) {
        console.error("Error:", error);
    }
};
 

  return (

      <div>
          <h1 >Flux</h1>
          <div>
              <div>
                  <div>
                      <h2>Please Log In</h2>
                  </div>

                  <form className="user-pass" onSubmit={handleLoginSubmit}>
                      <input type="text" className="login-input" placeholder="Username:" 
                          onChange={e => setLoginValues({ ...loginValues, username: e.target.value })}></input>
                      <input type="password" className="login-input" placeholder="Password:" 
                          onChange={e => setLoginValues({ ...loginValues, password: e.target.value })}></input>

                      <div className="login-submit">
                          <input type="submit" className="login-button" value="Sign In"></input>
                      </div>
                  </form>
              </div>
              <h3 className="or-text">or</h3>
              <div className="signup">
                  <div className="subtitle">
                      <h2>Sign Up</h2>
                  </div>

                  <form className="user-pass" onSubmit={handleAccountSubmit}>
                      <input type="text" className="login-input" placeholder="Set Username:" 
                          onChange={e => setAccountValues({ ...accountValues, username: e.target.value })}></input>
                      <input type="text" className="login-input" placeholder="Email:" 
                          onChange={e => setAccountValues({ ...accountValues, email: e.target.value })}></input>
                      <input type="password" className="login-input" placeholder="Set Password:" 
                          onChange={e => setAccountValues({ ...accountValues, password: e.target.value })}></input>
                      <input type="password" className="login-input" placeholder=" Confirm Password:" 
                          onChange={e => setAccountValues({ ...accountValues, passwordConfirm: e.target.value })}></input>

                      <div className="signup-submit">
                          <input type="submit" className="signup-button" value="Create Account"></input>
                      </div>
                  </form>
              </div>
          </div>
      </div>
  );
}

export default Login;
