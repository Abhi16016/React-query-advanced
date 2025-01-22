import { Route, Routes } from 'react-router-dom'
import './App.css'
import Products from './components/pagination'
import Home from './components/Home'
import Parallel from './components/parallel'
import Optimistic from './components/optimistic'

function App() {

  return (
    <>
    <h2>React Query Tutorial</h2>

    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/products" element={<Products />} />
      <Route path="/users" element={<Parallel />} />
      <Route path="/optimistic" element={<Optimistic />} />
    </Routes>
    </>
  )
}

export default App
