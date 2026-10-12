import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StudioProvider } from './lib/StudioContext';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><StudioProvider><App /></StudioProvider></BrowserRouter></StrictMode>);
