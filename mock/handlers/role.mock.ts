import { defineMock } from 'vite-plugin-mock-dev-server'
import { mockRoles } from '../data/roles.data'
import { faker } from '@faker-js/faker'

export default defineMock([
  // Get role list
  {
    url: '/api/roles',
    method: 'GET',
    body: (req) => {
      const { current = 1, pageSize = 10, name, code } = req.query

      // Filter roles
      let filteredRoles = [...mockRoles]

      if (name) {
        filteredRoles = filteredRoles.filter(role =>
          role.name.toLowerCase().includes(name.toLowerCase())
        )
      }

      if (code) {
        filteredRoles = filteredRoles.filter(role =>
          role.code.toLowerCase().includes(code.toLowerCase())
        )
      }

      // Pagination
      const start = (Number(current) - 1) * Number(pageSize)
      const end = start + Number(pageSize)
      const list = filteredRoles.slice(start, end)

      return {
        code: 200,
        message: 'Success',
        data: {
          list,
          total: filteredRoles.length,
          current: Number(current),
          pageSize: Number(pageSize)
        },
        success: true
      }
    }
  },

  // Get role by ID
  {
    url: '/api/roles/:id',
    method: 'GET',
    body: (req) => {
      const { id } = req.params
      const role = mockRoles.find(r => r.id === id)

      if (role) {
        return {
          code: 200,
          message: 'Success',
          data: role,
          success: true
        }
      } else {
        return {
          code: 404,
          message: 'Role not found',
          data: null,
          success: false
        }
      }
    }
  },

  // Create role
  {
    url: '/api/roles',
    method: 'POST',
    body: (req) => {
      const roleData = req.body

      const newRole = {
        id: faker.string.uuid(),
        name: roleData.name,
        code: roleData.code,
        description: roleData.description || '',
        permissions: roleData.permissions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      mockRoles.push(newRole)

      return {
        code: 200,
        message: 'Role created successfully',
        data: newRole,
        success: true
      }
    }
  },

  // Update role
  {
    url: '/api/roles/:id',
    method: 'PUT',
    body: (req) => {
      const { id } = req.params
      const roleData = req.body

      const index = mockRoles.findIndex(r => r.id === id)

      if (index !== -1) {
        mockRoles[index] = {
          ...mockRoles[index],
          ...roleData,
          updatedAt: new Date().toISOString()
        }

        return {
          code: 200,
          message: 'Role updated successfully',
          data: mockRoles[index],
          success: true
        }
      } else {
        return {
          code: 404,
          message: 'Role not found',
          data: null,
          success: false
        }
      }
    }
  },

  // Delete role
  {
    url: '/api/roles/:id',
    method: 'DELETE',
    body: (req) => {
      const { id } = req.params
      const index = mockRoles.findIndex(r => r.id === id)

      if (index !== -1) {
        mockRoles.splice(index, 1)

        return {
          code: 200,
          message: 'Role deleted successfully',
          data: null,
          success: true
        }
      } else {
        return {
          code: 404,
          message: 'Role not found',
          data: null,
          success: false
        }
      }
    }
  }
])
