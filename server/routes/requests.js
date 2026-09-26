const express = require('express')
const db = require('../database')

const router = express.Router()

// CREATE BREAKDOWN REQUEST
router.post('/', (req, res) => {
  try {
    const {
      customer_id,
      vehicle_id,
      problem_type,
      problem_description,
      location,
      contact_number,
      priority
    } = req.body

    if (
      !customer_id ||
      !vehicle_id ||
      !problem_type ||
      !location ||
      !contact_number ||
      !priority
    ) {
      return res.status(400).json({
        message: 'Please fill all required fields'
      })
    }

    const priorityData = {
      normal: {
        charge: 100,
        arrival: 60
      },
      urgent: {
        charge: 250,
        arrival: 30
      },
      emergency: {
        charge: 500,
        arrival: 15
      }
    }

    if (!priorityData[priority]) {
      return res.status(400).json({
        message: 'Invalid priority'
      })
    }

    const {
      charge,
      arrival
    } = priorityData[priority]

    const result = db.prepare(`
      INSERT INTO breakdown_requests (
        customer_id,
        vehicle_id,
        problem_type,
        problem_description,
        location,
        contact_number,
        priority,
        priority_charge,
        arrival_target_minutes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      customer_id,
      vehicle_id,
      problem_type,
      problem_description || null,
      location,
      contact_number,
      priority,
      charge,
      arrival
    )

    res.status(201).json({
      message: 'Breakdown request created successfully',
      requestId: result.lastInsertRowid
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to create breakdown request'
    })
  }
})

// GET CUSTOMER ACTIVE REQUEST
router.get('/customer/:customerId/active', (req, res) => {
  try {
    const request = db.prepare(`
      SELECT
        breakdown_requests.id,
        breakdown_requests.problem_type,
        breakdown_requests.problem_description,
        breakdown_requests.location,
        breakdown_requests.priority,
        breakdown_requests.status,
        breakdown_requests.created_at,

        users.name AS mechanic_name,
        users.phone AS mechanic_phone

      FROM breakdown_requests

      LEFT JOIN users
        ON breakdown_requests.assigned_mechanic_id = users.id

      WHERE breakdown_requests.customer_id = ?

      ORDER BY breakdown_requests.created_at DESC

      LIMIT 1
    `).get(req.params.customerId)

    res.json(request || null)

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch request details'
    })
  }
})
// GET CUSTOMER BILL
router.get('/customer/:customerId/bill', (req, res) => {
  try {
    const bill = db.prepare(`
      SELECT
        invoices.id AS invoice_id,
        invoices.priority_charge,
        invoices.parts_total,
        invoices.labour_total,
        invoices.assistance_total,
        invoices.total_amount,
        invoices.status AS invoice_status,

        breakdown_requests.problem_type,
        breakdown_requests.diagnosis,

        vehicles.vehicle_number,
        vehicles.brand,
        vehicles.model

      FROM invoices

      JOIN breakdown_requests
        ON invoices.request_id = breakdown_requests.id

      JOIN vehicles
        ON breakdown_requests.vehicle_id = vehicles.id

      WHERE breakdown_requests.customer_id = ?

      ORDER BY invoices.created_at DESC

      LIMIT 1
    `).get(req.params.customerId)

    res.json(bill || null)

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch bill'
    })
  }
})

module.exports = router