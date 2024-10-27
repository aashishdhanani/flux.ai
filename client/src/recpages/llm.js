import React, { useState, useEffect, useRef } from "react";
import icon from '../images/icon.png'
import axios from "axios"; // Install axios if you haven't: npm install axios

const sidebarWidth = "700px";
const yellow = "#F7DC11"; // Replace with actual yellow color
const blue = "#30308c"; // Replace with actual blue color

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [calledAI, setCalledAI] = useState(false)
  const [text, setText] = useState("");
  const [displayedText, setDisplayedText] = useState("");

  const indexRef = useRef(0); // Keep track of the index without causing re-renders
  const textRef = useRef(""); // Store displayedText without causing re-renders

  useEffect(() => {
    // Reset displayed text when a new text prop is received
    setDisplayedText("");
    textRef.current = "";
    indexRef.current = 0;

    const typeCharacter = () => {
      if (indexRef.current < text.length) {
        // Append the next character to the current text
        textRef.current += text[indexRef.current];
        setDisplayedText(textRef.current); // Update the displayed text
        indexRef.current += 1; // Move to the next character
        setTimeout(typeCharacter, 35); // Adjust typing speed here
      }
    };

    if (text) {
      typeCharacter(); // Start typing effect
    }

    // Clean up on component unmount
    return () => {
      indexRef.current = text.length; // Stop typing if component unmounts
    };
  }, [text]);
  

  useEffect(() => {
    if (isExpanded) {
      if (!calledAI) {
        setCalledAI(true)
        axios.get("http://localhost:3000/AI_categories_brands_consult").then((response) => {
          console.log(response.data.text);
          setText(response.data.text);
          setDisplayedText(""); // Reset displayed text when sidebar is expanded
        }).catch(err => console.log(err));
      }
    }
  }, [isExpanded]);

  

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const styles = {
    expanded: {
      transform: "translateX(0)"
    },
    sidebar: {
      backgroundImage: `radial-gradient(farthest-corner, rgba(33, 33, 66, 1), #1d1d59, #30308c)`,
      borderBottomLeftRadius: "20px",
      border: `2px solid ${yellow}`,
      borderRight: "None",
      width: sidebarWidth,
      height: "60vh",
      position: "fixed",
      top: "300px",
      right: "0",
      transition: "transform 0.6s ease-in-out",
      transform: "translateX(100%)",
    },
    button: {
      display: "flex",                 
      justifyContent: "center",        
      alignItems: "center",
      borderTopLeftRadius: "20px",
      borderBottomLeftRadius: "20px",
      border: `2px solid ${yellow}`,
      position: "fixed",
      width: "100px",
      height: "100px",
      top: "300px",
      right: "0px",
      backgroundColor: blue,
      transition: "transform 0.6s ease-in-out",
      transform: "translateX(0)"
    },
    buttonExpand: {
      transform: `translateX(-${sidebarWidth})`
    },
    pointer: {
      display: "inline-block",
      width: "8px",
      backgroundColor: "#FFD700", // Pointer color
      marginLeft: "2px",
      animation: "blink 1s step-end infinite"
    }
  };

  return (
    <>
      <div style={{ ...styles.button, ...(isExpanded ? styles.buttonExpand : {}) }} onClick={toggleSidebar}>
        <img
          src={icon}
          alt="Toggle Icon"
          style={{
            width: "70px",
            height: "70px" 
          }}
        />
      </div>
      <div style={!isExpanded ? styles.sidebar : { ...styles.sidebar, ...styles.expanded }}>
        <div style= {{margin:"30px", color:"white", fontSize: "20px"}}>
          {displayedText}
        </div>
        <span style={styles.pointer}></span>
      </div>
    </>
  );
};

export default Sidebar;