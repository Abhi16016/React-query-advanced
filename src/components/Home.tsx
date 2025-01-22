import { Link } from "react-router-dom"

function Home() {
  return (
    <div>
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/users">Users</Link>
        <Link to="/optimistic">Optimistic</Link>
    </div>
  )
}

export default Home