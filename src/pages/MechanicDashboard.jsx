import { useEffect, useState } from 'react'
import API_URL from '../api'

function MechanicDashboard() {
  const user = JSON.parse(
    localStorage.getItem('roadresq_user')
  )

  const [requests, setRequests] = useState([])
  const [activeJob, setActiveJob] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [diagnosis, setDiagnosis] = useState('')
  const [parts, setParts] = useState([
    { description: '', amount: '' }
  ])
  const [labour, setLabour] = useState([
    { description: '', amount: '' }
  ])
  const [assistance, setAssistance] = useState([
    { description: '', amount: '' }
  ])

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/mechanics/requests`
      )

      const data = await response.json()
      setRequests(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchActiveJob = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(
        `${API_URL}/api/mechanics/active-job/${user.id}`
      )

      const data = await response.json()
      setActiveJob(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchRequests()
    fetchActiveJob()
  }, [])

  const handleAccept = async (requestId) => {
    setMessage('')

    try {
      const response = await fetch(
        `${API_URL}/api/mechanics/requests/${requestId}/accept`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mechanic_id: user.id
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      setMessage('Request accepted successfully!')

      await fetchRequests()
      await fetchActiveJob()
    } catch (error) {
      setMessage(
        error.message || 'Failed to accept request'
      )
    }
  }

  const addItem = (type) => {
    const newItem = {
      description: '',
      amount: ''
    }

    if (type === 'parts') {
      setParts([...parts, newItem])
    }

    if (type === 'labour') {
      setLabour([...labour, newItem])
    }

    if (type === 'assistance') {
      setAssistance([...assistance, newItem])
    }
  }

  const updateItem = (
    type,
    index,
    field,
    value
  ) => {
    const update = (items, setItems) => {
      setItems(
        items.map((item, i) =>
          i === index
            ? { ...item, [field]: value }
            : item
        )
      )
    }

    if (type === 'parts') {
      update(parts, setParts)
    }

    if (type === 'labour') {
      update(labour, setLabour)
    }

    if (type === 'assistance') {
      update(assistance, setAssistance)
    }
  }

  const getTotal = () => {
    const getItemsTotal = (items) =>
      items.reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
      )

    return (
      Number(activeJob?.priority_charge || 0) +
      getItemsTotal(parts) +
      getItemsTotal(labour) +
      getItemsTotal(assistance)
    )
  }

  const handleGenerateBill = async () => {
    if (!activeJob) return

    if (!diagnosis.trim()) {
      setMessage('Please enter the diagnosis.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(
        `${API_URL}/api/mechanics/requests/${activeJob.id}/billing`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mechanic_id: user.id,
            diagnosis,
            parts,
            labour,
            assistance
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      setMessage(
        'Invoice generated successfully! Job completed.'
      )

      setActiveJob(null)
      setDiagnosis('')

      setParts([
        { description: '', amount: '' }
      ])

      setLabour([
        { description: '', amount: '' }
      ])

      setAssistance([
        { description: '', amount: '' }
      ])

      fetchRequests()
    } catch (error) {
      setMessage(
        error.message || 'Failed to generate invoice'
      )
    } finally {
      setLoading(false)
    }
  }

  const renderItems = (
    type,
    title,
    items
  ) => (
    <div className="mt-6">

      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold">
          {title}
        </h4>

        <button
          type="button"
          onClick={() => addItem(type)}
          className="text-sm text-orange-400 hover:text-orange-300"
        >
          + Add
        </button>
      </div>

      {items.map((item, index) => (
        <div
          key={index}
          className="flex gap-3 mb-3"
        >
          <input
            value={item.description}
            onChange={(e) =>
              updateItem(
                type,
                index,
                'description',
                e.target.value
              )
            }
            placeholder="Description"
            className="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-orange-400"
          />

          <input
            type="number"
            min="0"
            value={item.amount}
            onChange={(e) =>
              updateItem(
                type,
                index,
                'amount',
                e.target.value
              )
            }
            placeholder="₹ Amount"
            className="w-32 px-4 py-3 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-orange-400"
          />
        </div>
      ))}

    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <header className="border-b border-white/10 bg-slate-900/70">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div>
            <h1 className="text-2xl font-bold">
              Road<span className="text-orange-400">ResQ</span>
            </h1>

            <p className="text-xs text-slate-400">
              Mechanic Portal
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="hidden sm:block text-right">
              <p className="font-medium">
                {user?.name || 'Mechanic'}
              </p>

              <p className="text-xs text-slate-400">
                Mechanic
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'M'}
            </div>

          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">
          <p className="text-orange-400 text-sm">
            Welcome back
          </p>

          <h2 className="text-3xl font-bold mt-1">
            Hey, {user?.name || 'Mechanic'} 🔧
          </h2>

          <p className="text-slate-400 mt-2">
            View breakdown requests and generate customer bills.
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {message}
          </div>
        )}

        {activeJob && (
          <div className="mb-8 p-6 rounded-2xl bg-orange-500/10 border border-orange-500/30">

            <div className="mb-6">
              <p className="text-orange-400 text-sm font-medium">
                Accepted Job
              </p>

              <h3 className="text-2xl font-bold mt-1">
                {activeJob.vehicle_number}
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">

              <div>
                <p className="text-slate-500">Customer</p>
                <p className="mt-1">
                  {activeJob.customer_name}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Contact</p>
                <p className="mt-1">
                  {activeJob.contact_number}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Vehicle</p>
                <p className="mt-1">
                  {activeJob.vehicle_type} •{' '}
                  {activeJob.brand} {activeJob.model}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Location</p>
                <p className="mt-1">
                  📍 {activeJob.location}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Problem</p>
                <p className="mt-1">
                  {activeJob.problem_type}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Priority</p>
                <p className="mt-1 uppercase">
                  {activeJob.priority}
                </p>
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-white/10">

              <h3 className="text-xl font-bold">
                Repair & Billing
              </h3>

              <textarea
                value={diagnosis}
                onChange={(e) =>
                  setDiagnosis(e.target.value)
                }
                rows="3"
                placeholder="Enter diagnosis..."
                className="w-full mt-4 px-4 py-3 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-orange-400 resize-none"
              />

              {renderItems(
                'parts',
                '🔩 Parts / Spare Parts',
                parts
              )}

              {renderItems(
                'labour',
                '🔧 Labour / Service',
                labour
              )}

              {renderItems(
                'assistance',
                '🛠️ Additional Assistance',
                assistance
              )}

              <div className="mt-6 p-5 rounded-xl bg-slate-900 border border-white/10">

                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Priority Charge
                  </span>

                  <span>
                    ₹{activeJob.priority_charge}
                  </span>
                </div>

                <div className="border-t border-white/10 mt-4 pt-4 flex justify-between">
                  <span className="text-lg font-semibold">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-orange-400">
                    ₹{getTotal()}
                  </span>
                </div>

              </div>

              <button
                onClick={handleGenerateBill}
                disabled={loading}
                className="w-full mt-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 font-semibold"
              >
                {loading
                  ? 'Generating Bill...'
                  : 'Generate Bill & Complete Job'}
              </button>

            </div>

          </div>
        )}

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">

          <div className="mb-6">
            <h3 className="text-xl font-bold">
              Incoming Breakdown Requests
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              Customer requests waiting for a mechanic.
            </p>
          </div>

          {requests.length === 0 ? (

            <div className="text-center py-14">

              <div className="text-5xl mb-3">
                🛠️
              </div>

              <p className="text-slate-300">
                No requests available
              </p>

              <p className="text-sm text-slate-500 mt-1">
                New breakdown requests will appear here.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {requests.map(request => (

                <div
                  key={request.id}
                  className="p-5 rounded-xl bg-slate-900 border border-white/10"
                >

                  <div className="flex flex-col md:flex-row justify-between gap-5">

                    <div>

                      <div className="flex items-center gap-3">

                        <h4 className="text-lg font-semibold">
                          {request.vehicle_number}
                        </h4>

                        <span className="px-2 py-1 rounded-md text-xs bg-orange-500/10 text-orange-400 uppercase">
                          {request.priority}
                        </span>

                      </div>

                      <p className="text-sm text-slate-300 mt-2">
                        {request.vehicle_type} •{' '}
                        {request.brand} {request.model}
                      </p>

                      <p className="text-sm text-slate-400 mt-2">
                        🔧 {request.problem_type}
                      </p>

                      <p className="text-sm text-slate-400 mt-1">
                        📍 {request.location}
                      </p>

                      <p className="text-sm text-slate-400 mt-1">
                        👤 {request.customer_name}
                      </p>

                    </div>

                    <div className="flex flex-col items-start md:items-end justify-center">

                      <p className="text-xs text-slate-500">
                        Priority Charge
                      </p>

                      <p className="text-xl font-bold text-orange-400">
                        ₹{request.priority_charge}
                      </p>

                      <button
                        onClick={() =>
                          handleAccept(request.id)
                        }
                        disabled={!!activeJob}
                        className="mt-3 px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm"
                      >
                        {activeJob
                          ? 'Job Active'
                          : 'Accept Request'}
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

    </div>
  )
}

export default MechanicDashboard
