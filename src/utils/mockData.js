/**
 * Mock data to use when API calls fail
 */

export const mockProjects = [
  {
    id: 'mock-project-1',
    title: 'Research on Machine Learning Applications',
    description: 'This project focuses on applying machine learning techniques to solve real-world problems.',
    department: 'Computer Science',
    skillsRequired: ['Python', 'Machine Learning', 'Data Analysis'],
    duration: '3 months',
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    facultyID: 'mock-faculty-1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mock-project-2',
    title: 'Environmental Impact Study',
    description: 'Research on the environmental impact of urban development in metropolitan areas.',
    department: 'Environmental Science',
    skillsRequired: ['Data Collection', 'Statistical Analysis', 'Report Writing'],
    duration: '6 months',
    applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    facultyID: 'mock-faculty-2',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockApplications = [
  {
    id: 'mock-application-1',
    studentID: 'current-user',
    projectID: 'mock-project-1',
    statement: 'I am interested in this project because...',
    status: 'Faculty Review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockUsers = [
  {
    id: 'mock-faculty-1',
    name: 'Dr. Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Faculty',
    department: 'Computer Science'
  },
  {
    id: 'mock-faculty-2',
    name: 'Dr. John Doe',
    email: 'john.doe@example.com',
    role: 'Faculty',
    department: 'Environmental Science'
  }
];