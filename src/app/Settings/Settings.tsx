import React from 'react';
import Sidebar from '../Dashboard/Components/Sidebar/Sidebar';
import './Settings.css';

export default function Settings() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <div className="content-header">
          <h1>Ayarlar</h1>
          <p>Sistem ayarları ve yapılandırma</p>
        </div>
        <div className="page-content">
          {/* İçerik buraya gelecek */}
        </div>
      </main>
    </div>
  );
}

