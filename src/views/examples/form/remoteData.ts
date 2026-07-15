export interface RemoteSelectOption {
  label: string;
  value: string;
}

export interface RemoteTreeNode {
  title: string;
  value: string;
  isLeaf?: boolean;
  children?: RemoteTreeNode[];
}

interface RemoteUser {
  department: string;
  id: string;
  name: string;
}

const REMOTE_USERS: RemoteUser[] = [
  { id: 'user-1', name: 'Lin Chen', department: 'Engineering' },
  { id: 'user-2', name: 'Noah Wang', department: 'Product' },
  { id: 'user-3', name: 'Mia Zhou', department: 'Design' },
  { id: 'user-4', name: 'Evan Liu', department: 'Operations' },
  { id: 'user-5', name: 'Ava Zhang', department: 'Customer Success' },
];

const REMOTE_TREE: RemoteTreeNode[] = [
  {
    title: 'Product & Technology',
    value: 'product-tech',
    children: [
      { title: 'Platform Engineering', value: 'platform-engineering', isLeaf: true },
      { title: 'Product Design', value: 'product-design', isLeaf: true },
      { title: 'Data Intelligence', value: 'data-intelligence', isLeaf: true },
    ],
  },
  {
    title: 'Business Operations',
    value: 'business-operations',
    children: [
      { title: 'Customer Success', value: 'customer-success', isLeaf: true },
      { title: 'Revenue Operations', value: 'revenue-operations', isLeaf: true },
      { title: 'People Operations', value: 'people-operations', isLeaf: true },
    ],
  },
];

function includesKeyword(value: string, keyword: string): boolean {
  return value.toLocaleLowerCase().includes(keyword.trim().toLocaleLowerCase());
}

export function searchRemoteUsers(keyword: string): RemoteSelectOption[] {
  if (!keyword.trim()) return [];

  return REMOTE_USERS.filter(
    (user) => includesKeyword(user.name, keyword) || includesKeyword(user.department, keyword),
  ).map((user) => ({
    label: `${user.name} · ${user.department}`,
    value: user.id,
  }));
}

export function searchRemoteTree(keyword: string): RemoteTreeNode[] {
  if (!keyword.trim()) return [];

  return REMOTE_TREE.flatMap((group) => {
    if (includesKeyword(group.title, keyword)) return [group];

    const children = group.children?.filter((node) => includesKeyword(node.title, keyword)) ?? [];
    return children.length > 0 ? [{ ...group, children }] : [];
  });
}

export function createLazyChildren(parentValue: string): RemoteTreeNode[] {
  const title = parentValue
    .split('-')
    .map((part) => `${part.charAt(0).toLocaleUpperCase()}${part.slice(1)}`)
    .join(' ');

  return [
    { title: `${title} / Sales`, value: `${parentValue}-sales`, isLeaf: true },
    { title: `${title} / Service`, value: `${parentValue}-service`, isLeaf: true },
  ];
}
