import type { User } from '@/types/auth'

// Static mock users for production build (no faker dependency)
// Admin user
export const adminUser: User = {
  id: '1',
  username: 'admin',
  email: 'admin@example.com',
  realName: 'Administrator',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  phone: '13800138000',
  gender: 'male',
  birthDate: '1990-01-01',
  bio: 'System Administrator',
  status: 'active',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  roles: [
    {
      id: '1',
      name: 'Administrator',
      code: 'admin',
      description: 'System Administrator',
      permissions: [],
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    }
  ],
  permissions: [
    {
      id: '1',
      name: 'All Permissions',
      code: '*',
      description: 'Has all permissions',
      resource: '*',
      action: '*',
      type: 'api'
    }
  ]
}

// Regular user
export const regularUser: User = {
  id: '2',
  username: 'user',
  email: 'user@example.com',
  realName: 'Regular User',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
  phone: '13800138001',
  gender: 'female',
  birthDate: '1995-05-15',
  bio: 'Regular User',
  status: 'active',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  roles: [
    {
      id: '2',
      name: 'User',
      code: 'user',
      description: 'Regular User',
      permissions: [],
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    }
  ],
  permissions: [
    {
      id: '2',
      name: 'View Dashboard',
      code: 'dashboard.view',
      description: 'Can view dashboard',
      resource: 'dashboard',
      action: 'view',
      type: 'menu'
    }
  ]
}

// Static mock users list
export const mockUsers: User[] = [
  adminUser,
  regularUser,
  {
    id: '3',
    username: 'zhangsan',
    email: 'zhangsan@example.com',
    realName: 'Zhang San',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    phone: '13800138002',
    gender: 'male',
    birthDate: '1988-03-15',
    bio: 'Software Engineer',
    status: 'active',
    createdAt: '2023-02-01T00:00:00.000Z',
    updatedAt: '2023-06-01T00:00:00.000Z',
    roles: [],
    permissions: []
  },
  {
    id: '4',
    username: 'lisi',
    email: 'lisi@example.com',
    realName: 'Li Si',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    phone: '13800138003',
    gender: 'female',
    birthDate: '1992-07-22',
    bio: 'Product Manager',
    status: 'active',
    createdAt: '2023-03-01T00:00:00.000Z',
    updatedAt: '2023-07-01T00:00:00.000Z',
    roles: [],
    permissions: []
  },
  {
    id: '5',
    username: 'wangwu',
    email: 'wangwu@example.com',
    realName: 'Wang Wu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
    phone: '13800138004',
    gender: 'male',
    birthDate: '1995-11-08',
    bio: 'Frontend Developer',
    status: 'active',
    createdAt: '2023-04-01T00:00:00.000Z',
    updatedAt: '2023-08-01T00:00:00.000Z',
    roles: [],
    permissions: []
  },
  {
    id: '6',
    username: 'zhaoliu',
    email: 'zhaoliu@example.com',
    realName: 'Zhao Liu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu',
    phone: '13800138005',
    gender: 'female',
    birthDate: '1990-05-30',
    bio: 'Backend Developer',
    status: 'inactive',
    createdAt: '2023-05-01T00:00:00.000Z',
    updatedAt: '2023-09-01T00:00:00.000Z',
    roles: [],
    permissions: []
  },
  {
    id: '7',
    username: 'sunqi',
    email: 'sunqi@example.com',
    realName: 'Sun Qi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunqi',
    phone: '13800138006',
    gender: 'male',
    birthDate: '1993-09-12',
    bio: 'DevOps Engineer',
    status: 'active',
    createdAt: '2023-06-01T00:00:00.000Z',
    updatedAt: '2023-10-01T00:00:00.000Z',
    roles: [],
    permissions: []
  },
  {
    id: '8',
    username: 'zhouba',
    email: 'zhouba@example.com',
    realName: 'Zhou Ba',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhouba',
    phone: '13800138007',
    gender: 'female',
    birthDate: '1991-02-28',
    bio: 'QA Engineer',
    status: 'active',
    createdAt: '2023-07-01T00:00:00.000Z',
    updatedAt: '2023-11-01T00:00:00.000Z',
    roles: [],
    permissions: []
  },
  {
    id: '9',
    username: 'wujiu',
    email: 'wujiu@example.com',
    realName: 'Wu Jiu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wujiu',
    phone: '13800138008',
    gender: 'male',
    birthDate: '1987-12-05',
    bio: 'Tech Lead',
    status: 'active',
    createdAt: '2023-08-01T00:00:00.000Z',
    updatedAt: '2023-12-01T00:00:00.000Z',
    roles: [],
    permissions: []
  },
  {
    id: '10',
    username: 'zhengshi',
    email: 'zhengshi@example.com',
    realName: 'Zheng Shi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhengshi',
    phone: '13800138009',
    gender: 'female',
    birthDate: '1994-04-18',
    bio: 'UI Designer',
    status: 'active',
    createdAt: '2023-09-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    roles: [],
    permissions: []
  },
  {
    id: '11',
    username: 'wangfang',
    email: 'wangfang@example.com',
    realName: 'Wang Fang',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangfang',
    phone: '13800138010',
    gender: 'female',
    birthDate: '1996-06-25',
    bio: 'Data Analyst',
    status: 'active',
    createdAt: '2023-10-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
    roles: [],
    permissions: []
  }
]