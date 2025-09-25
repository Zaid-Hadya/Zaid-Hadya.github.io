import React, { useState } from "react";

function Navbar(){
return (
    <nav className="navbar">
        <div className="navbar-left">
            <a link="/" className="logo">
            Home
            </a>
        </div>
        <div className="navbar-middle">
            <ul className="nav-links">
                <a href="/about">ABOUT</a>
                <a href="/about">EXPERIENCE</a>
                <a href="/about">SKILLS</a>
                <a href="/projects">EDUCATION</a>
                <a href="/projects">PROJECTS</a>
                <a href="/contact">CONTACT</a>
            </ul>
        </div>




    </nav>

);
}

export default Navbar;