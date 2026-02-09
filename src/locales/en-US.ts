export default {
  common: {
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    search: 'Search',
    reset: 'Reset',
    submit: 'Submit',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    operate: 'Operate',
    more: 'More',
    back: 'Back',
    ok: 'OK',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    loading: 'Loading...',
    noData: 'No Data',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    actions: 'Actions',
    status: 'Status',
    createTime: 'Create Time',
    updateTime: 'Update Time'
  },

  menu: {
    dashboard: 'Dashboard',
    system: 'System',
    user: 'User Management',
    role: 'Role Management',
    permission: 'Permission Management',
    examples: 'Examples',
    table: 'Table Example',
    form: 'Form Example',
    profile: 'Profile'
  },

  layout: {
    logout: 'Logout',
    profile: 'Profile',
    settings: 'Settings',
    theme: 'Theme',
    language: 'Language',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    notifications: 'Notifications',
    markAllRead: 'Mark All Read',
    clearAll: 'Clear All',
    noNotifications: 'No Notifications',
    searchPlaceholder: 'Search menu...',
    noSearchResults: 'No matching menu found',
    tabs: {
      refresh: 'Refresh',
      close: 'Close',
      closeOthers: 'Close Others',
      closeAll: 'Close All',
      closeLeft: 'Close Left',
      closeRight: 'Close Right'
    }
  },

  settings: {
    title: 'Preferences',
    themeColor: 'Theme Color',
    sidebarTheme: 'Sidebar Theme',
    light: 'Light',
    dark: 'Dark',
    layoutMode: 'Layout Mode',
    vertical: 'Vertical',
    horizontal: 'Horizontal',
    pageAnimation: 'Page Animation',
    fade: 'Fade',
    slideLeft: 'Slide Left',
    slideRight: 'Slide Right',
    zoom: 'Zoom',
    none: 'None',
    grayMode: 'Gray Mode',
    grayModeHint: 'Enable grayscale mode for the entire app',
    reset: 'Reset Settings',
    confirmReset: 'Are you sure you want to reset all preferences?',
    colors: {
      blue: 'Daybreak Blue',
      green: 'Polar Green',
      purple: 'Golden Purple',
      red: 'Dust Red',
      orange: 'Sunset Orange',
      cyan: 'Cyan'
    }
  },

  login: {
    title: 'User Login',
    username: 'Username',
    password: 'Password',
    remember: 'Remember me',
    login: 'Login',
    forgotPassword: 'Forgot password',
    noAccount: "Don't have an account?",
    register: 'Register now',
    usernamePlaceholder: 'Please enter username',
    passwordPlaceholder: 'Please enter password',
    usernameRequired: 'Please enter username',
    passwordRequired: 'Please enter password',
    loginSuccess: 'Login successful',
    loginFailed: 'Login failed'
  },

  dashboard: {
    welcome: 'Welcome Back',
    totalUsers: 'Total Users',
    totalOrders: 'Total Orders',
    totalRevenue: 'Total Revenue',
    conversionRate: 'Conversion Rate',
    salesTrend: 'Sales Trend',
    userDistribution: 'User Distribution',
    recentActivities: 'Recent Activities',
    quickActions: 'Quick Actions',
    viewMore: 'View More'
  },

  user: {
    title: 'User Management',
    username: 'Username',
    email: 'Email',
    realName: 'Real Name',
    phone: 'Phone',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    avatar: 'Avatar',
    role: 'Role',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    createUser: 'Create User',
    editUser: 'Edit User',
    deleteUser: 'Delete User',
    confirmDelete: 'Are you sure you want to delete this user?',
    resetPassword: 'Reset Password',
    confirmResetPassword: 'Are you sure you want to reset this user\'s password?'
  },

  role: {
    title: 'Role Management',
    name: 'Role Name',
    code: 'Role Code',
    description: 'Description',
    permissions: 'Permissions',
    createRole: 'Create Role',
    editRole: 'Edit Role',
    deleteRole: 'Delete Role',
    confirmDelete: 'Are you sure you want to delete this role?',
    assignPermissions: 'Assign Permissions'
  },

  permission: {
    title: 'Permission Management',
    name: 'Permission Name',
    code: 'Permission Code',
    type: 'Type',
    menu: 'Menu',
    button: 'Button',
    api: 'API',
    resource: 'Resource',
    action: 'Action',
    createPermission: 'Create Permission',
    editPermission: 'Edit Permission',
    deletePermission: 'Delete Permission',
    confirmDelete: 'Are you sure you want to delete this permission?'
  },

  table: {
    title: 'Table Example',
    total: 'Total {total} items',
    page: 'Page {page}',
    pageSize: '{size} items per page',
    goTo: 'Go to'
  },

  form: {
    title: 'Form Example',
    basicInfo: 'Basic Information',
    advancedInfo: 'Advanced Information',
    submit: 'Submit',
    reset: 'Reset',
    validateSuccess: 'Validation passed',
    validateFailed: 'Validation failed'
  },

  profile: {
    title: 'Profile',
    basicInfo: 'Basic Information',
    security: 'Security',
    changePassword: 'Change Password',
    oldPassword: 'Old Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    passwordNotMatch: 'Passwords do not match',
    updateSuccess: 'Update successful',
    updateFailed: 'Update failed'
  },

  error: {
    404: 'Page Not Found',
    403: 'Access Forbidden',
    500: 'Server Error',
    backHome: 'Back to Home',
    pageNotFound: 'Sorry, the page you visited does not exist',
    noPermission: 'Sorry, you do not have permission to access this page',
    serverError: 'Sorry, the server is reporting an error'
  },

  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    url: 'Please enter a valid URL',
    minLength: 'Minimum length is {min} characters',
    maxLength: 'Maximum length is {max} characters',
    min: 'Minimum value is {min}',
    max: 'Maximum value is {max}',
    pattern: 'Invalid format'
  }
}
