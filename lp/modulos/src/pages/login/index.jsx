import React from "react";
import Navbar from "./components/navbar-01";
import Footer from "./components/footer-01";
import LoginForm from "./components/login-form";

const LoginPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <LoginForm />
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
