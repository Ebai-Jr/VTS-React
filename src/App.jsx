import React, { useState } from "react";
import "./App.css"
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Historical from "./pages/Historical";
import States from "./pages/States";
import Geolocation from "./pages/Geolocation";

function App() {
  return (
   <>
   <Router>
      <Navbar />
    <Routes>
      <Route path="/" Component={Home} />
      <Route path="/historical" Component={Historical} />
      <Route path="/states" Component={States} />
      <Route path="/geolocation" Component={Geolocation} />
    </Routes>
   </Router>
   </>
  );
}

export default App;
