import { useState } from 'react'
import './App.css'
import TemperatureChart from './components/TemperatureChart'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className={`App ${isDarkMode ? 'dark' : 'light'}`}>
      <button 
        className="theme-toggle"
        onClick={() => setIsDarkMode(!isDarkMode)}
      >
        {isDarkMode ? '☀️ Light' : '🌙 Dark'}
      </button>
      <TemperatureChart isDarkMode={isDarkMode} />
    </div>
  )
}

export default App
