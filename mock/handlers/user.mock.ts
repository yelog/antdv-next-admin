import { defineMock } from 'vite-plugin-mock-dev-server'
import { mockUsers } from '../data/users.data'
import { faker } from '@faker-js/faker'

export default defineMock([
  // Get user list (with pagination and search)
  {
    url: '/api/users',
    method: 'GET',
    body: (req) => {
      const { current = 1, pageSize = 10, username, email, status } = req.query

      // Filter users
      let filteredUsers = [...mockUsers]

      if (username) {
        filteredUsers = filteredUsers.filter(user =>
          user.username.toLowerCase().includes(username.toLowerCase())
        )
      }

      if (email) {
        filteredUsers = filteredUsers.filter(user =>
          user.email.toLowerCase().includes(email.toLowerCase())
        )
      }

      if (status) {
        filteredUsers = filteredUsers.filter(user => user.status === status)
      }

      // Pagination
      const start = (Number(current) - 1) * Number(pageSize)
      const end = start + Number(pageSize)
      const list = filteredUsers.slice(start, end)

      return {
        code: 200,
        message: 'Success',
        data: {
          list,
          total: filteredUsers.length,
          current: Number(current),
          pageSize: Number(pageSize)
        },
        success: true
      }
    }
  },

  // Get user by ID
  {
    url: '/api/users/:id',
    method: 'GET',
    body: (req) => {
      const { id } = req.params
      const user = mockUsers.find(u => u.id === id)

      if (user) {
        return {
          code: 200,
          message: 'Success',
          data: user,
          success: true
        }
      } else {
        return {
          code: 404,
          message: 'User not found',
          data: null,
          success: false
        }
      }
    }
  },

  // Create user
  {
    url: '/api/users',
    method: 'POST',
    body: (req) => {
      const userData = req.body

      const newUser = {
        id: faker.string.uuid(),
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roles: [],
        permissions: []
      }

      mockUsers.push(newUser)

      return {
        code: 200,
        message: 'User created successfully',
        data: newUser,
        success: true
      }
    }
  },

  // Update user
  {
    url: '/api/users/:id',
    method: 'PUT',
    body: (req) => {
      const { id } = req.params
      const userData = req.body

      const index = mockUsers.findIndex(u => u.id === id)

      if (index !== -1) {
        mockUsers[index] = {
          ...mockUsers[index],
          ...userData,
          updatedAt: new Date().toISOString()
        }

        return {
          code: 200,
          message: 'User updated successfully',
          data: mockUsers[index],
          success: true
        }
      } else {
        return {
          code: 404,
          message: 'User not found',
          data: null,
          success: false
        }
      }
    }
  },

  // Delete user
  {
    url: '/api/users/:id',
    method: 'DELETE',
    body: (req) => {
      const { id } = req.params
      const index = mockUsers.findIndex(u => u.id === id)

      if (index !== -1) {
        mockUsers.splice(index, 1)

        return {
          code: 200,
          message: 'User deleted successfully',
          data: null,
          success: true
        }
      } else {
        return {
          code: 404,
          message: 'User not found',
          data: null,
          success: false
        }
      }
    }
  }
])
