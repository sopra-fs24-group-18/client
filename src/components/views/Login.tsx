import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Login.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
//import Profile from "./Profile";
/*
It is possible to add multiple components inside a single file,
however be sure not to clutter your files with an endless amount!
As a rule of thumb, use one file per component and only add small,
specific components that belong to the main one in the same file.
 */
const FormField = (props) => {
  return (
    <div className="login field">
      <label className="login login-label">{props.label}</label>
      <input
        className="login input"
        placeholder="enter here.."
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        type={props.type} // Set the input type dynamically
      />
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  type: PropTypes.string, // Add a prop for input type
};

const Login = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState(""); // name --> password(string)
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  const doLogin = async () => {
    try {
      const requestBody = JSON.stringify({ username, password }); // name --> password
      const response = await api.post("/login", requestBody);
      // Get the returned user and update a new object.
      const user = new User(response.data);
      // Store the userid into the local storage.
      localStorage.setItem("userId", user.id)
      localStorage.setItem("token", user.token)
      console.log("id,", user.id)
      console.log("token", user.token)
      const userId = user.id;
      // Login successfully worked --> navigate to the profile page in the AppRouter
      navigate(`/lobby/${userId}`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Unauthorized: Incorrect password
        displayMessage("Login failed because password is wrong.", "error-message");
      }
      else if(error.response && error.response.status === 404){
        // Unauthorized: Incorrect username
        displayMessage("Login failed because username does not exist.", "error-message");
      }
      else{
        displayMessage(`Something went wrong during the login: ${handleError(error)}`, "error-message");
      }
    }
  };

  const displayMessage = (messageText, messageType) => {
    setMessage({ text: messageText, type: messageType });
    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 5000); // Hide message after 5 seconds
  };

  return (
    <div className="background-container">
      <BaseContainer>
        <div className="login container">
          <div className="login form"><br /><br />
            <FormField
              label="Username"
              value={username}
              onChange={(un: string) => setUsername(un)}
            />
            <FormField
              label="Password"
              value={password}
              onChange={(n) => setPassword(n)}
              type="password" // Set input type to "password"
            />
            <div className="login button-container">
              <Button
                disabled={!username || !password}
                width="100%"
                onClick={() => doLogin()}
              >
                Login
              </Button>
            </div>
            <div className="login button-container">
              <Button
                width="100%"
                onClick={() => navigate("/")}
              >
                Exit
              </Button>
            </div>
            {/* Display message */}
            {message.text && (
              <div style={{ fontSize: "16px", fontFamily: "\"Microsoft YaHei\", sans-serif" }}>
                {message.text}
              </div>
            )}
          </div>
        </div>
      </BaseContainer>
    </div>
  );
};

/**
 * You can get access to the history object's properties via the useLocation, useNavigate, useParams, ... hooks.
 */
export default Login;
