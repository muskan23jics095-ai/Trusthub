import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddListingPage from "./pages/AddListingPage";
import EditListingPage from "./pages/EditListingPage";
import ViewListings from "./pages/ViewListings";
import CustomerDashboard from "./pages/CustomerDashboard";
import MyAssetsPage from "./pages/MyAssetsPage";
import SellerRequestsPage from "./pages/SellerRequestsPage";

import "./App.css";

function App() {
  // Get user from localStorage or initialize null
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Seller Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/my-assets"
            element={<MyAssetsPage userId={user ? user._id : null} />}
          />
          <Route
            path="/seller-requests"
            element={<SellerRequestsPage userId={user ? user._id : null} />}
          />
          <Route path="/add-listing" element={<AddListingPage />} />
          <Route path="/edit-listing/:id" element={<EditListingPage />} />
          <Route path="/view-listings" element={<ViewListings />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
