import {Navigate, Outlet, withRouter, useHistory, useNavigate} from 'react-router-dom';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

export const RegisterGuard = ({children }) => {
    // after register the user can not return into the previous pages
    const navigate = useNavigate();

    useEffect(() => {
        const handlePopstate = () => {
            // use navigate() to redirect users to the current path
            navigate(window.location.pathname);
        };
        console.log("current path:", window.location.pathname)

        // add a new path into history record
        window.history.replaceState(null, null, window.location.href);
        console.log("manually add path",window.location.href)

        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };

        // add a listener to monitor the change of the pages
        window.addEventListener('popstate', handlePopstate);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            // remove the listener
            window.removeEventListener('popstate', handlePopstate);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [navigate]);

  if (!localStorage.getItem("token")) {

    return <Outlet />;
  }

  return <Navigate to='/lobby/${userId}' replace />;
};

RegisterGuard.propTypes = {
    children: PropTypes.node,
};

export default RegisterGuard;
