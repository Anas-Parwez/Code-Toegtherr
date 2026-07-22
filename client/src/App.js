import './styles/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';

function App() {
    return (
      <>
      <Toaster position="top-right"/>
      <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/editor/:roomId" element={<EditorPage />} />
            </Routes>
        </BrowserRouter>
        </>  
    );
}
// Step 1 — BrowserRouter wakes up and says "okay, what's the current URL?"
// Step 2 — Routes looks at that URL and goes through each Route one by one asking "does this URL match my path?"
// Step 3 — The first Route that matches wins and its element gets rendered on screen.
export default App;