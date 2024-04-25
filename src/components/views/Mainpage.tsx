import React from "react";
import "styles/views/Mainpage.scss";
import { useNavigate} from "react-router-dom";

const Mainpage= () => {
  const navigate = useNavigate();
  const navigateToLogin = () => {
    navigate("/login");
  };
  const navigateToRegister = ()=> {
    navigate("/register");
  };

  return (
    <div className="main-page">
      <h1 className="title">The Price<br />Is Right</h1>
      <div className="buttons-container">
        <button
          onClick={navigateToRegister}
          className="button">Enroll</button>
        <button
          onClick={navigateToLogin}
          className="button">Login</button>
      </div>
      <button className="settings-button"></button>
    </div>
  );
};

export default Mainpage;

