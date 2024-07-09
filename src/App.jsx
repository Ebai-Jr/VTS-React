import React, { useState } from "react";
import "./App.css"
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Historical from "./pages/Historical";
import States from "./pages/States";
import Geolocation from "./pages/Geolocation";
import Team from "./pages/Team";
import Logs from "./pages/Logs";
import Selections from "./pages/Selections";

function App() {
  return (
   <>
   <Router>
      <Navbar />
      <div className="page-content">
    <Routes>
      <Route path="/" Component={Home} />
      <Route path="/historical" Component={Historical} />
      <Route path="/states" Component={States} />
      <Route path="/geolocation" Component={Geolocation} />
      <Route path="/team" Component={Team} />
      <Route path="/logs" Component={Logs} />
      <Route path="/Selections" Component={Selections} />
    </Routes>
    </div>
   </Router>
   </>
  );
}

export default App;
