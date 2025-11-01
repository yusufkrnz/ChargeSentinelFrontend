import React from 'react';
import Sidebar from '../Dashboard/Components/Sidebar/Sidebar';
import './AIAnalytics.css';

export default function AIAnalytics() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <div className="content-header">
          <h1>AI & Analitik</h1>
          <p>Yapay zeka destekli analitik ve raporlama</p>
        </div>
        <div className="page-content">
          {/* İçerik buraya gelecek */}
        </div>
      </main>
    </div>
  );
}

