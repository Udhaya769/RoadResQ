import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_URL from '../api'
function Login() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

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

    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
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

      // Save logged-in user
      localStorage.setItem(
        'roadresq_user',
        JSON.stringify(data.user)
      )

      // Redirect based on role
      if (data.user.role === 'customer') {
        navigate('/customer')
      } else {
        navigate('/mechanic')
      }

    } catch (error) {
      setError(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">

      <div className="w-full max-w-5xl min-h-[600px] grid md:grid-cols-2 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">

        {/* Left - RoadResQ branding */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">

          <div>
            <h1 className="text-3xl font-bold text-white">
              Road<span className="text-orange-400">ResQ</span>
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Vehicle Breakdown Assistance
            </p>
          </div>

          <div>
            <div className="text-7xl mb-6">
              🚗
            </div>

            <h2 className="text-4xl font-bold text-white leading-tight">
              Back on the road,
              <br />
              faster.
            </h2>

            <p className="mt-4 max-w-sm text-slate-400">
              Reliable roadside assistance connecting you
              with available mechanics when you need help.
            </p>
          </div>

          <p className="text-xs text-slate-500">
            RoadResQ • Drive with confidence
          </p>

        </div>

        {/* Right - Login */}
        <div className="flex items-center justify-center p-8 md:p-12 bg-white/5">

          <div className="w-full max-w-md">

            <div className="mb-8">
              <p className="text-orange-400 text-sm font-medium">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold text-white mt-2">
                Sign in to RoadResQ
              </h2>

              <p className="text-slate-400 mt-2">
                Access your assistance dashboard.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div>
                <label className="text-sm text-slate-300">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full mt-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-orange-400 transition"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full mt-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-orange-400 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold transition"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

            </form>

            {error && (
              <p className="text-red-400 text-sm text-center mt-4">
                {error}
              </p>
            )}

            <p className="text-center text-sm text-slate-400 mt-8">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-orange-400 hover:text-orange-300 font-medium"
              >
                Create one
              </Link>
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Login