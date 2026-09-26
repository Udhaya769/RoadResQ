import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_URL from '../api'

function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
  })

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setMessage('')
    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      setMessage('Registration successful! Redirecting to login...')

      setTimeout(() => {
        navigate('/')
      }, 1200)

    } catch (error) {
      setError(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">

      <div className="w-full max-w-5xl min-h-[600px] grid md:grid-cols-2 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">

        {/* Left Side */}
        <div className="hidden md:flex flex-col justify-center p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">

          <h1 className="text-3xl font-bold text-white">
            Road<span className="text-orange-400">ResQ</span>
          </h1>

          <div className="text-7xl mt-12 mb-6">
            🔧
          </div>

          <h2 className="text-4xl font-bold text-white">
            Get back on the road.
          </h2>

          <p className="text-slate-400 mt-4 max-w-sm">
            Create your RoadResQ account and get roadside
            assistance whenever you need it.
          </p>

        </div>

        {/* Right Side */}
        <div className="flex items-center justify-center p-8 md:p-12">

          <div className="w-full max-w-md">

            <p className="text-orange-400 text-sm font-medium">
              Get started
            </p>

            <h2 className="text-3xl font-bold text-white mt-2">
              Create your account
            </h2>

            <p className="text-slate-400 mt-2 mb-8">
              Join RoadResQ today.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-orange-400"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-orange-400"
              />

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-orange-400"
              />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-orange-400"
              />

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-300 outline-none focus:border-orange-400"
              >
                <option value="customer">Customer</option>
                <option value="mechanic">Mechanic</option>
              </select>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold transition"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

            </form>

            {message && (
              <p className="text-green-400 text-sm text-center mt-4">
                {message}
              </p>
            )}

            {error && (
              <p className="text-red-400 text-sm text-center mt-4">
                {error}
              </p>
            )}

            <p className="text-center text-sm text-slate-400 mt-8">
              Already have an account?{' '}
              <Link
                to="/"
                className="text-orange-400 hover:text-orange-300 font-medium"
              >
                Sign in
              </Link>
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Register