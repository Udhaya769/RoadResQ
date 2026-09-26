const express = require('express')
const db = require('../database')

const router = express.Router()

// Add a vehicle
router.post('/', (req, res) => {
  try {
    const {
      user_id,
      vehicle_number,
      vehicle_type,
      brand,
      model
    } = req.body

    if (!user_id || !vehicle_number || !vehicle_type) {
      return res.status(400).json({
        message: 'Please fill all required vehicle details'
      })
    }

    const result = db.prepare(`
      INSERT INTO vehicles
      (user_id, vehicle_number, vehicle_type, brand, model)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      user_id,
      vehicle_number,
      vehicle_type,
      brand || null,
      model || null
    )

    res.status(201).json({
      message: 'Vehicle added successfully',
      vehicleId: result.lastInsertRowid
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to add vehicle'
    })
  }
})

// Get vehicles of a customer
router.get('/:userId', (req, res) => {
  try {
    const vehicles = db.prepare(`
      SELECT
        id,
        vehicle_number,
        vehicle_type,
        brand,
        model,
        created_at
      FROM vehicles
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.params.userId)

    res.json(vehicles)

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch vehicles'
    })
  }
})

module.exports = router