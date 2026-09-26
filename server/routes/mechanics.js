const express = require('express')
const db = require('../database')

const router = express.Router()

// GET AVAILABLE REQUESTS
router.get('/requests', (req, res) => {
  try {
    const requests = db.prepare(`
      SELECT
        breakdown_requests.id,
        breakdown_requests.problem_type,
        breakdown_requests.problem_description,
        breakdown_requests.location,
        breakdown_requests.contact_number,
        breakdown_requests.priority,
        breakdown_requests.priority_charge,
        breakdown_requests.arrival_target_minutes,
        breakdown_requests.created_at,

        users.name AS customer_name,

        vehicles.vehicle_number,
        vehicles.vehicle_type,
        vehicles.brand,
        vehicles.model

      FROM breakdown_requests

      JOIN users
        ON breakdown_requests.customer_id = users.id

      JOIN vehicles
        ON breakdown_requests.vehicle_id = vehicles.id

      WHERE breakdown_requests.status = 'requested'

      ORDER BY
        CASE breakdown_requests.priority
          WHEN 'emergency' THEN 1
          WHEN 'urgent' THEN 2
          ELSE 3
        END,
        breakdown_requests.created_at ASC
    `).all()

    res.json(requests)

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch breakdown requests'
    })
  }
})


// ACCEPT REQUEST
router.post('/requests/:requestId/accept', (req, res) => {
  try {
    const requestId = req.params.requestId
    const mechanicId = req.body.mechanic_id

    if (!mechanicId) {
      return res.status(400).json({
        message: 'Mechanic ID is required'
      })
    }

    // Check mechanic
    const mechanic = db.prepare(`
      SELECT id, role
      FROM users
      WHERE id = ?
    `).get(mechanicId)

    if (!mechanic || mechanic.role !== 'mechanic') {
      return res.status(403).json({
        message: 'Invalid mechanic'
      })
    }

    // Check active job
    const activeJob = db.prepare(`
      SELECT id
      FROM breakdown_requests
      WHERE assigned_mechanic_id = ?
      AND status = 'assigned'
    `).get(mechanicId)

    if (activeJob) {
      return res.status(409).json({
        message: 'You already have an active job'
      })
    }

    // Accept only waiting requests
    const result = db.prepare(`
      UPDATE breakdown_requests
      SET
        assigned_mechanic_id = ?,
        status = 'assigned'
      WHERE id = ?
      AND status = 'requested'
    `).run(
      mechanicId,
      requestId
    )

    if (result.changes === 0) {
      return res.status(409).json({
        message: 'This request has already been accepted'
      })
    }

    res.json({
      message: 'Request accepted successfully'
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to accept request'
    })
  }
})


// GET ACTIVE JOB
router.get('/active-job/:mechanicId', (req, res) => {
  try {
    const job = db.prepare(`
      SELECT
        breakdown_requests.id,
        breakdown_requests.problem_type,
        breakdown_requests.problem_description,
        breakdown_requests.location,
        breakdown_requests.contact_number,
        breakdown_requests.priority,
        breakdown_requests.priority_charge,
        breakdown_requests.status,
        breakdown_requests.created_at,

        users.name AS customer_name,

        vehicles.vehicle_number,
        vehicles.vehicle_type,
        vehicles.brand,
        vehicles.model

      FROM breakdown_requests

      JOIN users
        ON breakdown_requests.customer_id = users.id

      JOIN vehicles
        ON breakdown_requests.vehicle_id = vehicles.id

      WHERE breakdown_requests.assigned_mechanic_id = ?
      AND breakdown_requests.status = 'assigned'

      LIMIT 1
    `).get(req.params.mechanicId)

    res.json(job || null)

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch active job'
    })
  }
})


// GENERATE BILL + COMPLETE JOB
router.post('/requests/:requestId/billing', (req, res) => {
  try {
    const requestId = req.params.requestId

    const {
      mechanic_id,
      diagnosis,
      parts,
      labour,
      assistance
    } = req.body

    if (!mechanic_id) {
      return res.status(400).json({
        message: 'Mechanic ID is required'
      })
    }

    // Get request
    const request = db.prepare(`
      SELECT
        id,
        assigned_mechanic_id,
        priority_charge,
        status
      FROM breakdown_requests
      WHERE id = ?
    `).get(requestId)

    if (!request) {
      return res.status(404).json({
        message: 'Request not found'
      })
    }

    // Verify mechanic
    if (
      request.assigned_mechanic_id !==
      Number(mechanic_id)
    ) {
      return res.status(403).json({
        message: 'You are not assigned to this job'
      })
    }

    if (request.status !== 'assigned') {
      return res.status(400).json({
        message: 'This job is not available for billing'
      })
    }

    const partItems =
      Array.isArray(parts) ? parts : []

    const labourItems =
      Array.isArray(labour) ? labour : []

    const assistanceItems =
      Array.isArray(assistance)
        ? assistance
        : []

    // Calculate totals
    const getTotal = (items) =>
      items.reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
      )

    const partsTotal = getTotal(partItems)
    const labourTotal = getTotal(labourItems)
    const assistanceTotal = getTotal(assistanceItems)

    const priorityCharge =
      Number(request.priority_charge || 0)

    const totalAmount =
      priorityCharge +
      partsTotal +
      labourTotal +
      assistanceTotal

    // Save billing
    const saveBilling = db.transaction(() => {

      db.prepare(`
        UPDATE breakdown_requests
        SET
          diagnosis = ?,
          status = 'completed'
        WHERE id = ?
      `).run(
        diagnosis || null,
        requestId
      )

      db.prepare(`
        DELETE FROM service_items
        WHERE request_id = ?
      `).run(requestId)

      const insertItem = db.prepare(`
        INSERT INTO service_items
        (
          request_id,
          item_type,
          description,
          amount
        )
        VALUES (?, ?, ?, ?)
      `)

      for (const item of partItems) {
        if (item.description) {
          insertItem.run(
            requestId,
            'part',
            item.description,
            Number(item.amount || 0)
          )
        }
      }

      for (const item of labourItems) {
        if (item.description) {
          insertItem.run(
            requestId,
            'labour',
            item.description,
            Number(item.amount || 0)
          )
        }
      }

      for (const item of assistanceItems) {
        if (item.description) {
          insertItem.run(
            requestId,
            'assistance',
            item.description,
            Number(item.amount || 0)
          )
        }
      }

      db.prepare(`
        INSERT INTO invoices (
          request_id,
          priority_charge,
          parts_total,
          labour_total,
          assistance_total,
          total_amount,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, 'generated')
      `).run(
        requestId,
        priorityCharge,
        partsTotal,
        labourTotal,
        assistanceTotal,
        totalAmount
      )
    })

    saveBilling()

    res.json({
      message: 'Invoice generated successfully',
      invoice: {
        priority_charge: priorityCharge,
        parts_total: partsTotal,
        labour_total: labourTotal,
        assistance_total: assistanceTotal,
        total_amount: totalAmount,
        status: 'generated'
      }
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to generate invoice'
    })
  }
})

module.exports = router
