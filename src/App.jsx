import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import CustomerDashboard from './pages/CustomerDashboard'
import MechanicDashboard from './pages/MechanicDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/customer"
          element={<CustomerDashboard />}
        />
        <Route
          path="/mechanic"
          element={<MechanicDashboard />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App