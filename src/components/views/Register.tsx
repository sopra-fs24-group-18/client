import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import {useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import { ShowButton } from "components/ui/ShowButton";
import "styles/views/Register.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
/*
It is possible to add multiple components inside a single file,
however be sure not to clutter your files with an endless amount!
As a rule of thumb, use one file per component and only add small,
specific components that belong to the main one in the same file.
 */
const FormField = ({
  label,
  type = "text",
  value,
  onChange,
  maskPassword = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleInputChange = (event) => {
    onChange(event.target.value);
  };
  const maskedValue = maskPassword ? value.replace("*") : value;

  return (
    <div className="register field">
      <label className="register label">{label}</label>
      <div className="input-wrapper" style={{ display: "flex", alignItems: "center" }}>
        <input
          className="register input"
          placeholder="enter here.."
          type={showPassword ? "text" : type}
          value={maskedValue}
          onChange={handleInputChange}
          autoComplete="off"
        />
        {type === "password" && maskPassword && (
          <ShowButton className="show-password" onClick={toggleShowPassword}>
          </ShowButton>
        )}
      </div>
    </div>
  );
};
FormField.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  maskPassword: PropTypes.bool,
};

const Register = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  //   password confirm
  const [repeatPassword, setRepeatPassword] = useState("");
  const handleClick = () => {
    if (password === repeatPassword) {
      doRegister();
    } else {
      displayMessage("Passwords don't match.", "error-message");
    }
  };

  const doRegister = async () => {
    try {
      const requestBody = JSON.stringify({ username, password });
      const response = await api.post("/users", requestBody);
      // Get the returned user and update a new object.
      const user = new User(response.data);
      const userId = user.id;

      // Store the token into the local storage.
      localStorage.setItem("token", user.token);
      localStorage.setItem("username", user.username);
      localStorage.setItem("userId", user.id);
      const testId = localStorage.getItem("current_user_id");
      console.log({testId});
      // Login successfully worked --> navigate to the route /game in the GameRouter
      navigate(`/users/${userId}`);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // Username already exists
        displayMessage("Register failed because this username already exists.", "error-message");
      }
      else{
        displayMessage(`Something went wrong during the registration: ${handleError(error)}`, "error-message");
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
        <div className="register container">
          <div className="register form"><br /><br />
            <FormField
              label="Username"
              value={username}
              onChange={(un: string) => setUsername(un)}
            />
            <FormField
              label="Password"
              type="password"
              value={password}
              onChange={(p) => setPassword(p)}
              maskPassword
            />
            <FormField
              label="Repeat Password"
              type="password"
              value={repeatPassword}
              onChange={(rp) => setRepeatPassword(rp)}
              maskPassword
            />

            <div className="register button-container" style={{display: "flex",justifyContent: "space-between"}} >
              {/*<div className="register button-container">*/}
              <Button
                disabled={!username || !password || !repeatPassword}
                width="100%"
                onClick={handleClick}
              >
              Enroll
              </Button>
              {/*</div>*/}
              {/*<div className="register button-container">*/}
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
                {/*<div className={`message-container ${message.type}`}>*/}
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
export default Register;
