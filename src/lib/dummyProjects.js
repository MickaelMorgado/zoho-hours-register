// Dummy project data for development and testing
// This will eventually be replaced with real Zoho API data

// All tasks from all projects - this represents the API response
export const dummyTasks = [
  // E-Commerce Platform Redesign tasks
  { id: 1, name: 'Design new homepage layout', completed: true, projectId: 1, projectName: 'E-Commerce Platform Redesign', priority: 'high', assignedTo: 'John Doe', estimatedHours: 8, actualHours: 6, dueDate: '2025-01-20', status: 'completed' },
  { id: 2, name: 'Implement responsive navigation', completed: true, projectId: 1, projectName: 'E-Commerce Platform Redesign', priority: 'high', assignedTo: 'Jane Smith', estimatedHours: 12, actualHours: 10, dueDate: '2025-01-25', status: 'completed' },
  { id: 3, name: 'Create product catalog pages', completed: true, projectId: 1, projectName: 'E-Commerce Platform Redesign', priority: 'medium', assignedTo: 'Mike Johnson', estimatedHours: 16, actualHours: 14, dueDate: '2025-02-01', status: 'completed' },
  { id: 4, name: 'Build shopping cart functionality', completed: false, projectId: 1, projectName: 'E-Commerce Platform Redesign', priority: 'high', assignedTo: 'John Doe', estimatedHours: 20, actualHours: 0, dueDate: '2025-02-15', status: 'in_progress' },
  { id: 5, name: 'Implement payment processing', completed: false, projectId: 1, projectName: 'E-Commerce Platform Redesign', priority: 'high', assignedTo: 'Jane Smith', estimatedHours: 24, actualHours: 0, dueDate: '2025-02-28', status: 'pending' },
  { id: 6, name: 'Add user account management', completed: false, projectId: 1, projectName: 'E-Commerce Platform Redesign', priority: 'medium', assignedTo: 'Mike Johnson', estimatedHours: 18, actualHours: 0, dueDate: '2025-03-10', status: 'pending' },

  // Mobile App Development tasks
  { id: 7, name: 'Set up development environment', completed: true, projectId: 2, projectName: 'Mobile App Development', priority: 'high', assignedTo: 'Sarah Wilson', estimatedHours: 4, actualHours: 3, dueDate: '2025-02-05', status: 'completed' },
  { id: 8, name: 'Design app architecture', completed: true, projectId: 2, projectName: 'Mobile App Development', priority: 'high', assignedTo: 'David Brown', estimatedHours: 8, actualHours: 7, dueDate: '2025-02-10', status: 'completed' },
  { id: 9, name: 'Implement user authentication', completed: true, projectId: 2, projectName: 'Mobile App Development', priority: 'high', assignedTo: 'Lisa Garcia', estimatedHours: 12, actualHours: 9, dueDate: '2025-02-20', status: 'completed' },
  { id: 10, name: 'Create main navigation', completed: true, projectId: 2, projectName: 'Mobile App Development', priority: 'medium', assignedTo: 'Sarah Wilson', estimatedHours: 10, actualHours: 8, dueDate: '2025-02-25', status: 'completed' },
  { id: 11, name: 'Build notification system', completed: false, projectId: 2, projectName: 'Mobile App Development', priority: 'medium', assignedTo: 'David Brown', estimatedHours: 16, actualHours: 0, dueDate: '2025-03-15', status: 'in_progress' },
  { id: 12, name: 'Implement offline sync', completed: false, projectId: 2, projectName: 'Mobile App Development', priority: 'high', assignedTo: 'Lisa Garcia', estimatedHours: 20, actualHours: 0, dueDate: '2025-04-01', status: 'pending' },
  { id: 13, name: 'Add push notifications', completed: false, projectId: 2, projectName: 'Mobile App Development', priority: 'medium', assignedTo: 'Sarah Wilson', estimatedHours: 14, actualHours: 0, dueDate: '2025-04-15', status: 'pending' },

  // API Integration & Migration tasks
  { id: 14, name: 'Analyze legacy system', completed: true, projectId: 3, projectName: 'API Integration & Migration', priority: 'high', assignedTo: 'Robert Taylor', estimatedHours: 16, actualHours: 14, dueDate: '2024-11-15', status: 'completed' },
  { id: 15, name: 'Design microservices architecture', completed: true, projectId: 3, projectName: 'API Integration & Migration', priority: 'high', assignedTo: 'Emily Davis', estimatedHours: 20, actualHours: 18, dueDate: '2024-12-01', status: 'completed' },
  { id: 16, name: 'Implement authentication service', completed: true, projectId: 3, projectName: 'API Integration & Migration', priority: 'high', assignedTo: 'Chris Anderson', estimatedHours: 24, actualHours: 22, dueDate: '2024-12-15', status: 'completed' },
  { id: 17, name: 'Create user management API', completed: true, projectId: 3, projectName: 'API Integration & Migration', priority: 'medium', assignedTo: 'Robert Taylor', estimatedHours: 18, actualHours: 16, dueDate: '2024-12-30', status: 'completed' },
  { id: 18, name: 'Integrate payment gateway', completed: true, projectId: 3, projectName: 'API Integration & Migration', priority: 'high', assignedTo: 'Emily Davis', estimatedHours: 16, actualHours: 15, dueDate: '2025-01-15', status: 'completed' },
  { id: 19, name: 'Migrate user data', completed: true, projectId: 3, projectName: 'API Integration & Migration', priority: 'high', assignedTo: 'Chris Anderson', estimatedHours: 12, actualHours: 10, dueDate: '2025-01-25', status: 'completed' },
  { id: 20, name: 'Perform system testing', completed: true, projectId: 3, projectName: 'API Integration & Migration', priority: 'medium', assignedTo: 'Robert Taylor', estimatedHours: 8, actualHours: 7, dueDate: '2025-01-30', status: 'completed' },

  // Data Analytics Dashboard tasks
  { id: 21, name: 'Gather requirements', completed: true, projectId: 4, projectName: 'Data Analytics Dashboard', priority: 'high', assignedTo: 'Anna Martinez', estimatedHours: 8, actualHours: 6, dueDate: '2025-03-05', status: 'completed' },
  { id: 22, name: 'Design dashboard layout', completed: true, projectId: 4, projectName: 'Data Analytics Dashboard', priority: 'medium', assignedTo: 'Kevin Lee', estimatedHours: 12, actualHours: 10, dueDate: '2025-03-10', status: 'completed' },
  { id: 23, name: 'Set up data pipeline', completed: false, projectId: 4, projectName: 'Data Analytics Dashboard', priority: 'high', assignedTo: 'Rachel White', estimatedHours: 20, actualHours: 0, dueDate: '2025-03-25', status: 'in_progress' },
  { id: 24, name: 'Implement chart components', completed: false, projectId: 4, projectName: 'Data Analytics Dashboard', priority: 'medium', assignedTo: 'Anna Martinez', estimatedHours: 16, actualHours: 0, dueDate: '2025-04-01', status: 'pending' },
  { id: 25, name: 'Create report generation', completed: false, projectId: 4, projectName: 'Data Analytics Dashboard', priority: 'medium', assignedTo: 'Kevin Lee', estimatedHours: 14, actualHours: 0, dueDate: '2025-04-10', status: 'pending' },
  { id: 26, name: 'Add export functionality', completed: false, projectId: 4, projectName: 'Data Analytics Dashboard', priority: 'low', assignedTo: 'Rachel White', estimatedHours: 10, actualHours: 0, dueDate: '2025-04-20', status: 'pending' },

  // Security Audit & Compliance tasks
  { id: 27, name: 'Review security policies', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', priority: 'high', assignedTo: 'Mark Thompson', estimatedHours: 12, actualHours: 0, dueDate: '2025-04-05', status: 'pending' },
  { id: 28, name: 'Conduct vulnerability assessment', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', priority: 'high', assignedTo: 'Jessica Chen', estimatedHours: 16, actualHours: 0, dueDate: '2025-04-15', status: 'pending' },
  { id: 29, name: 'Implement encryption standards', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', priority: 'high', assignedTo: 'Mark Thompson', estimatedHours: 20, actualHours: 0, dueDate: '2025-04-25', status: 'pending' },
  { id: 30, name: 'Set up access controls', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', priority: 'medium', assignedTo: 'Jessica Chen', estimatedHours: 14, actualHours: 0, dueDate: '2025-05-05', status: 'pending' },
  { id: 31, name: 'Create compliance documentation', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', priority: 'medium', assignedTo: 'Mark Thompson', estimatedHours: 10, actualHours: 0, dueDate: '2025-05-10', status: 'pending' },
  { id: 32, name: 'Perform penetration testing', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', priority: 'high', assignedTo: 'Jessica Chen', estimatedHours: 18, actualHours: 0, dueDate: '2025-05-15', status: 'pending' },

  // Performance Optimization tasks
  { id: 33, name: 'Analyze performance bottlenecks', completed: true, projectId: 6, projectName: 'Performance Optimization', priority: 'high', assignedTo: 'Tom Wilson', estimatedHours: 12, actualHours: 10, dueDate: '2025-02-20', status: 'completed' },
  { id: 34, name: 'Optimize database queries', completed: true, projectId: 6, projectName: 'Performance Optimization', priority: 'high', assignedTo: 'Amy Rodriguez', estimatedHours: 16, actualHours: 14, dueDate: '2025-02-28', status: 'completed' },
  { id: 35, name: 'Implement caching layer', completed: true, projectId: 6, projectName: 'Performance Optimization', priority: 'medium', assignedTo: 'Brian Kim', estimatedHours: 14, actualHours: 12, dueDate: '2025-03-10', status: 'completed' },
  { id: 36, name: 'Refactor slow code sections', completed: false, projectId: 6, projectName: 'Performance Optimization', priority: 'medium', assignedTo: 'Tom Wilson', estimatedHours: 20, actualHours: 0, dueDate: '2025-03-20', status: 'in_progress' },
  { id: 37, name: 'Optimize frontend assets', completed: false, projectId: 6, projectName: 'Performance Optimization', priority: 'low', assignedTo: 'Amy Rodriguez', estimatedHours: 8, actualHours: 0, dueDate: '2025-03-25', status: 'pending' },
  { id: 38, name: 'Set up monitoring tools', completed: false, projectId: 6, projectName: 'Performance Optimization', priority: 'medium', assignedTo: 'Brian Kim', estimatedHours: 12, actualHours: 0, dueDate: '2025-03-30', status: 'pending' },

  // Additional E-Commerce Platform Redesign tasks
  { id: 39, name: 'Design mobile responsive layouts', completed: true, projectId: 1, projectName: 'E-Commerce Platform Redesign', priority: 'high', assignedTo: 'John Doe', estimatedHours: 16, actualHours: 14, dueDate: '2025-02-10', status: 'completed' },
  { id: 40, name: 'Implement lazy loading for images', completed: false, projectId: 1, projectName: 'E-Commerce Platform Redesign', priority: 'medium', assignedTo: 'Jane Smith', estimatedHours: 10, actualHours: 0, dueDate: '2025-02-20', status: 'in_progress' },
  { id: 41, name: 'Add accessibility features', completed: false, projectId: 1, projectName: 'E-Commerce Platform Redesign', priority: 'medium', assignedTo: 'Mike Johnson', estimatedHours: 12, actualHours: 0, dueDate: '2025-02-25', status: 'pending' },
  { id: 42, name: 'Create product comparison feature', completed: false, projectId: 1, projectName: 'E-Commerce Platform Redesign', priority: 'low', assignedTo: 'John Doe', estimatedHours: 14, actualHours: 0, dueDate: '2025-03-05', status: 'pending' },
  { id: 43, name: 'Implement search with filters', completed: false, projectId: 1, projectName: 'E-Commerce Platform Redesign', priority: 'high', assignedTo: 'Jane Smith', estimatedHours: 18, actualHours: 0, dueDate: '2025-03-15', status: 'pending' },

  // Additional Mobile App Development tasks
  { id: 44, name: 'Design offline data sync', completed: true, projectId: 2, projectName: 'Mobile App Development', priority: 'high', assignedTo: 'David Brown', estimatedHours: 20, actualHours: 18, dueDate: '2025-03-20', status: 'completed' },
  { id: 45, name: 'Implement biometric authentication', completed: false, projectId: 2, projectName: 'Mobile App Development', priority: 'medium', assignedTo: 'Lisa Garcia', estimatedHours: 16, actualHours: 0, dueDate: '2025-03-30', status: 'in_progress' },
  { id: 46, name: 'Add geolocation features', completed: false, projectId: 2, projectName: 'Mobile App Development', priority: 'medium', assignedTo: 'Sarah Wilson', estimatedHours: 14, actualHours: 0, dueDate: '2025-04-10', status: 'pending' },
  { id: 47, name: 'Create in-app purchase system', completed: false, projectId: 2, projectName: 'Mobile App Development', priority: 'high', assignedTo: 'David Brown', estimatedHours: 22, actualHours: 0, dueDate: '2025-04-20', status: 'pending' },
  { id: 48, name: 'Implement app analytics', completed: false, projectId: 2, projectName: 'Mobile App Development', priority: 'low', assignedTo: 'Lisa Garcia', estimatedHours: 10, actualHours: 0, dueDate: '2025-04-25', status: 'pending' },

  // Additional API Integration & Migration tasks
  { id: 49, name: 'Create API documentation', completed: true, projectId: 3, projectName: 'API Integration & Migration', priority: 'medium', assignedTo: 'Robert Taylor', estimatedHours: 8, actualHours: 6, dueDate: '2025-02-05', status: 'completed' },
  { id: 50, name: 'Implement rate limiting', completed: false, projectId: 3, projectName: 'API Integration & Migration', priority: 'medium', assignedTo: 'Emily Davis', estimatedHours: 12, actualHours: 0, dueDate: '2025-02-15', status: 'in_progress' },
  { id: 51, name: 'Add webhook integrations', completed: false, projectId: 3, projectName: 'API Integration & Migration', priority: 'high', assignedTo: 'Chris Anderson', estimatedHours: 16, actualHours: 0, dueDate: '2025-02-25', status: 'pending' },
  { id: 52, name: 'Set up API monitoring', completed: false, projectId: 3, projectName: 'API Integration & Migration', priority: 'low', assignedTo: 'Robert Taylor', estimatedHours: 10, actualHours: 0, dueDate: '2025-03-05', status: 'pending' },

  // Additional Data Analytics Dashboard tasks
  { id: 53, name: 'Create data export formats', completed: false, projectId: 4, projectName: 'Data Analytics Dashboard', priority: 'medium', assignedTo: 'Anna Martinez', estimatedHours: 14, actualHours: 0, dueDate: '2025-04-15', status: 'pending' },
  { id: 54, name: 'Implement real-time updates', completed: false, projectId: 4, projectName: 'Data Analytics Dashboard', priority: 'high', assignedTo: 'Kevin Lee', estimatedHours: 18, actualHours: 0, dueDate: '2025-04-25', status: 'pending' },
  { id: 55, name: 'Add custom dashboard widgets', completed: false, projectId: 4, projectName: 'Data Analytics Dashboard', priority: 'medium', assignedTo: 'Rachel White', estimatedHours: 12, actualHours: 0, dueDate: '2025-05-01', status: 'pending' },
  { id: 56, name: 'Create scheduled reports', completed: false, projectId: 4, projectName: 'Data Analytics Dashboard', priority: 'low', assignedTo: 'Anna Martinez', estimatedHours: 10, actualHours: 0, dueDate: '2025-05-10', status: 'pending' },

  // Additional Security Audit & Compliance tasks
  { id: 57, name: 'Conduct security code review', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', priority: 'high', assignedTo: 'Mark Thompson', estimatedHours: 20, actualHours: 0, dueDate: '2025-04-20', status: 'pending' },
  { id: 58, name: 'Implement data encryption', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', priority: 'high', assignedTo: 'Jessica Chen', estimatedHours: 16, actualHours: 0, dueDate: '2025-05-01', status: 'pending' },
  { id: 59, name: 'Set up security monitoring', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', priority: 'medium', assignedTo: 'Mark Thompson', estimatedHours: 14, actualHours: 0, dueDate: '2025-05-10', status: 'pending' },
  { id: 60, name: 'Create incident response plan', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', priority: 'medium', assignedTo: 'Jessica Chen', estimatedHours: 12, actualHours: 0, dueDate: '2025-05-15', status: 'pending' },

  // Additional Performance Optimization tasks
  { id: 61, name: 'Optimize API response times', completed: false, projectId: 6, projectName: 'Performance Optimization', priority: 'high', assignedTo: 'Tom Wilson', estimatedHours: 18, actualHours: 0, dueDate: '2025-04-01', status: 'pending' },
  { id: 62, name: 'Implement CDN integration', completed: false, projectId: 6, projectName: 'Performance Optimization', priority: 'medium', assignedTo: 'Amy Rodriguez', estimatedHours: 12, actualHours: 0, dueDate: '2025-04-10', status: 'pending' },
  { id: 63, name: 'Add database indexing', completed: false, projectId: 6, projectName: 'Performance Optimization', priority: 'high', assignedTo: 'Brian Kim', estimatedHours: 16, actualHours: 0, dueDate: '2025-04-20', status: 'pending' },
  { id: 64, name: 'Optimize image compression', completed: false, projectId: 6, projectName: 'Performance Optimization', priority: 'low', assignedTo: 'Tom Wilson', estimatedHours: 8, actualHours: 0, dueDate: '2025-04-25', status: 'pending' },

  // New Project: Customer Support Portal
  { id: 65, name: 'Design ticket management system', completed: true, projectId: 7, projectName: 'Customer Support Portal', priority: 'high', assignedTo: 'Alice Johnson', estimatedHours: 20, actualHours: 18, dueDate: '2025-01-15', status: 'completed' },
  { id: 66, name: 'Implement knowledge base', completed: true, projectId: 7, projectName: 'Customer Support Portal', priority: 'medium', assignedTo: 'Bob Smith', estimatedHours: 16, actualHours: 14, dueDate: '2025-01-25', status: 'completed' },
  { id: 67, name: 'Create user dashboard', completed: false, projectId: 7, projectName: 'Customer Support Portal', priority: 'high', assignedTo: 'Carol Davis', estimatedHours: 24, actualHours: 0, dueDate: '2025-02-10', status: 'in_progress' },
  { id: 68, name: 'Add live chat feature', completed: false, projectId: 7, projectName: 'Customer Support Portal', priority: 'medium', assignedTo: 'Alice Johnson', estimatedHours: 18, actualHours: 0, dueDate: '2025-02-20', status: 'pending' },
  { id: 69, name: 'Implement ticket escalation', completed: false, projectId: 7, projectName: 'Customer Support Portal', priority: 'high', assignedTo: 'Bob Smith', estimatedHours: 14, actualHours: 0, dueDate: '2025-03-01', status: 'pending' },
  { id: 70, name: 'Create reporting analytics', completed: false, projectId: 7, projectName: 'Customer Support Portal', priority: 'low', assignedTo: 'Carol Davis', estimatedHours: 12, actualHours: 0, dueDate: '2025-03-10', status: 'pending' },

  // New Project: IoT Device Management
  { id: 71, name: 'Design device registration system', completed: true, projectId: 8, projectName: 'IoT Device Management', priority: 'high', assignedTo: 'David Lee', estimatedHours: 16, actualHours: 15, dueDate: '2025-02-01', status: 'completed' },
  { id: 72, name: 'Implement device monitoring', completed: false, projectId: 8, projectName: 'IoT Device Management', priority: 'high', assignedTo: 'Eva Martinez', estimatedHours: 20, actualHours: 0, dueDate: '2025-02-15', status: 'in_progress' },
  { id: 73, name: 'Create firmware update system', completed: false, projectId: 8, projectName: 'IoT Device Management', priority: 'medium', assignedTo: 'Frank Wilson', estimatedHours: 18, actualHours: 0, dueDate: '2025-02-28', status: 'pending' },
  { id: 74, name: 'Add remote device control', completed: false, projectId: 8, projectName: 'IoT Device Management', priority: 'high', assignedTo: 'David Lee', estimatedHours: 22, actualHours: 0, dueDate: '2025-03-10', status: 'pending' },
  { id: 75, name: 'Implement device analytics', completed: false, projectId: 8, projectName: 'IoT Device Management', priority: 'medium', assignedTo: 'Eva Martinez', estimatedHours: 14, actualHours: 0, dueDate: '2025-03-20', status: 'pending' },

  // New Project: Learning Management System
  { id: 76, name: 'Design course creation interface', completed: true, projectId: 9, projectName: 'Learning Management System', priority: 'high', assignedTo: 'Grace Kim', estimatedHours: 24, actualHours: 22, dueDate: '2025-01-20', status: 'completed' },
  { id: 77, name: 'Implement video streaming', completed: false, projectId: 9, projectName: 'Learning Management System', priority: 'high', assignedTo: 'Henry Chen', estimatedHours: 20, actualHours: 0, dueDate: '2025-02-05', status: 'in_progress' },
  { id: 78, name: 'Create quiz system', completed: false, projectId: 9, projectName: 'Learning Management System', priority: 'medium', assignedTo: 'Iris Patel', estimatedHours: 16, actualHours: 0, dueDate: '2025-02-15', status: 'pending' },
  { id: 79, name: 'Add progress tracking', completed: false, projectId: 9, projectName: 'Learning Management System', priority: 'medium', assignedTo: 'Grace Kim', estimatedHours: 14, actualHours: 0, dueDate: '2025-02-25', status: 'pending' },
  { id: 80, name: 'Implement certification system', completed: false, projectId: 9, projectName: 'Learning Management System', priority: 'low', assignedTo: 'Henry Chen', estimatedHours: 12, actualHours: 0, dueDate: '2025-03-05', status: 'pending' },

  // New Project: Supply Chain Optimization
  { id: 81, name: 'Design inventory management', completed: true, projectId: 10, projectName: 'Supply Chain Optimization', priority: 'high', assignedTo: 'Jack Robinson', estimatedHours: 18, actualHours: 16, dueDate: '2025-02-10', status: 'completed' },
  { id: 82, name: 'Implement demand forecasting', completed: false, projectId: 10, projectName: 'Supply Chain Optimization', priority: 'high', assignedTo: 'Kate Thompson', estimatedHours: 22, actualHours: 0, dueDate: '2025-02-25', status: 'in_progress' },
  { id: 83, name: 'Create supplier portal', completed: false, projectId: 10, projectName: 'Supply Chain Optimization', priority: 'medium', assignedTo: 'Liam Garcia', estimatedHours: 16, actualHours: 0, dueDate: '2025-03-05', status: 'pending' },
  { id: 84, name: 'Add automated ordering', completed: false, projectId: 10, projectName: 'Supply Chain Optimization', priority: 'medium', assignedTo: 'Jack Robinson', estimatedHours: 14, actualHours: 0, dueDate: '2025-03-15', status: 'pending' },
  { id: 85, name: 'Implement tracking system', completed: false, projectId: 10, projectName: 'Supply Chain Optimization', priority: 'low', assignedTo: 'Kate Thompson', estimatedHours: 12, actualHours: 0, dueDate: '2025-03-25', status: 'pending' }
];

// Derived projects from tasks - this simulates how projects would be extracted from task API
export const dummyProjects = [
  {
    id: 1,
    name: 'E-Commerce Platform Redesign',
    description: 'Complete overhaul of the company e-commerce platform with modern UI/UX, improved performance, and mobile-first design.',
    status: 'active',
    progress: 75,
    tasks: [
      { id: 1, name: 'Design new homepage layout', completed: true },
      { id: 2, name: 'Implement responsive navigation', completed: true },
      { id: 3, name: 'Create product catalog pages', completed: true },
      { id: 4, name: 'Build shopping cart functionality', completed: false },
      { id: 5, name: 'Implement payment processing', completed: false },
      { id: 6, name: 'Add user account management', completed: false }
    ],
    totalHours: 120.5,
    estimatedHours: 160,
    priority: 'high',
    startDate: '2025-01-15',
    endDate: '2025-03-15',
    assignedUsers: ['John Doe', 'Jane Smith', 'Mike Johnson'],
    tags: ['frontend', 'backend', 'design', 'ecommerce']
  },
  {
    id: 2,
    name: 'Mobile App Development',
    description: 'Native iOS and Android application for customer engagement with real-time notifications and offline capabilities.',
    status: 'active',
    progress: 45,
    tasks: [
      { id: 7, name: 'Set up development environment', completed: true },
      { id: 8, name: 'Design app architecture', completed: true },
      { id: 9, name: 'Implement user authentication', completed: true },
      { id: 10, name: 'Create main navigation', completed: true },
      { id: 11, name: 'Build notification system', completed: false },
      { id: 12, name: 'Implement offline sync', completed: false },
      { id: 13, name: 'Add push notifications', completed: false }
    ],
    totalHours: 89.25,
    estimatedHours: 200,
    priority: 'high',
    startDate: '2025-02-01',
    endDate: '2025-05-01',
    assignedUsers: ['Sarah Wilson', 'David Brown', 'Lisa Garcia'],
    tags: ['mobile', 'ios', 'android', 'notifications']
  },
  {
    id: 3,
    name: 'API Integration & Migration',
    description: 'Migrate legacy system to microservices architecture and integrate with third-party APIs for enhanced functionality.',
    status: 'completed',
    progress: 100,
    tasks: [
      { id: 14, name: 'Analyze legacy system', completed: true },
      { id: 15, name: 'Design microservices architecture', completed: true },
      { id: 16, name: 'Implement authentication service', completed: true },
      { id: 17, name: 'Create user management API', completed: true },
      { id: 18, name: 'Integrate payment gateway', completed: true },
      { id: 19, name: 'Migrate user data', completed: true },
      { id: 20, name: 'Perform system testing', completed: true }
    ],
    totalHours: 156.75,
    estimatedHours: 150,
    priority: 'medium',
    startDate: '2024-11-01',
    endDate: '2025-01-31',
    assignedUsers: ['Robert Taylor', 'Emily Davis', 'Chris Anderson'],
    tags: ['backend', 'api', 'migration', 'microservices']
  },
  {
    id: 4,
    name: 'Data Analytics Dashboard',
    description: 'Build comprehensive analytics dashboard for business intelligence with real-time data visualization and reporting.',
    status: 'active',
    progress: 30,
    tasks: [
      { id: 21, name: 'Gather requirements', completed: true },
      { id: 22, name: 'Design dashboard layout', completed: true },
      { id: 23, name: 'Set up data pipeline', completed: false },
      { id: 24, name: 'Implement chart components', completed: false },
      { id: 25, name: 'Create report generation', completed: false },
      { id: 26, name: 'Add export functionality', completed: false }
    ],
    totalHours: 42.0,
    estimatedHours: 140,
    priority: 'medium',
    startDate: '2025-03-01',
    endDate: '2025-04-30',
    assignedUsers: ['Anna Martinez', 'Kevin Lee', 'Rachel White'],
    tags: ['analytics', 'dashboard', 'data', 'visualization']
  },
  {
    id: 5,
    name: 'Security Audit & Compliance',
    description: 'Comprehensive security assessment and implementation of compliance measures for data protection and regulatory requirements.',
    status: 'pending',
    progress: 0,
    tasks: [
      { id: 27, name: 'Review security policies', completed: false },
      { id: 28, name: 'Conduct vulnerability assessment', completed: false },
      { id: 29, name: 'Implement encryption standards', completed: false },
      { id: 30, name: 'Set up access controls', completed: false },
      { id: 31, name: 'Create compliance documentation', completed: false },
      { id: 32, name: 'Perform penetration testing', completed: false }
    ],
    totalHours: 0,
    estimatedHours: 80,
    priority: 'high',
    startDate: '2025-04-01',
    endDate: '2025-05-15',
    assignedUsers: ['Mark Thompson', 'Jessica Chen'],
    tags: ['security', 'compliance', 'audit', 'regulatory']
  },
  {
    id: 6,
    name: 'Performance Optimization',
    description: 'System-wide performance improvements including database optimization, caching implementation, and code refactoring.',
    status: 'active',
    progress: 60,
    tasks: [
      { id: 33, name: 'Analyze performance bottlenecks', completed: true },
      { id: 34, name: 'Optimize database queries', completed: true },
      { id: 35, name: 'Implement caching layer', completed: true },
      { id: 36, name: 'Refactor slow code sections', completed: false },
      { id: 37, name: 'Optimize frontend assets', completed: false },
      { id: 38, name: 'Set up monitoring tools', completed: false }
    ],
    totalHours: 67.5,
    estimatedHours: 110,
    priority: 'medium',
    startDate: '2025-02-15',
    endDate: '2025-03-31',
    assignedUsers: ['Tom Wilson', 'Amy Rodriguez', 'Brian Kim'],
    tags: ['performance', 'optimization', 'database', 'caching']
  }
];

// Helper functions for working with dummy tasks and derived projects

// Derive projects from tasks (simulates how projects would be extracted from task API)
export const getProjectsFromTasks = () => {
  const projectMap = new Map();

  dummyTasks.forEach(task => {
    if (!projectMap.has(task.projectId)) {
      const projectTasks = dummyTasks.filter(t => t.projectId === task.projectId);
      const completedTasks = projectTasks.filter(t => t.completed);
      const totalHours = projectTasks.reduce((sum, t) => sum + t.actualHours, 0);
      const estimatedHours = projectTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
      const progress = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;

      // Determine project status based on tasks
      let status = 'pending';
      if (completedTasks.length === projectTasks.length) {
        status = 'completed';
      } else if (completedTasks.length > 0) {
        status = 'active';
      }

      projectMap.set(task.projectId, {
        id: task.projectId,
        name: task.projectName,
        description: `Project derived from ${projectTasks.length} tasks`,
        status,
        progress,
        tasks: projectTasks.map(t => ({ id: t.id, name: t.name, completed: t.completed })),
        totalHours,
        estimatedHours,
        priority: projectTasks.some(t => t.priority === 'high') ? 'high' : 'medium',
        startDate: projectTasks.reduce((earliest, t) => !earliest || new Date(t.dueDate) < new Date(earliest) ? t.dueDate : earliest, null),
        endDate: projectTasks.reduce((latest, t) => !latest || new Date(t.dueDate) > new Date(latest) ? t.dueDate : latest, null),
        assignedUsers: [...new Set(projectTasks.map(t => t.assignedTo))],
        tags: []
      });
    }
  });

  return Array.from(projectMap.values());
};

// Task filtering functions
export const getTasksByProject = (projectId) => {
  return dummyTasks.filter(task => task.projectId === projectId);
};

export const getTasksByStatus = (status) => {
  return dummyTasks.filter(task => task.status === status);
};

export const getTasksByPriority = (priority) => {
  return dummyTasks.filter(task => task.priority === priority);
};

export const getCompletedTasks = () => {
  return dummyTasks.filter(task => task.completed);
};

export const getPendingTasks = () => {
  return dummyTasks.filter(task => !task.completed);
};

// Project functions (for backward compatibility and derived projects)
export const getProjectsByStatus = (status) => {
  return getProjectsFromTasks().filter(project => project.status === status);
};

export const getActiveProjects = () => {
  return getProjectsByStatus('active');
};

export const getCompletedProjects = () => {
  return getProjectsByStatus('completed');
};

export const getPendingProjects = () => {
  return getProjectsByStatus('pending');
};

export const getProjectById = (id) => {
  return getProjectsFromTasks().find(project => project.id === id);
};

export const getProjectsByPriority = (priority) => {
  return getProjectsFromTasks().filter(project => project.priority === priority);
};

export const getTotalProjectStats = () => {
  const projects = getProjectsFromTasks();
  const totalProjects = projects.length;
  const activeProjects = getActiveProjects().length;
  const completedProjects = getCompletedProjects().length;
  const totalHours = projects.reduce((sum, project) => sum + project.totalHours, 0);
  const completedTasks = getCompletedTasks().length;
  const totalTasks = dummyTasks.length;

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    totalHours: totalHours.toFixed(1),
    completedTasks,
    totalTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  };
};
