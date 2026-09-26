import { useEffect, useState } from 'react'
import API_URL from '../api'

function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [vehicles, setVehicles] = useState([])
  const [bill, setBill] = useState(null)
  const [activeRequest, setActiveRequest] = useState(null)

  const [requestForm, setRequestForm] = useState({
    vehicle_id: '',
    problem_type: '',
    problem_description: '',
    location: '',
    contact_number: '',
    priority: 'normal'
  })

  const [vehicleForm, setVehicleForm] = useState({
    vehicle_number: '',
    vehicle_type: '',
    brand: '',
    model: ''
  })

  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [message, setMessage] = useState('')

  const user = JSON.parse(
    localStorage.getItem('roadresq_user')
  )

  const fetchVehicles = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(
        `${API_URL}/api/vehicles/${user.id}`
      )

      const data = await response.json()
      setVehicles(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchBill = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(
        `${API_URL}/api/requests/customer/${user.id}/bill`
      )

      const data = await response.json()

      if (response.ok) {
        setBill(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchActiveRequest = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(
        `${API_URL}/api/requests/customer/${user.id}/active`
      )

      const data = await response.json()

      if (response.ok) {
        setActiveRequest(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchVehicles()
    fetchBill()
    fetchActiveRequest()
  }, [])

  useEffect(() => {
    if (activeTab !== 'request') return

    fetchActiveRequest()

    const interval = setInterval(() => {
      fetchActiveRequest()
    }, 5000)

    return () => clearInterval(interval)
  }, [activeTab])

  const handleVehicleChange = (e) => {
    setVehicleForm({
      ...vehicleForm,
      [e.target.name]: e.target.value
    })
  }

  const handleAddVehicle = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const response = await fetch(
        `${API_URL}/api/vehicles`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: user.id,
            ...vehicleForm
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      setMessage('Vehicle added successfully!')

      setVehicleForm({
        vehicle_number: '',
        vehicle_type: '',
        brand: '',
        model: ''
      })

      setShowVehicleForm(false)
      fetchVehicles()
    } catch (error) {
      setMessage(
        error.message || 'Failed to add vehicle'
      )
    }
  }

  const handleRequestChange = (e) => {
    setRequestForm({
      ...requestForm,
      [e.target.name]: e.target.value
    })
  }

  const handleCreateRequest = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const response = await fetch(
        `${API_URL}/api/requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customer_id: user.id,
            ...requestForm
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      setMessage(
        'Breakdown request sent successfully!'
      )

      setRequestForm({
        vehicle_id: '',
        problem_type: '',
        problem_description: '',
        location: '',
        contact_number: '',
        priority: 'normal'
      })

      fetchActiveRequest()
    } catch (error) {
      setMessage(
        error.message || 'Failed to create request'
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <header className="border-b border-white/10 bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              Road<span className="text-orange-400">ResQ</span>
            </h1>

            <p className="text-xs text-slate-400">
              Vehicle Breakdown Assistance
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">
                {user?.name || 'Customer'}
              </p>

              <p className="text-xs text-slate-400">
                Customer
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'C'}
            </div>

          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">
          <p className="text-orange-400 text-sm font-medium">
            Welcome back
          </p>

          <h2 className="text-3xl font-bold mt-1">
            Hey, {user?.name || 'Customer'} 👋
          </h2>

          <p className="text-slate-400 mt-2">
            Get roadside assistance whenever you need it.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-6">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

            <div>
              <p className="text-orange-400 font-semibold">
                Vehicle trouble?
              </p>

              <h3 className="text-xl font-bold mt-1">
                Get help from a mechanic
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                Raise a breakdown request and connect with an available mechanic.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('request')}
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 font-semibold transition"
            >
              🆘 Request Assistance
            </button>

          </div>

        </div>

        <div className="flex gap-2 overflow-x-auto mb-8">

          {[
            ['overview', 'Overview'],
            ['vehicles', 'My Vehicles'],
            ['request', 'Breakdown Request'],
            ['bill', 'My Bill']
          ].map(([id, label]) => (

            <button
              key={id}
              onClick={() => {
                setActiveTab(id)

                if (id === 'bill') {
                  fetchBill()
                }

                if (id === 'request') {
                  fetchActiveRequest()
                }
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeTab === id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {label}
            </button>

          ))}

        </div>

        {activeTab === 'overview' && (

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-slate-400 text-sm">
                Registered Vehicles
              </p>

              <p className="text-3xl font-bold mt-2">
                {vehicles.length}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-slate-400 text-sm">
                Assistance
              </p>

              <p className="text-3xl font-bold mt-2">
                🛠️
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-slate-400 text-sm">
                Latest Bill
              </p>

              <p className="text-3xl font-bold mt-2">
                {bill ? `₹${bill.total_amount}` : '—'}
              </p>
            </div>

          </div>

        )}

        {activeTab === 'vehicles' && (

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h3 className="text-xl font-bold">
                  My Vehicles
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  Add and manage your vehicles.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowVehicleForm(!showVehicleForm)
                  setMessage('')
                }}
                className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-sm font-semibold"
              >
                {showVehicleForm
                  ? 'Cancel'
                  : '+ Add Vehicle'}
              </button>

            </div>

            {showVehicleForm && (

              <form
                onSubmit={handleAddVehicle}
                className="mb-6 p-5 rounded-xl bg-slate-900/70 border border-white/10 space-y-4"
              >

                <h4 className="font-semibold text-lg">
                  Add Vehicle
                </h4>

                <div className="grid md:grid-cols-2 gap-4">

                  <input
                    name="vehicle_number"
                    value={vehicleForm.vehicle_number}
                    onChange={handleVehicleChange}
                    placeholder="Vehicle Number"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-orange-400"
                  />

                  <select
                    name="vehicle_type"
                    value={vehicleForm.vehicle_type}
                    onChange={handleVehicleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 text-white outline-none focus:border-orange-400"
                  >
                    <option
                      value=""
                      className="bg-slate-900 text-white"
                    >
                      Select Vehicle Type
                    </option>

                    <option
                      value="Car"
                      className="bg-slate-900 text-white"
                    >
                      Car
                    </option>

                    <option
                      value="Bike"
                      className="bg-slate-900 text-white"
                    >
                      Bike
                    </option>

                    <option
                      value="Scooter"
                      className="bg-slate-900 text-white"
                    >
                      Scooter
                    </option>

                    <option
                      value="Other"
                      className="bg-slate-900 text-white"
                    >
                      Other
                    </option>
                  </select>

                  <input
                    name="brand"
                    value={vehicleForm.brand}
                    onChange={handleVehicleChange}
                    placeholder="Brand"
                    className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-orange-400"
                  />

                  <input
                    name="model"
                    value={vehicleForm.model}
                    onChange={handleVehicleChange}
                    placeholder="Model"
                    className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-orange-400"
                  />

                </div>

                <button
                  type="submit"
                  className="px-5 py-3 rounded-lg bg-orange-500 hover:bg-orange-400 font-semibold"
                >
                  Add Vehicle
                </button>

              </form>

            )}

            {message && (
              <p className="text-sm text-emerald-400 mb-4">
                {message}
              </p>
            )}

            {vehicles.length > 0 ? (

              <div className="grid md:grid-cols-2 gap-4">

                {vehicles.map(vehicle => (

                  <div
                    key={vehicle.id}
                    className="p-5 rounded-xl bg-slate-900/70 border border-white/10"
                  >

                    <div className="flex items-center gap-4">

                      <div className="text-3xl">
                        {vehicle.vehicle_type === 'Bike' ||
                        vehicle.vehicle_type === 'Scooter'
                          ? '🏍️'
                          : '🚗'}
                      </div>

                      <div>
                        <h4 className="font-semibold">
                          {vehicle.brand || 'Vehicle'}{' '}
                          {vehicle.model || ''}
                        </h4>

                        <p className="text-sm text-slate-400">
                          {vehicle.vehicle_number}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {vehicle.vehicle_type}
                        </p>
                      </div>

                    </div>

                  </div>

                ))}

              </div>

            ) : (

              <div className="text-center py-12">
                <div className="text-5xl mb-3">
                  🚙
                </div>

                <p className="text-slate-300">
                  No vehicles added yet.
                </p>
              </div>

            )}

          </div>

        )}

        {activeTab === 'request' && (

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">

            <h3 className="text-xl font-bold">
              Request Breakdown Assistance
            </h3>

            <p className="text-sm text-slate-400 mt-1 mb-6">
              Provide the details so a mechanic can assist you.
            </p>

            {activeRequest?.status === 'assigned' ? (

              <div className="mb-6 p-5 rounded-xl bg-emerald-500/10 border border-emerald-400/20">

                <p className="text-emerald-400 font-semibold">
                  🛠️ Mechanic Assigned
                </p>

                <h4 className="text-lg font-bold mt-2">
                  {activeRequest.mechanic_name}
                </h4>

                <p className="text-sm text-slate-400 mt-1">
                  Your breakdown request has been accepted.
                </p>

                {activeRequest.mechanic_phone && (
                  <p className="text-sm text-slate-300 mt-3">
                    📞 {activeRequest.mechanic_phone}
                  </p>
                )}

              </div>

            ) : activeRequest?.status === 'requested' ? (

              <div className="mb-6 p-5 rounded-xl bg-orange-500/10 border border-orange-400/20">

                <p className="text-orange-400 font-semibold">
                  ⏳ Request Sent
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  Your request is waiting for a mechanic to accept it.
                </p>

              </div>

            ) : null}

            {vehicles.length === 0 ? (

              <div className="p-5 rounded-xl bg-orange-500/10 border border-orange-400/20">
                <p className="text-orange-400 font-medium">
                  Add a vehicle first
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  Register your vehicle before creating a breakdown request.
                </p>
              </div>

            ) : activeRequest?.status === 'assigned' ? (

              <div className="p-5 rounded-xl bg-slate-900/70 border border-white/10">

                <p className="text-slate-300 font-medium">
                  Your request is currently assigned to a mechanic.
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  You can view your bill after the mechanic completes the service.
                </p>

              </div>

            ) : (

              <form
                onSubmit={handleCreateRequest}
                className="space-y-5"
              >

                <select
                  name="vehicle_id"
                  value={requestForm.vehicle_id}
                  onChange={handleRequestChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white outline-none focus:border-orange-400"
                >
                  <option
                    value=""
                    className="bg-slate-900 text-white"
                  >
                    Select Vehicle
                  </option>

                  {vehicles.map(vehicle => (
                    <option
                      key={vehicle.id}
                      value={vehicle.id}
                      className="bg-slate-900 text-white"
                    >
                      {vehicle.vehicle_number} — {vehicle.brand || ''}{' '}
                      {vehicle.model || ''}
                    </option>
                  ))}

                </select>

                <select
                  name="problem_type"
                  value={requestForm.problem_type}
                  onChange={handleRequestChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white outline-none focus:border-orange-400"
                >
                  <option
                    value=""
                    className="bg-slate-900 text-white"
                  >
                    Select Problem
                  </option>

                  <option value="Engine Problem">Engine Problem</option>
                  <option value="Battery Dead">Battery Dead</option>
                  <option value="Flat Tyre">Flat Tyre</option>
                  <option value="Accident / Collision">
                    Accident / Collision
                  </option>
                  <option value="Fuel Problem">Fuel Problem</option>
                  <option value="Electrical Problem">
                    Electrical Problem
                  </option>
                  <option value="Other">Other</option>
                </select>

                <textarea
                  name="problem_description"
                  value={requestForm.problem_description}
                  onChange={handleRequestChange}
                  rows="3"
                  placeholder="Describe the problem..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 resize-none outline-none focus:border-orange-400"
                />

                <input
                  name="location"
                  value={requestForm.location}
                  onChange={handleRequestChange}
                  placeholder="Breakdown Location"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-orange-400"
                />

                <input
                  type="tel"
                  name="contact_number"
                  value={requestForm.contact_number}
                  onChange={handleRequestChange}
                  placeholder="Contact Number"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-orange-400"
                />

                <div>

                  <label className="text-sm text-slate-300">
                    Priority
                  </label>

                  <div className="grid sm:grid-cols-3 gap-3 mt-2">

                    {[
                      ['normal', 'Normal', '₹100 • 60 min'],
                      ['urgent', 'Urgent', '₹250 • 30 min'],
                      ['emergency', 'Emergency', '₹500 • 15 min']
                    ].map(([value, label, info]) => (

                      <label
                        key={value}
                        className={`cursor-pointer p-4 rounded-xl border ${
                          requestForm.priority === value
                            ? 'border-orange-400 bg-orange-500/10'
                            : 'border-white/10 bg-white/5'
                        }`}
                      >

                        <input
                          type="radio"
                          name="priority"
                          value={value}
                          checked={requestForm.priority === value}
                          onChange={handleRequestChange}
                          className="hidden"
                        />

                        <p className="font-semibold">
                          {label}
                        </p>

                        <p className="text-sm text-slate-400 mt-1">
                          {info}
                        </p>

                      </label>

                    ))}

                  </div>

                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 font-semibold"
                >
                  🚨 Send Breakdown Request
                </button>

              </form>

            )}

            {message && (
              <p className="text-sm text-emerald-400 mt-4">
                {message}
              </p>
            )}

          </div>

        )}

        {activeTab === 'bill' && (

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">

            <div className="mb-6">
              <h3 className="text-xl font-bold">
                My Bill
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                Your repair bill will appear here after the mechanic completes the job.
              </p>
            </div>

            {!bill ? (

              <div className="text-center py-16">

                <div className="text-5xl mb-4">
                  🧾
                </div>

                <p className="text-slate-300 font-medium">
                  No bill available yet
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  The bill will be available once the mechanic completes your service.
                </p>

              </div>

            ) : (

              <div className="max-w-2xl mx-auto">

                <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-400/20">

                  <div className="flex justify-between items-start mb-6">

                    <div>
                      <p className="text-emerald-400 font-semibold">
                        RoadResQ Invoice
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        Invoice #{bill.invoice_id}
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">
                      {bill.invoice_status}
                    </span>

                  </div>

                  <div className="border-b border-white/10 pb-5 mb-5">

                    <p className="font-semibold">
                      {bill.problem_type}
                    </p>

                    <p className="text-sm text-slate-400 mt-1">
                      {bill.vehicle_number} • {bill.brand} {bill.model}
                    </p>

                    {bill.diagnosis && (
                      <p className="text-sm text-slate-400 mt-3">
                        <span className="text-slate-300">
                          Diagnosis:
                        </span>{' '}
                        {bill.diagnosis}
                      </p>
                    )}

                  </div>

                  <div className="space-y-3 text-sm">

                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Priority Charge
                      </span>

                      <span>
                        ₹{Number(bill.priority_charge).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Parts
                      </span>

                      <span>
                        ₹{Number(bill.parts_total).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Labour
                      </span>

                      <span>
                        ₹{Number(bill.labour_total).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Assistance
                      </span>

                      <span>
                        ₹{Number(bill.assistance_total).toFixed(2)}
                      </span>
                    </div>

                  </div>

                  <div className="border-t border-white/10 mt-5 pt-5 flex justify-between items-center">

                    <span className="text-lg font-semibold">
                      Total Amount
                    </span>

                    <span className="text-2xl font-bold text-orange-400">
                      ₹{Number(bill.total_amount).toFixed(2)}
                    </span>

                  </div>

                </div>

              </div>

            )}

          </div>

        )}

      </main>

    </div>
  )
}

export default CustomerDashboard
