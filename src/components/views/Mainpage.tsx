import React, { useEffect } from "react";
import "styles/views/Mainpage.scss";
import { useNavigate} from "react-router-dom";

const Mainpage= () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Check if it's the user's first visit
    if (!sessionStorage.getItem("firstVisit")) {
      // Set 'firstVisit' in sessionStorage and redirect to instruction page after 1 second
      sessionStorage.setItem("firstVisit", "true");
      const timer = setTimeout(() => {
        navigate("/instruction");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [navigate]);

  const navigateToLogin = () => {
    navigate("/login");
  };
  const navigateToRegister = ()=> {
    navigate("/register");
  };
  const navigateToInstruction = ()=> {
    navigate("/instruction");
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
      <button
        onClick={navigateToInstruction}
        className="Instruction-button"
      ></button>
    </div>
  );
};

export default Mainpage;

