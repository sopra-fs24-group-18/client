import React from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {GameGuard} from "../routeProtectors/GameGuard";
import {GameRoomGuard} from "../routeProtectors/GameRoomGuard";
import GameRouter from "./GameRouter";
import {LoginGuard} from "../routeProtectors/LoginGuard";
import Login from "../../views/Login";
import Mainpage from "../../views/Mainpage";
import Register from "../../views/Register";
import Profile from "../../views/Profile";
import Lobby from "../../views/Lobby";
import Shop from "../../views/Shop";
import Roomcreation from "../../views/Roomcreation";
import GameRoom from "../../views/Gameroom";
import Rank from "../../views/Rank"
import WaitingAnswer from "../../views/WaitingAnswer";
import GameRoomBudget from "../../views/GameroomBudget";
import Prepare from "../../views/Prepare";

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

        <Route path="/login" element={<LoginGuard />}>
          <Route path="/login" element={<Login/>} />
        </Route>
        <Route path="/register" element={<LoginGuard />}>
          <Route path="/register" element={<Register/>} />
        </Route>

        <Route path="/roomcreation" element={<GameGuard />}>
          <Route path="/roomcreation" element={<Roomcreation/>} />
        </Route>
        <Route path="/lobby/:userId" element={<GameGuard />}>
          <Route path="/lobby/:userId" element={<Lobby />} />
        </Route>
        <Route path="/users/:userId" element={<GameGuard />}>
          <Route path="/users/:userId" element={<Profile />} />
        </Route>

        <Route path="/prepare" element={<GameRoomGuard />}>
          <Route path="/prepare" element={<Prepare/>} />
        </Route>
        <Route path="/rooms/:roomCode/:userId/guessing" element={<GameRoomGuard />}>
          <Route path="/rooms/:roomCode/:userId/guessing" element={<GameRoom />} />
        </Route>
        <Route path="/rooms/:roomCode/:userId/budget" element={<GameRoomGuard />}>
          <Route path="/rooms/:roomCode/:userId/budget" element={<GameRoomBudget />} />
        </Route>
        <Route path="/waiting-answer/:userAnswer" element={<GameRoomGuard />}>
          <Route path="/waiting-answer/:userAnswer" element={<WaitingAnswer />} />
        </Route>
        <Route path="/shop" element={<GameRoomGuard />}>
          <Route path="/shop" element={<Shop/>} />
        </Route>
        <Route path="/rank" element={<GameRoomGuard />}>
          <Route path="/rank" element={<Rank />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

/*
* Don't forget to export your component!
 */
export default AppRouter;
