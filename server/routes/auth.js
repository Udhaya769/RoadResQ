
const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('../database')

const router = express.Router()

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role
    } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'Please fill all required fields'
      })
    }

    if (!['customer', 'mechanic'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role'
      })
    }

    const existingUser = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email)

    if (existingUser) {
      return res.status(409).json({
        message: 'Email already registered'
      })
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    )

    const result = db
      .prepare(`
        INSERT INTO users
        (name, email, password, role, phone)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(
        name,
        email,
        hashedPassword,
        role,
        phone || null
      )

    res.status(201).json({
      message: 'Registration successful',
      userId: result.lastInsertRowid
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Registration failed'
    })
  }
})


// LOGIN
router.post('/login', async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      })
    }

    const user = db
      .prepare(`
        SELECT
          id,
          name,
          email,
          password,
          role,
          phone
        FROM users
        WHERE email = ?
      `)
      .get(email)

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    )

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    // Send user information to frontend
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Login failed'
    })
  }
})

module.exports = router

