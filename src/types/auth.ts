// Authentication Types

export interface LoginParams {
  username: string
  password: string
  remember?: boolean
}

export interface LoginResult {
  token: string
  refreshToken?: string
  expiresIn?: number
}

export interface User {
  id: string
  username: string
  email: string
  realName: string
  avatar: string
  phone: string
  gender?: 'male' | 'female'
  birthDate?: string
  bio?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  roles: Role[]
  permissions: Permission[]
}

export interface Role {
  id: string
  name: string
  code: string
  description: string
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: string
  name: string
  code: string
  description: string
  resource: string
  action: string
  type: 'menu' | 'button' | 'api'
  parentId?: string
  path?: string
  component?: string
  icon?: string
  sort?: number
  status?: 'active' | 'inactive'
  visible?: boolean
  children?: Permission[]
}
