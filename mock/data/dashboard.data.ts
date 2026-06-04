const avatarImg = "/src/assets/images/avatar-256.png";

/**
 * Deterministic pseudo-random number generator (mulberry32).
 * Used instead of faker to keep the browser mock bundle lean.
 */
function seededRandom(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = seededRandom(42);

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

// Statistics data
export const mockStats = {
  totalUsers: 12458,
  totalOrders: 8946,
  totalRevenue: 456789.56,
  conversionRate: 3.24,
};

// Sales trend data (last 12 months)
export const mockSalesTrend = Array.from({ length: 12 }, (_, index) => {
  const date = new Date();
  date.setMonth(date.getMonth() - (11 - index));
  return {
    month: date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' }),
    sales: randInt(20000, 80000),
    orders: randInt(500, 2000),
  };
});

// User distribution by city
export const mockUserDistribution = [
  { city: 'Beijing', value: 2341 },
  { city: 'Shanghai', value: 2156 },
  { city: 'Guangzhou', value: 1876 },
  { city: 'Shenzhen', value: 1654 },
  { city: 'Hangzhou', value: 1432 },
  { city: 'Chengdu', value: 1289 },
  { city: 'Other', value: 2710 },
];

// Recent activities
const ACTIVITY_USERS = [
  'Administrator', 'Alice Johnson', 'Bob Smith', 'Carol White',
  'David Brown', 'Eva Martinez', 'Frank Wilson', 'Grace Lee',
  'Henry Davis', 'Iris Taylor',
] as const;

const ACTIVITY_ACTIONS = [
  'Created a new user', 'Updated role permissions', 'Deleted expired data',
  'Exported reports', 'Updated system settings', 'Uploaded a new file',
] as const;

const ACTIVITY_TYPES = ['success', 'info', 'warning', 'error'] as const;

export const mockActivities = Array.from({ length: 10 }, (_, i) => ({
  id: `act-${String(i + 1).padStart(3, '0')}`,
  user: ACTIVITY_USERS[i],
  avatar: avatarImg,
  action: pick(ACTIVITY_ACTIONS),
  timestamp: new Date(Date.now() - randInt(1, 7) * 86400000).toISOString(),
  type: pick(ACTIVITY_TYPES),
}));

// Chart data for different visualizations
export const mockChartData = {
  // Line chart - Sales trend
  lineChart: {
    xAxis: mockSalesTrend.map((item) => item.month),
    series: [
      {
        name: 'Sales',
        data: mockSalesTrend.map((item) => item.sales),
      },
      {
        name: 'Orders',
        data: mockSalesTrend.map((item) => item.orders),
      },
    ],
  },

  // Bar chart - Monthly comparison
  barChart: {
    xAxis: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      {
        name: 'Current Year',
        data: [820, 932, 901, 934, 1290, 1330],
      },
      {
        name: 'Last Year',
        data: [720, 832, 801, 834, 1190, 1230],
      },
    ],
  },

  // Pie chart - User distribution
  pieChart: {
    data: mockUserDistribution.map((item) => ({
      name: item.city,
      value: item.value,
    })),
  },

  // Area chart - Traffic trend
  areaChart: {
    xAxis: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    series: [
      {
        name: 'Visits',
        data: Array.from({ length: 24 }, () => randInt(100, 1000)),
      },
    ],
  },
};
