import React, { useEffect } from "react";
import "styles/views/Mainpage.scss";
import { useNavigate} from "react-router-dom";

const Mainpage= () => {
  const navigate = useNavigate();
  useEffect(() => { // check whether first time open the app
    if (!sessionStorage.getItem("firstVisit")) {
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
        <h1 className="title">The Price<br/>Is Right</h1>
        <div className="buttons-container">
          <button
              onClick={navigateToRegister}
              className="button">Enroll
          </button>
          <button
              onClick={navigateToLogin}
              className="button">Login
          </button>
        </div>
        <button
            onClick={navigateToInstruction}
            className="Instruction-button"
        >
          <div className="tooltip">Click here to get instructions of the game!</div>
        </button>
      </div>
  );
};

export default Mainpage;

