import React from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {GameGuard} from "../routeProtectors/GameGuard";
import GameRouter from "./GameRouter";
import {LoginGuard} from "../routeProtectors/LoginGuard";
import Login from "../../views/Login";
import Mainpage from '../../views/Mainpage';
import Register from '../../views/Register';
import Profile from "../../views/Profile";
import Shop from '../../views/Shop';
import Gameroom_point from '../../views/Gameroom_point';
import Roomcreation from '../../views/Roomcreation';
import GameRoom from "../../views/Gameroom";
import Tool from "../../views/Tool"

/**
 * Main router of your application.
 * In the following class, different routes are rendered. In our case, there is a Login Route with matches the path "/login"
 * and another Router that matches the route "/game".
 * The main difference between these two routes is the following:
 * /login renders another component without any sub-route
 * /game renders a Router that contains other sub-routes that render in turn other react components
 * Documentation about routing in React: https://reactrouter.com/en/main/start/tutorial 
 */

//const GameRoomPage = () => {
//  return (
//    <div>
//      <PointDisplay />
//      <GameRoom />
//      <ToolDisplay />
//    </div>
//  );
//};


const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* this is for firstly open the mainpage */}
        <Route path="/" element={<Mainpage />} />

        <Route path="/game/*" element={<GameGuard />}>
          <Route path="/game/*" element={<GameRouter base="/game"/>} />
        </Route>

        <Route path="/login" element={<LoginGuard />}>
          <Route path="/login" element={<Login/>} />
        </Route>

        <Route path="/register" element={<Register/>} />
        <Route path="/users/:userId/shop" element={<Shop/>} />
        <Route path="/roomcreation" element={<Roomcreation/>} />
        <Route path="/users/:userId" element={<Profile />} />
        <Route path="/gameroom" element={<GameRoom />} />

      </Routes>
    </BrowserRouter>
  );
};

/*
* Don't forget to export your component!
 */
export default AppRouter;
