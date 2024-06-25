// App.js
import React, { useState } from 'react';
import Navbar from './Navbar';
import SideBar from './SideBar';
import ServiceDisplay from './ServiceDisplay';

const App = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`App ${darkMode ? 'dark' : ''}`}>
      <Navbar selectedService={selectedService} toggleDarkMode={() => setDarkMode(!darkMode)} darkMode={darkMode} toggleSidebar={toggleSidebar} />
      <div className={`flex ${darkMode ? 'bg-customRichBlack' : 'bg-customTeal'}`}>
        {/* Sidebar */}
        <SideBar onSelect={(service) => setSelectedService(service)} isSidebarVisible={isSidebarOpen} darkMode={darkMode} toggleSidebar={toggleSidebar} />

        {/* Main content area with dynamic padding and background based on sidebar state */}
        <div className={`flex-1 ${isSidebarOpen ? 'md:pl-32' : 'pl-0'} transition-all ease-in-out duration-300 ${darkMode ? 'bg-customRichBlack text-white' : 'bg-customTeal text-black'}`}>
          <ServiceDisplay serviceName={selectedService} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
};

export default App;
