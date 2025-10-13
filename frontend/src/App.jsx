import { Routes, Route } from 'react-router-dom';
import './App.css'
import Landing from './components/Landing';
import DocManager from './components/DocManager';
import Chat from './components/Chat';

function App() {
  const backendUrl = 'http://localhost:8000'

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/docs" element={<DocManager backendUrl={backendUrl} />} />
      <Route path='/chat' element={<Chat backendUrl={backendUrl}/>} />
    </Routes>
  );
}

export default App;