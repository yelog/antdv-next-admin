import { defineMock } from 'vite-plugin-mock-dev-server'
import { mockUsers } from '../data/users.data'
import { faker } from '@faker-js/faker'

export default defineMock([
  // Get user list (with pagination and search)
  {
    url: '/api/users',
    method: 'GET',
    body: (req) => {
      const { current = 1, pageSize = 10, username, email, status, gender } = req.query

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

      if (gender) {
        const genderValues = Array.isArray(gender)
          ? gender.map(item => String(item))
          : String(gender).split(',').map(item => item.trim()).filter(Boolean)
        if (genderValues.length > 0) {
          filteredUsers = filteredUsers.filter(user => genderValues.includes(String(user.gender)))
        }
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
        username: userData.username || `user_${faker.string.alphanumeric(6)}`,
        email: userData.email || faker.internet.email(),
        realName: userData.realName || faker.person.fullName(),
        avatar: userData.avatar || faker.image.avatar(),
        phone: userData.phone || `1${faker.string.numeric(10)}`,
        gender: userData.gender || 'male',
        birthDate: userData.birthDate || faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0],
        bio: userData.bio || '',
        status: userData.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roles: userData.roles || [],
        permissions: userData.permissions || []
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
