'use client';

import { useState } from 'react';
import Header from './components/header';
import FloatingNavBar from './components/floatingnavbar';

export default function LayoutWrapper({ children }) {
  const [activeIcon, setActiveIcon] = useState('home');  // State for active icon

  return (
    <>
      {/* Pass activeIcon and setActiveIcon to Header and FloatingNavBar */}
      <Header activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
      {children}
      <FloatingNavBar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
    </>
  );
}
