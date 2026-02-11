
import React from 'react';
import { Header } from '../Header';
import './style.css';

interface PageLayoutProps {
  children?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="page-layout">
      <Header />
      <main className="layout-main">
        <div className="layout-container">
          {children}
        </div>
      </main>
    </div>
  );
};
