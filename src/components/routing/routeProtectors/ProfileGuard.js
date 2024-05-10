import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// check if the constrictions in the pages could work
export const ProfileGuard = ({ children }) => {
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

        // add a listener to monitor the change of the pages
        window.addEventListener('popstate', handlePopstate);

        return () => {
            // remove the listener
            window.removeEventListener('popstate', handlePopstate);
        };
    }, [navigate]);


    if (!localStorage.getItem('token')) {
        return <Navigate to="/login" replace />;
    } else {
        return (
                <Outlet />
        );
    }
};

ProfileGuard.propTypes = {
    children: PropTypes.node,
};

