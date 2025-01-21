import { Route, Routes } from 'react-router-dom'
import './App.css'
import Products from './components/pagination'
import Home from './components/Home'

function App() {

  return (
    <>
    <h2>React Query Tutorial</h2>

    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/products" element={<Products />} />
    </Routes>
    </>
  )
}

export default App
