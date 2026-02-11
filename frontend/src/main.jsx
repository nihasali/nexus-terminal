import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './redux/store.js'

// 1. Target the 'root' element from your index.html
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

// 2. Use the .render method on that root
root.render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
