import type { Department } from '@/types/dept'

/**
 * 部门数据（扁平结构，用于增删改查）
 */
export const departments: Department[] = [
  {
    id: '1',
    name: '总公司',
    parentId: null,
    leader: '张总',
    phone: '13800000001',
    email: 'ceo@example.com',
    sort: 1,
    status: 'enabled',
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  // 一级部门
  {
    id: '10',
    name: '技术研发部',
    parentId: '1',
    leader: '李工',
    phone: '13800000010',
    email: 'tech@example.com',
    sort: 1,
    status: 'enabled',
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: '11',
    name: '产品设计部',
    parentId: '1',
    leader: '王设计',
    phone: '13800000011',
    email: 'design@example.com',
    sort: 2,
    status: 'enabled',
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: '12',
    name: '市场营销部',
    parentId: '1',
    leader: '赵市场',
    phone: '13800000012',
    email: 'market@example.com',
    sort: 3,
    status: 'enabled',
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: '13',
    name: '人力资源部',
    parentId: '1',
    leader: '孙HR',
    phone: '13800000013',
    email: 'hr@example.com',
    sort: 4,
    status: 'enabled',
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: '14',
    name: '财务部',
    parentId: '1',
    leader: '周财务',
    phone: '13800000014',
    email: 'finance@example.com',
    sort: 5,
    status: 'enabled',
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  // 二级部门 - 技术研发部下属
  {
    id: '101',
    name: '前端开发组',
    parentId: '10',
    leader: '陈前端',
    phone: '13800000101',
    sort: 1,
    status: 'enabled',
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: '102',
    name: '后端开发组',
    parentId: '10',
    leader: '刘后端',
    phone: '13800000102',
    sort: 2,
    status: 'enabled',
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: '103',
    name: '测试组',
    parentId: '10',
    leader: '吴测试',
    phone: '13800000103',
    sort: 3,
    status: 'enabled',
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: '104',
    name: '运维组',
    parentId: '10',
    leader: '郑运维',
    phone: '13800000104',
    sort: 4,
    status: 'enabled',
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  // 二级部门 - 产品设计部下属
  {
    id: '111',
    name: 'UI设计组',
    parentId: '11',
    leader: '钱UI',
    phone: '13800000111',
    sort: 1,
    status: 'enabled',
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: '112',
    name: '产品策划组',
    parentId: '11',
    leader: '冯策划',
    phone: '13800000112',
    sort: 2,
    status: 'enabled',
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  // 二级部门 - 市场营销部下属
  {
    id: '121',
    name: '品牌推广组',
    parentId: '12',
    leader: '韩品牌',
    phone: '13800000121',
    sort: 1,
    status: 'enabled',
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: '122',
    name: '渠道销售组',
    parentId: '12',
    leader: '杨销售',
    phone: '13800000122',
    sort: 2,
    status: 'enabled',
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  // 二级部门 - 人力资源部下属
  {
    id: '131',
    name: '招聘组',
    parentId: '13',
    leader: '朱招聘',
    sort: 1,
    status: 'enabled',
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: '132',
    name: '培训组',
    parentId: '13',
    leader: '秦培训',
    sort: 2,
    status: 'disabled',
    remark: '暂停运营',
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-06-01 00:00:00'
  }
]

/**
 * 将扁平数据构建为树形结构
 */
export function buildDeptTree(list: Department[]): Department[] {
  const map = new Map<string, Department>()
  const roots: Department[] = []

  list.forEach(item => {
    map.set(item.id, { ...item, children: [] })
  })

  map.forEach(item => {
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children!.push(item)
    } else if (!item.parentId) {
      roots.push(item)
    }
  })

  // 递归排序
  const sortTree = (nodes: Department[]) => {
    nodes.sort((a, b) => a.sort - b.sort)
    nodes.forEach(n => {
      if (n.children?.length) sortTree(n.children)
      else delete n.children
    })
  }
  sortTree(roots)
  return roots
}
