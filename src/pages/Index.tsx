
import React from "react";
import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Dashboard from "./Dashboard";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Crop Compass - Your Farming Assistant</title>
        <meta name="description" content="A digital assistant to help farmers achieve their best yield" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-white to-agrifirm-light-yellow-2/30">
        <Navbar />
        <main>
          <Dashboard />
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default Index;
