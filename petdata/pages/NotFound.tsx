import React from "react";
import { Link } from "react-router-dom";
import NotFoundComponent from "../components/NotFound";

const NotFound: React.FC = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <NotFoundComponent />
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link to="/">Go back to Home</Link>
    </div>
  );
};

export default NotFound;
