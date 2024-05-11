import {Navigate, Outlet, withRouter, useHistory, useNavigate} from 'react-router-dom';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

// requirement: 1. during game, user can not return to last page. 2. prevent user
// from refresh/exit the page.
// 2. only a logged-in users who entered an existing room can be guided into the gameroom page

export const GameRoomGuard = ({ children }) => {
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

    // alert when refresh/exit the window
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

  // const navigate = useNavigate();
  //
  // useEffect(() => {
  //   const pushHistory = () => {
  //     const state = {
  //       title: "GameRoom Page",
  //       url: window.location.href
  //     };
  //     window.history.pushState(state, "GameRoom Page", window.location.href);
  //     console.log("url:", window.location.href)
  //   };
  //
  //   window.onload = () => {
  //     pushHistory();
  //   };
  //
  //   window.addEventListener("popstate", () => {
  //     pushHistory();
  //   });
  //
  //   const handleBeforeUnload = (event) => {
  //     event.preventDefault();
  //     event.returnValue = '';
  //   };
  //
  //   window.addEventListener('beforeunload', handleBeforeUnload);
  //
  //   return () => {
  //     window.onload = null;
  //     window.removeEventListener("popstate", pushHistory);
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, [navigate]);

  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  } else if (!localStorage.getItem('roomId')) {
    return <Navigate to="/lobby/:userId" replace />;
  } else {
    return <Outlet />;
  }
};

GameRoomGuard.propTypes = {
  children: PropTypes.node,
};

