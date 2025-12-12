// Data Provider for Zoho Hours Register
// Centralizes all data management and business logic

// Import dummy data
const dummyTasks = [
  // E-Commerce Platform Redesign tasks
  { id: 1, name: 'Design new homepage layout', completed: true, projectId: 1, projectName: 'E-Commerce Platform Redesign', zohoTaskUrl: 'https://projects.zoho.com/portal/E-Commerce%20Platform%20Redesign/tasks/1', priority: 'high', assignedTo: 'John Doe', estimatedHours: 8, actualHours: 6, dueDate: '2025-01-20', status: 'completed' },
  { id: 2, name: 'Implement responsive navigation', completed: true, projectId: 1, projectName: 'E-Commerce Platform Redesign', zohoTaskUrl: 'https://projects.zoho.com/portal/E-Commerce%20Platform%20Redesign/tasks/1', priority: 'high', assignedTo: 'Jane Smith', estimatedHours: 12, actualHours: 10, dueDate: '2025-01-25', status: 'completed' },
  { id: 3, name: 'Create product catalog pages', completed: true, projectId: 1, projectName: 'E-Commerce Platform Redesign', zohoTaskUrl: 'https://projects.zoho.com/portal/E-Commerce%20Platform%20Redesign/tasks/1', priority: 'medium', assignedTo: 'Mike Johnson', estimatedHours: 16, actualHours: 14, dueDate: '2025-02-01', status: 'completed' },
  { id: 4, name: 'Build shopping cart functionality', completed: false, projectId: 1, projectName: 'E-Commerce Platform Redesign', zohoTaskUrl: 'https://projects.zoho.com/portal/E-Commerce%20Platform%20Redesign/tasks/1', priority: 'high', assignedTo: 'John Doe', estimatedHours: 20, actualHours: 0, dueDate: '2025-02-15', status: 'in_progress' },
  { id: 5, name: 'Implement payment processing', completed: false, projectId: 1, projectName: 'E-Commerce Platform Redesign', zohoTaskUrl: 'https://projects.zoho.com/portal/E-Commerce%20Platform%20Redesign/tasks/1', priority: 'high', assignedTo: 'Jane Smith', estimatedHours: 24, actualHours: 0, dueDate: '2025-02-28', status: 'pending' },
  { id: 6, name: 'Add user account management', completed: false, projectId: 1, projectName: 'E-Commerce Platform Redesign', zohoTaskUrl: 'https://projects.zoho.com/portal/E-Commerce%20Platform%20Redesign/tasks/1', priority: 'medium', assignedTo: 'Mike Johnson', estimatedHours: 18, actualHours: 0, dueDate: '2025-03-10', status: 'pending' },
  { id: 39, name: 'Design mobile responsive layouts', completed: true, projectId: 1, projectName: 'E-Commerce Platform Redesign', zohoTaskUrl: 'https://projects.zoho.com/portal/E-Commerce%20Platform%20Redesign/tasks/1', priority: 'high', assignedTo: 'John Doe', estimatedHours: 16, actualHours: 14, dueDate: '2025-02-10', status: 'completed' },
  { id: 40, name: 'Implement lazy loading for images', completed: false, projectId: 1, projectName: 'E-Commerce Platform Redesign', zohoTaskUrl: 'https://projects.zoho.com/portal/E-Commerce%20Platform%20Redesign/tasks/1', priority: 'medium', assignedTo: 'Jane Smith', estimatedHours: 10, actualHours: 0, dueDate: '2025-02-20', status: 'in_progress' },
  { id: 41, name: 'Add accessibility features', completed: false, projectId: 1, projectName: 'E-Commerce Platform Redesign', zohoTaskUrl: 'https://projects.zoho.com/portal/E-Commerce%20Platform%20Redesign/tasks/1', priority: 'medium', assignedTo: 'Mike Johnson', estimatedHours: 12, actualHours: 0, dueDate: '2025-02-25', status: 'pending' },
  { id: 42, name: 'Create product comparison feature', completed: false, projectId: 1, projectName: 'E-Commerce Platform Redesign', zohoTaskUrl: 'https://projects.zoho.com/portal/E-Commerce%20Platform%20Redesign/tasks/1', priority: 'low', assignedTo: 'John Doe', estimatedHours: 14, actualHours: 0, dueDate: '2025-03-05', status: 'pending' },
  { id: 43, name: 'Implement search with filters', completed: false, projectId: 1, projectName: 'E-Commerce Platform Redesign', zohoTaskUrl: 'https://projects.zoho.com/portal/E-Commerce%20Platform%20Redesign/tasks/1', priority: 'high', assignedTo: 'Jane Smith', estimatedHours: 18, actualHours: 0, dueDate: '2025-03-15', status: 'pending' },

  // Mobile App Development tasks
  { id: 7, name: 'Set up development environment', completed: true, projectId: 2, projectName: 'Mobile App Development', zohoTaskUrl: 'https://projects.zoho.com/portal/Mobile%20App%20Development/tasks/1', priority: 'high', assignedTo: 'Sarah Wilson', estimatedHours: 4, actualHours: 3, dueDate: '2025-02-05', status: 'completed' },
  { id: 8, name: 'Design app architecture', completed: true, projectId: 2, projectName: 'Mobile App Development', zohoTaskUrl: 'https://projects.zoho.com/portal/Mobile%20App%20Development/tasks/1', priority: 'high', assignedTo: 'David Brown', estimatedHours: 8, actualHours: 7, dueDate: '2025-02-10', status: 'completed' },
  { id: 9, name: 'Implement user authentication', completed: true, projectId: 2, projectName: 'Mobile App Development', zohoTaskUrl: 'https://projects.zoho.com/portal/Mobile%20App%20Development/tasks/1', priority: 'high', assignedTo: 'Lisa Garcia', estimatedHours: 12, actualHours: 9, dueDate: '2025-02-20', status: 'completed' },
  { id: 10, name: 'Create main navigation', completed: true, projectId: 2, projectName: 'Mobile App Development', zohoTaskUrl: 'https://projects.zoho.com/portal/Mobile%20App%20Development/tasks/1', priority: 'medium', assignedTo: 'Sarah Wilson', estimatedHours: 10, actualHours: 8, dueDate: '2025-02-25', status: 'completed' },
  { id: 11, name: 'Build notification system', completed: false, projectId: 2, projectName: 'Mobile App Development', zohoTaskUrl: 'https://projects.zoho.com/portal/Mobile%20App%20Development/tasks/1', priority: 'medium', assignedTo: 'David Brown', estimatedHours: 16, actualHours: 0, dueDate: '2025-03-15', status: 'in_progress' },
  { id: 12, name: 'Implement offline sync', completed: false, projectId: 2, projectName: 'Mobile App Development', zohoTaskUrl: 'https://projects.zoho.com/portal/Mobile%20App%20Development/tasks/1', priority: 'high', assignedTo: 'Lisa Garcia', estimatedHours: 20, actualHours: 0, dueDate: '2025-04-01', status: 'pending' },
  { id: 13, name: 'Add push notifications', completed: false, projectId: 2, projectName: 'Mobile App Development', zohoTaskUrl: 'https://projects.zoho.com/portal/Mobile%20App%20Development/tasks/1', priority: 'medium', assignedTo: 'Sarah Wilson', estimatedHours: 14, actualHours: 0, dueDate: '2025-04-15', status: 'pending' },
  { id: 44, name: 'Design offline data sync', completed: true, projectId: 2, projectName: 'Mobile App Development', zohoTaskUrl: 'https://projects.zoho.com/portal/Mobile%20App%20Development/tasks/1', priority: 'high', assignedTo: 'David Brown', estimatedHours: 20, actualHours: 18, dueDate: '2025-03-20', status: 'completed' },
  { id: 45, name: 'Implement biometric authentication', completed: false, projectId: 2, projectName: 'Mobile App Development', zohoTaskUrl: 'https://projects.zoho.com/portal/Mobile%20App%20Development/tasks/1', priority: 'medium', assignedTo: 'Lisa Garcia', estimatedHours: 16, actualHours: 0, dueDate: '2025-03-30', status: 'in_progress' },
  { id: 46, name: 'Add geolocation features', completed: false, projectId: 2, projectName: 'Mobile App Development', zohoTaskUrl: 'https://projects.zoho.com/portal/Mobile%20App%20Development/tasks/1', priority: 'medium', assignedTo: 'Sarah Wilson', estimatedHours: 14, actualHours: 0, dueDate: '2025-04-10', status: 'pending' },
  { id: 47, name: 'Create in-app purchase system', completed: false, projectId: 2, projectName: 'Mobile App Development', zohoTaskUrl: 'https://projects.zoho.com/portal/Mobile%20App%20Development/tasks/1', priority: 'high', assignedTo: 'David Brown', estimatedHours: 22, actualHours: 0, dueDate: '2025-04-20', status: 'pending' },
  { id: 48, name: 'Implement app analytics', completed: false, projectId: 2, projectName: 'Mobile App Development', zohoTaskUrl: 'https://projects.zoho.com/portal/Mobile%20App%20Development/tasks/1', priority: 'low', assignedTo: 'Lisa Garcia', estimatedHours: 10, actualHours: 0, dueDate: '2025-04-25', status: 'pending' },

  // API Integration & Migration tasks
  { id: 14, name: 'Analyze legacy system', completed: true, projectId: 3, projectName: 'API Integration & Migration', zohoTaskUrl: 'https://projects.zoho.com/portal/API%20Integration%20&%20Migration/tasks/1', priority: 'high', assignedTo: 'Robert Taylor', estimatedHours: 16, actualHours: 14, dueDate: '2024-11-15', status: 'completed' },
  { id: 15, name: 'Design microservices architecture', completed: true, projectId: 3, projectName: 'API Integration & Migration', zohoTaskUrl: 'https://projects.zoho.com/portal/API%20Integration%20&%20Migration/tasks/1', priority: 'high', assignedTo: 'Emily Davis', estimatedHours: 20, actualHours: 18, dueDate: '2024-12-01', status: 'completed' },
  { id: 16, name: 'Implement authentication service', completed: true, projectId: 3, projectName: 'API Integration & Migration', zohoTaskUrl: 'https://projects.zoho.com/portal/API%20Integration%20&%20Migration/tasks/1', priority: 'high', assignedTo: 'Chris Anderson', estimatedHours: 24, actualHours: 22, dueDate: '2024-12-15', status: 'completed' },
  { id: 17, name: 'Create user management API', completed: true, projectId: 3, projectName: 'API Integration & Migration', zohoTaskUrl: 'https://projects.zoho.com/portal/API%20Integration%20&%20Migration/tasks/1', priority: 'medium', assignedTo: 'Robert Taylor', estimatedHours: 18, actualHours: 16, dueDate: '2024-12-30', status: 'completed' },
  { id: 18, name: 'Integrate payment gateway', completed: true, projectId: 3, projectName: 'API Integration & Migration', zohoTaskUrl: 'https://projects.zoho.com/portal/API%20Integration%20&%20Migration/tasks/1', priority: 'high', assignedTo: 'Emily Davis', estimatedHours: 16, actualHours: 15, dueDate: '2025-01-15', status: 'completed' },
  { id: 19, name: 'Migrate user data', completed: true, projectId: 3, projectName: 'API Integration & Migration', zohoTaskUrl: 'https://projects.zoho.com/portal/API%20Integration%20&%20Migration/tasks/1', priority: 'high', assignedTo: 'Chris Anderson', estimatedHours: 12, actualHours: 10, dueDate: '2025-01-25', status: 'completed' },
  { id: 20, name: 'Perform system testing', completed: true, projectId: 3, projectName: 'API Integration & Migration', zohoTaskUrl: 'https://projects.zoho.com/portal/API%20Integration%20&%20Migration/tasks/1', priority: 'medium', assignedTo: 'Robert Taylor', estimatedHours: 8, actualHours: 7, dueDate: '2025-01-30', status: 'completed' },
  { id: 49, name: 'Create API documentation', completed: true, projectId: 3, projectName: 'API Integration & Migration', zohoTaskUrl: 'https://projects.zoho.com/portal/API%20Integration%20&%20Migration/tasks/1', priority: 'medium', assignedTo: 'Robert Taylor', estimatedHours: 8, actualHours: 6, dueDate: '2025-02-05', status: 'completed' },
  { id: 50, name: 'Implement rate limiting', completed: false, projectId: 3, projectName: 'API Integration & Migration', zohoTaskUrl: 'https://projects.zoho.com/portal/API%20Integration%20&%20Migration/tasks/1', priority: 'medium', assignedTo: 'Emily Davis', estimatedHours: 12, actualHours: 0, dueDate: '2025-02-15', status: 'in_progress' },
  { id: 51, name: 'Add webhook integrations', completed: false, projectId: 3, projectName: 'API Integration & Migration', zohoTaskUrl: 'https://projects.zoho.com/portal/API%20Integration%20&%20Migration/tasks/1', priority: 'high', assignedTo: 'Chris Anderson', estimatedHours: 16, actualHours: 0, dueDate: '2025-02-25', status: 'pending' },
  { id: 52, name: 'Set up API monitoring', completed: false, projectId: 3, projectName: 'API Integration & Migration', zohoTaskUrl: 'https://projects.zoho.com/portal/API%20Integration%20&%20Migration/tasks/1', priority: 'low', assignedTo: 'Robert Taylor', estimatedHours: 10, actualHours: 0, dueDate: '2025-03-05', status: 'pending' },

  // Data Analytics Dashboard tasks
  { id: 21, name: 'Gather requirements', completed: true, projectId: 4, projectName: 'Data Analytics Dashboard', zohoTaskUrl: 'https://projects.zoho.com/portal/Data%20Analytics%20Dashboard/tasks/1', priority: 'high', assignedTo: 'Anna Martinez', estimatedHours: 8, actualHours: 6, dueDate: '2025-03-05', status: 'completed' },
  { id: 22, name: 'Design dashboard layout', completed: true, projectId: 4, projectName: 'Data Analytics Dashboard', zohoTaskUrl: 'https://projects.zoho.com/portal/Data%20Analytics%20Dashboard/tasks/1', priority: 'medium', assignedTo: 'Kevin Lee', estimatedHours: 12, actualHours: 10, dueDate: '2025-03-10', status: 'completed' },
  { id: 23, name: 'Set up data pipeline', completed: false, projectId: 4, projectName: 'Data Analytics Dashboard', zohoTaskUrl: 'https://projects.zoho.com/portal/Data%20Analytics%20Dashboard/tasks/1', priority: 'high', assignedTo: 'Rachel White', estimatedHours: 20, actualHours: 0, dueDate: '2025-03-25', status: 'in_progress' },
  { id: 24, name: 'Implement chart components', completed: false, projectId: 4, projectName: 'Data Analytics Dashboard', zohoTaskUrl: 'https://projects.zoho.com/portal/Data%20Analytics%20Dashboard/tasks/1', priority: 'medium', assignedTo: 'Anna Martinez', estimatedHours: 16, actualHours: 0, dueDate: '2025-04-01', status: 'pending' },
  { id: 25, name: 'Create report generation', completed: false, projectId: 4, projectName: 'Data Analytics Dashboard', zohoTaskUrl: 'https://projects.zoho.com/portal/Data%20Analytics%20Dashboard/tasks/1', priority: 'medium', assignedTo: 'Kevin Lee', estimatedHours: 14, actualHours: 0, dueDate: '2025-04-10', status: 'pending' },
  { id: 26, name: 'Add export functionality', completed: false, projectId: 4, projectName: 'Data Analytics Dashboard', zohoTaskUrl: 'https://projects.zoho.com/portal/Data%20Analytics%20Dashboard/tasks/1', priority: 'low', assignedTo: 'Rachel White', estimatedHours: 10, actualHours: 0, dueDate: '2025-04-20', status: 'pending' },
  { id: 53, name: 'Create data export formats', completed: false, projectId: 4, projectName: 'Data Analytics Dashboard', zohoTaskUrl: 'https://projects.zoho.com/portal/Data%20Analytics%20Dashboard/tasks/1', priority: 'medium', assignedTo: 'Anna Martinez', estimatedHours: 14, actualHours: 0, dueDate: '2025-04-15', status: 'pending' },
  { id: 54, name: 'Implement real-time updates', completed: false, projectId: 4, projectName: 'Data Analytics Dashboard', zohoTaskUrl: 'https://projects.zoho.com/portal/Data%20Analytics%20Dashboard/tasks/1', priority: 'high', assignedTo: 'Kevin Lee', estimatedHours: 18, actualHours: 0, dueDate: '2025-04-25', status: 'pending' },
  { id: 55, name: 'Add custom dashboard widgets', completed: false, projectId: 4, projectName: 'Data Analytics Dashboard', zohoTaskUrl: 'https://projects.zoho.com/portal/Data%20Analytics%20Dashboard/tasks/1', priority: 'medium', assignedTo: 'Rachel White', estimatedHours: 12, actualHours: 0, dueDate: '2025-05-01', status: 'pending' },
  { id: 56, name: 'Create scheduled reports', completed: false, projectId: 4, projectName: 'Data Analytics Dashboard', zohoTaskUrl: 'https://projects.zoho.com/portal/Data%20Analytics%20Dashboard/tasks/1', priority: 'low', assignedTo: 'Anna Martinez', estimatedHours: 10, actualHours: 0, dueDate: '2025-05-10', status: 'pending' },

  // Security Audit & Compliance tasks
  { id: 27, name: 'Review security policies', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', zohoTaskUrl: 'https://projects.zoho.com/portal/Security%20Audit%20&%20Compliance/tasks/1', priority: 'high', assignedTo: 'Mark Thompson', estimatedHours: 12, actualHours: 0, dueDate: '2025-04-05', status: 'pending' },
  { id: 28, name: 'Conduct vulnerability assessment', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', zohoTaskUrl: 'https://projects.zoho.com/portal/Security%20Audit%20&%20Compliance/tasks/1', priority: 'high', assignedTo: 'Jessica Chen', estimatedHours: 16, actualHours: 0, dueDate: '2025-04-15', status: 'pending' },
  { id: 29, name: 'Implement encryption standards', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', zohoTaskUrl: 'https://projects.zoho.com/portal/Security%20Audit%20&%20Compliance/tasks/1', priority: 'high', assignedTo: 'Mark Thompson', estimatedHours: 20, actualHours: 0, dueDate: '2025-04-25', status: 'pending' },
  { id: 30, name: 'Set up access controls', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', zohoTaskUrl: 'https://projects.zoho.com/portal/Security%20Audit%20&%20Compliance/tasks/1', priority: 'medium', assignedTo: 'Jessica Chen', estimatedHours: 14, actualHours: 0, dueDate: '2025-05-05', status: 'pending' },
  { id: 31, name: 'Create compliance documentation', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', zohoTaskUrl: 'https://projects.zoho.com/portal/Security%20Audit%20&%20Compliance/tasks/1', priority: 'medium', assignedTo: 'Mark Thompson', estimatedHours: 10, actualHours: 0, dueDate: '2025-05-10', status: 'pending' },
  { id: 32, name: 'Perform penetration testing', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', zohoTaskUrl: 'https://projects.zoho.com/portal/Security%20Audit%20&%20Compliance/tasks/1', priority: 'high', assignedTo: 'Jessica Chen', estimatedHours: 18, actualHours: 0, dueDate: '2025-05-15', status: 'pending' },
  { id: 57, name: 'Conduct security code review', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', zohoTaskUrl: 'https://projects.zoho.com/portal/Security%20Audit%20&%20Compliance/tasks/1', priority: 'high', assignedTo: 'Mark Thompson', estimatedHours: 20, actualHours: 0, dueDate: '2025-04-20', status: 'pending' },
  { id: 58, name: 'Implement data encryption', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', zohoTaskUrl: 'https://projects.zoho.com/portal/Security%20Audit%20&%20Compliance/tasks/1', priority: 'high', assignedTo: 'Jessica Chen', estimatedHours: 16, actualHours: 0, dueDate: '2025-05-01', status: 'pending' },
  { id: 59, name: 'Set up security monitoring', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', zohoTaskUrl: 'https://projects.zoho.com/portal/Security%20Audit%20&%20Compliance/tasks/1', priority: 'medium', assignedTo: 'Mark Thompson', estimatedHours: 14, actualHours: 0, dueDate: '2025-05-10', status: 'pending' },
  { id: 60, name: 'Create incident response plan', completed: false, projectId: 5, projectName: 'Security Audit & Compliance', zohoTaskUrl: 'https://projects.zoho.com/portal/Security%20Audit%20&%20Compliance/tasks/1', priority: 'medium', assignedTo: 'Jessica Chen', estimatedHours: 12, actualHours: 0, dueDate: '2025-05-15', status: 'pending' },

  // Performance Optimization tasks
  { id: 33, name: 'Analyze performance bottlenecks', completed: true, projectId: 6, projectName: 'Performance Optimization', zohoTaskUrl: 'https://projects.zoho.com/portal/Performance%20Optimization/tasks/1', priority: 'high', assignedTo: 'Tom Wilson', estimatedHours: 12, actualHours: 10, dueDate: '2025-02-20', status: 'completed' },
  { id: 34, name: 'Optimize database queries', completed: true, projectId: 6, projectName: 'Performance Optimization', zohoTaskUrl: 'https://projects.zoho.com/portal/Performance%20Optimization/tasks/1', priority: 'high', assignedTo: 'Amy Rodriguez', estimatedHours: 16, actualHours: 14, dueDate: '2025-02-28', status: 'completed' },
  { id: 35, name: 'Implement caching layer', completed: true, projectId: 6, projectName: 'Performance Optimization', zohoTaskUrl: 'https://projects.zoho.com/portal/Performance%20Optimization/tasks/1', priority: 'medium', assignedTo: 'Brian Kim', estimatedHours: 14, actualHours: 12, dueDate: '2025-03-10', status: 'completed' },
  { id: 36, name: 'Refactor slow code sections', completed: false, projectId: 6, projectName: 'Performance Optimization', zohoTaskUrl: 'https://projects.zoho.com/portal/Performance%20Optimization/tasks/1', priority: 'medium', assignedTo: 'Tom Wilson', estimatedHours: 20, actualHours: 0, dueDate: '2025-03-20', status: 'in_progress' },
  { id: 37, name: 'Optimize frontend assets', completed: false, projectId: 6, projectName: 'Performance Optimization', zohoTaskUrl: 'https://projects.zoho.com/portal/Performance%20Optimization/tasks/1', priority: 'low', assignedTo: 'Amy Rodriguez', estimatedHours: 8, actualHours: 0, dueDate: '2025-03-25', status: 'pending' },
  { id: 38, name: 'Set up monitoring tools', completed: false, projectId: 6, projectName: 'Performance Optimization', zohoTaskUrl: 'https://projects.zoho.com/portal/Performance%20Optimization/tasks/1', priority: 'medium', assignedTo: 'Brian Kim', estimatedHours: 12, actualHours: 0, dueDate: '2025-03-30', status: 'pending' },
  { id: 61, name: 'Optimize API response times', completed: false, projectId: 6, projectName: 'Performance Optimization', zohoTaskUrl: 'https://projects.zoho.com/portal/Performance%20Optimization/tasks/1', priority: 'high', assignedTo: 'Tom Wilson', estimatedHours: 18, actualHours: 0, dueDate: '2025-04-01', status: 'pending' },
  { id: 62, name: 'Implement CDN integration', completed: false, projectId: 6, projectName: 'Performance Optimization', zohoTaskUrl: 'https://projects.zoho.com/portal/Performance%20Optimization/tasks/1', priority: 'medium', assignedTo: 'Amy Rodriguez', estimatedHours: 12, actualHours: 0, dueDate: '2025-04-10', status: 'pending' },
  { id: 63, name: 'Add database indexing', completed: false, projectId: 6, projectName: 'Performance Optimization', zohoTaskUrl: 'https://projects.zoho.com/portal/Performance%20Optimization/tasks/1', priority: 'high', assignedTo: 'Brian Kim', estimatedHours: 16, actualHours: 0, dueDate: '2025-04-20', status: 'pending' },
  { id: 64, name: 'Optimize image compression', completed: false, projectId: 6, projectName: 'Performance Optimization', zohoTaskUrl: 'https://projects.zoho.com/portal/Performance%20Optimization/tasks/1', priority: 'low', assignedTo: 'Tom Wilson', estimatedHours: 8, actualHours: 0, dueDate: '2025-04-25', status: 'pending' },

  // Customer Support Portal tasks
  { id: 65, name: 'Design ticket management system', completed: true, projectId: 7, projectName: 'Customer Support Portal', zohoTaskUrl: 'https://projects.zoho.com/portal/Customer%20Support%20Portal/tasks/1', priority: 'high', assignedTo: 'Alice Johnson', estimatedHours: 20, actualHours: 18, dueDate: '2025-01-15', status: 'completed' },
  { id: 66, name: 'Implement knowledge base', completed: true, projectId: 7, projectName: 'Customer Support Portal', zohoTaskUrl: 'https://projects.zoho.com/portal/Customer%20Support%20Portal/tasks/1', priority: 'medium', assignedTo: 'Bob Smith', estimatedHours: 16, actualHours: 14, dueDate: '2025-01-25', status: 'completed' },
  { id: 67, name: 'Create user dashboard', completed: false, projectId: 7, projectName: 'Customer Support Portal', zohoTaskUrl: 'https://projects.zoho.com/portal/Customer%20Support%20Portal/tasks/1', priority: 'high', assignedTo: 'Carol Davis', estimatedHours: 24, actualHours: 0, dueDate: '2025-02-10', status: 'in_progress' },
  { id: 68, name: 'Add live chat feature', completed: false, projectId: 7, projectName: 'Customer Support Portal', zohoTaskUrl: 'https://projects.zoho.com/portal/Customer%20Support%20Portal/tasks/1', priority: 'medium', assignedTo: 'Alice Johnson', estimatedHours: 18, actualHours: 0, dueDate: '2025-02-20', status: 'pending' },
  { id: 69, name: 'Implement ticket escalation', completed: false, projectId: 7, projectName: 'Customer Support Portal', zohoTaskUrl: 'https://projects.zoho.com/portal/Customer%20Support%20Portal/tasks/1', priority: 'high', assignedTo: 'Bob Smith', estimatedHours: 14, actualHours: 0, dueDate: '2025-03-01', status: 'pending' },
  { id: 70, name: 'Create reporting analytics', completed: false, projectId: 7, projectName: 'Customer Support Portal', zohoTaskUrl: 'https://projects.zoho.com/portal/Customer%20Support%20Portal/tasks/1', priority: 'low', assignedTo: 'Carol Davis', estimatedHours: 12, actualHours: 0, dueDate: '2025-03-10', status: 'pending' },

  // IoT Device Management tasks
  { id: 71, name: 'Design device registration system', completed: true, projectId: 8, projectName: 'IoT Device Management', zohoTaskUrl: 'https://projects.zoho.com/portal/IoT%20Device%20Management/tasks/1', priority: 'high', assignedTo: 'David Lee', estimatedHours: 16, actualHours: 15, dueDate: '2025-02-01', status: 'completed' },
  { id: 72, name: 'Implement device monitoring', completed: false, projectId: 8, projectName: 'IoT Device Management', zohoTaskUrl: 'https://projects.zoho.com/portal/IoT%20Device%20Management/tasks/1', priority: 'high', assignedTo: 'Eva Martinez', estimatedHours: 20, actualHours: 0, dueDate: '2025-02-15', status: 'in_progress' },
  { id: 73, name: 'Create firmware update system', completed: false, projectId: 8, projectName: 'IoT Device Management', zohoTaskUrl: 'https://projects.zoho.com/portal/IoT%20Device%20Management/tasks/1', priority: 'medium', assignedTo: 'Frank Wilson', estimatedHours: 18, actualHours: 0, dueDate: '2025-02-28', status: 'pending' },
  { id: 74, name: 'Add remote device control', completed: false, projectId: 8, projectName: 'IoT Device Management', zohoTaskUrl: 'https://projects.zoho.com/portal/IoT%20Device%20Management/tasks/1', priority: 'high', assignedTo: 'David Lee', estimatedHours: 22, actualHours: 0, dueDate: '2025-03-10', status: 'pending' },
  { id: 75, name: 'Implement device analytics', completed: false, projectId: 8, projectName: 'IoT Device Management', zohoTaskUrl: 'https://projects.zoho.com/portal/IoT%20Device%20Management/tasks/1', priority: 'medium', assignedTo: 'Eva Martinez', estimatedHours: 14, actualHours: 0, dueDate: '2025-03-20', status: 'pending' },

  // Learning Management System tasks
  { id: 76, name: 'Design course creation interface', completed: true, projectId: 9, projectName: 'Learning Management System', zohoTaskUrl: 'https://projects.zoho.com/portal/Learning%20Management%20System/tasks/1', priority: 'high', assignedTo: 'Grace Kim', estimatedHours: 24, actualHours: 22, dueDate: '2025-01-20', status: 'completed' },
  { id: 77, name: 'Implement video streaming', completed: false, projectId: 9, projectName: 'Learning Management System', zohoTaskUrl: 'https://projects.zoho.com/portal/Learning%20Management%20System/tasks/1', priority: 'high', assignedTo: 'Henry Chen', estimatedHours: 20, actualHours: 0, dueDate: '2025-02-05', status: 'in_progress' },
  { id: 78, name: 'Create quiz system', completed: false, projectId: 9, projectName: 'Learning Management System', zohoTaskUrl: 'https://projects.zoho.com/portal/Learning%20Management%20System/tasks/1', priority: 'medium', assignedTo: 'Iris Patel', estimatedHours: 16, actualHours: 0, dueDate: '2025-02-15', status: 'pending' },
  { id: 79, name: 'Add progress tracking', completed: false, projectId: 9, projectName: 'Learning Management System', zohoTaskUrl: 'https://projects.zoho.com/portal/Learning%20Management%20System/tasks/1', priority: 'medium', assignedTo: 'Grace Kim', estimatedHours: 14, actualHours: 0, dueDate: '2025-02-25', status: 'pending' },
  { id: 80, name: 'Implement certification system', completed: false, projectId: 9, projectName: 'Learning Management System', zohoTaskUrl: 'https://projects.zoho.com/portal/Learning%20Management%20System/tasks/1', priority: 'low', assignedTo: 'Henry Chen', estimatedHours: 12, actualHours: 0, dueDate: '2025-03-05', status: 'pending' },

  // Supply Chain Optimization tasks
  { id: 81, name: 'Design inventory management', completed: true, projectId: 10, projectName: 'Supply Chain Optimization', zohoTaskUrl: 'https://projects.zoho.com/portal/Supply%20Chain%20Optimization/tasks/1', priority: 'high', assignedTo: 'Jack Robinson', estimatedHours: 18, actualHours: 16, dueDate: '2025-02-10', status: 'completed' },
  { id: 82, name: 'Implement demand forecasting', completed: false, projectId: 10, projectName: 'Supply Chain Optimization', zohoTaskUrl: 'https://projects.zoho.com/portal/Supply%20Chain%20Optimization/tasks/1', priority: 'high', assignedTo: 'Kate Thompson', estimatedHours: 22, actualHours: 0, dueDate: '2025-02-25', status: 'in_progress' },
  { id: 83, name: 'Create supplier portal', completed: false, projectId: 10, projectName: 'Supply Chain Optimization', zohoTaskUrl: 'https://projects.zoho.com/portal/Supply%20Chain%20Optimization/tasks/1', priority: 'medium', assignedTo: 'Liam Garcia', estimatedHours: 16, actualHours: 0, dueDate: '2025-03-05', status: 'pending' },
  { id: 84, name: 'Add automated ordering', completed: false, projectId: 10, projectName: 'Supply Chain Optimization', zohoTaskUrl: 'https://projects.zoho.com/portal/Supply%20Chain%20Optimization/tasks/1', priority: 'medium', assignedTo: 'Jack Robinson', estimatedHours: 14, actualHours: 0, dueDate: '2025-03-15', status: 'pending' },
  { id: 85, name: 'Implement tracking system', completed: false, projectId: 10, projectName: 'Supply Chain Optimization', zohoTaskUrl: 'https://projects.zoho.com/portal/Supply%20Chain%20Optimization/tasks/1', priority: 'low', assignedTo: 'Kate Thompson', estimatedHours: 12, actualHours: 0, dueDate: '2025-03-25', status: 'pending' }
];

// Derive projects from tasks
function getProjectsFromTasks() {
  const projectMap = new Map();
  dummyTasks.forEach(task => {
    if (!projectMap.has(task.projectId)) {
      const projectTasks = dummyTasks.filter(t => t.projectId === task.projectId);
      const completedTasks = projectTasks.filter(t => t.completed);
      const totalHours = projectTasks.reduce((sum, t) => sum + t.actualHours, 0);
      const progress = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;

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
        assignedUsers: [...new Set(projectTasks.map(t => t.assignedTo))],
        tags: []
      });
    }
  });
  return Array.from(projectMap.values());
}

function getTotalProjectStats() {
  const projects = getProjectsFromTasks();
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalHours = projects.reduce((sum, project) => sum + project.totalHours, 0);
  const completedTasks = dummyTasks.filter(task => task.completed).length;
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
}

// React-compatible Data Provider
export class DataProvider {
  constructor() {
    this.tasks = dummyTasks;
  }

  // Project Stats - returns plain object
  getProjectStats() {
    const stats = getTotalProjectStats();
    return {
      activeProjects: stats.activeProjects,
      completedTasks: stats.completedTasks,
      totalHours: stats.totalHours,
      totalProjects: stats.totalProjects
    };
  }

  // Projects Manager - returns plain object
  getProjectsManager() {
    return {
      projects: getProjectsFromTasks().map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        tasks: project.tasks.length,
        completedTasks: project.tasks.filter(task => task.completed).length,
        totalHours: project.totalHours,
        status: project.status,
        isActive: project.status === 'active'
      })),

      toggleProject: (projects, projectId) => {
        return projects.map(p =>
          p.id === projectId ? { ...p, isActive: !p.isActive } : p
        );
      }
    };
  }

  // Tasks Manager - returns plain object with helper functions
  getTasksManager() {
    return {
      tasks: this.tasks,

      getFilteredTasks: (filterStatus, filterPriority, filterProject) => {
        let filtered = this.tasks;

        if (filterStatus !== 'all') {
          filtered = filtered.filter(task => task.status === filterStatus);
        }

        if (filterPriority !== 'all') {
          filtered = filtered.filter(task => task.priority === filterPriority);
        }

        if (filterProject !== 'all') {
          filtered = filtered.filter(task => task.projectId === parseInt(filterProject));
        }

        return filtered;
      },

      getProjects: () => {
        const uniqueProjects = new Map();
        this.tasks.forEach(task => {
          if (!uniqueProjects.has(task.projectId)) {
            uniqueProjects.set(task.projectId, { id: task.projectId, name: task.projectName });
          }
        });
        return Array.from(uniqueProjects.values());
      },

      formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      },

      getStatusColor: (status) => {
        switch (status) {
          case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
          case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
          case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
      },

      getPriorityColor: (priority) => {
        switch (priority) {
          case 'high': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
          case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200';
          case 'low': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
      }
    };
  }

  // Checkpoints Manager - React-compatible version
  getCheckpointsManager() {
    return {
      // State would be managed in React component
      addCheckpoint: (checkpoints, setCheckpoints, currentCheckpoint, setCurrentCheckpoint) => {
        const now = new Date();
        const checkpointId = Date.now();

        if (currentCheckpoint) {
          const endedCheckpoint = {
            ...currentCheckpoint,
            endTime: now,
            duration: calculateDuration(currentCheckpoint.startTime, now),
            isRunning: false
          };
          setCheckpoints(prev => [...prev, endedCheckpoint]);
        }

        // Generate default description with timer number
        const timerNumber = checkpoints.length + (currentCheckpoint ? 1 : 0) + 1;
        const newCheckpoint = {
          id: checkpointId,
          startTime: now,
          endTime: null,
          duration: '00:00:00',
          description: `Timer ${timerNumber}`,
          isRunning: true
        };

        setCurrentCheckpoint(newCheckpoint);
      },

      formatTime: (date) => {
        if (!date) return '--:--:--';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      },

      get allCheckpoints() {
        // This will be computed in the React component
        return [];
      }
    };
  }
}

// Helper function for duration calculation
function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return '00:00:00';

  const startDate = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const endDate = typeof endTime === 'string' ? new Date(endTime) : endTime;

  const duration = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((duration % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Create singleton instance
export const dataProvider = new DataProvider();
