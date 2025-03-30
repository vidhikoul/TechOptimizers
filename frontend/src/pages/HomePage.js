import React from "react";
import { Header } from "../components/Header";
import Home from "./page";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div>
      <Header />
      <main className="main-content">
        <Home />
      </main>
    </div>
  );
}
