'use client';

import { useState, useEffect } from 'react';
import Header from './components/header';
import FloatingNavBar from './components/floatingnavbar';

export default function LayoutWrapper({ children }) {
  const [activeIcon, setActiveIcon] = useState('home');  // State for active icon
  const [showNavBar, setShowNavBar] = useState(true);    // State to toggle navbar visibility
  const [lastScrollY, setLastScrollY] = useState(0);     // To track the previous scroll position

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Check if we're scrolling down or up
      if (currentScrollY > lastScrollY) {
        // Scrolling down, hide the navbar
        setShowNavBar(false);
      } else {
        // Scrolling up, show the navbar
        setShowNavBar(true);
      }

      // Update the last scroll position
      setLastScrollY(currentScrollY);
    };

    // Attach the scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <>
      {/* Pass activeIcon and setActiveIcon to Header and FloatingNavBar */}
      <Header activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
      {children}
      {/* Conditionally render the FloatingNavBar based on showNavBar */}
      <FloatingNavBar
        activeIcon={activeIcon}
        setActiveIcon={setActiveIcon}
        isVisible={showNavBar}  // Pass down visibility as prop
      />
    </>
  );
}
