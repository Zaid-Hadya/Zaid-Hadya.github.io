import React, { useState } from "react";
import './Navbar.css';

function Navbar(){
return (
    <nav className="navbar">
        <div className="navbar-left">
            <a link="/" className="logo">
            zhadya
            </a>
        </div>
        <div className="nav-links">
            <ul >
                 <li><a href="/about">ABOUT</a></li>
                 <li><a href="/experience">EXPERIENCE</a></li>
                <li><a href="/skills">SKILLS</a></li>
                <li><a href="/education">EDUCATION</a></li>
                <li><a href="/projects">PROJECTS</a></li>
                <li><a href="/contact">CONTACT</a></li>
            </ul>
        </div>




    </nav>

);
}

export default Navbar;