// src/components/Layout.tsx
import React from 'react';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
