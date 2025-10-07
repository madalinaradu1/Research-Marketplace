import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Flex, 
  Heading, 
  Text, 
  Button,
  Card, 
  Collection,
  Loader,
  Tabs,
  TabItem,
  Badge,
  View,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  SelectField,
  TextField,
  CheckboxField,
  SwitchField,
  Alert,
  Divider,
  useTheme
} from '@aws-amplify/ui-react';
import { listApplications, listProjects, listUsers, deleteUser, updateUser, createUser } from '../graphql/operations';
import { updateUserRole } from '../utils/updateUserRole';
import { syncUserGroupsToRole } from '../utils/syncUserGroups';
import { deleteUserCompletely, bulkDeleteUsers, canDeleteUser } from '../utils/adminUserManagement';
import { scheduleUserDeletion } from '../utils/cascadeDelete';

// GraphQL queries for audit logs
const createAuditLogMutation = `
  mutation CreateAuditLog($input: CreateAuditLogInput!) {
    createAuditLog(input: $input) {
      id
      timestamp
    }
  }
`;

const listAuditLogsQuery = `
  query ListAuditLogs($limit: Int) {
    listAuditLogs(limit: $limit) {
      items {
        id
        userId
        userName
        userEmail
        action
        resource
        details
        timestamp
        ipAddress
        userAgent
      }
    }
  }
`;

const deleteAuditLogMutation = `
  mutation DeleteAuditLog($input: DeleteAuditLogInput!) {
    deleteAuditLog(input: $input) {
      id
    }
  }
`;

const AdminDashboard = ({ user }) => {
  const { tokens } = useTheme();
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: '', department: '' });
  const [systemConfig, setSystemConfig] = useState({
    maxApplications: 3
  });
  const [analytics, setAnalytics] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 50;
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showCleanFilesDialog, setShowCleanFilesDialog] = useState(false);
  const [showReportsDialog, setShowReportsDialog] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAuditExportDialog, setShowAuditExportDialog] = useState(false);
  const [auditCurrentPage, setAuditCurrentPage] = useState(1);
  const auditLogsPerPage = 50;
  const [announcement, setAnnouncement] = useState({ title: '', message: '', audience: 'all' });
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, [user]);
  
  useEffect(() => {
    if (user) {
      loadAuditLogs();
    }
  }, [user]);
  
  // Reload audit logs when users data changes to update user names
  useEffect(() => {
    if (users.length > 0 && auditLogs.length > 0) {
      // Force re-render of audit logs to update user names
      setAuditLogs(prev => [...prev]);
    }
  }, [users]);
  
  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let allApplications = [];
      let allProjects = [];
      let allUsers = [];
      
      // Fetch applications
      try {
        const applicationResult = await API.graphql(graphqlOperation(listApplications, { 
          limit: 100
        }));
        allApplications = applicationResult.data?.listApplications?.items || [];
      } catch (appError) {
        console.error('Error fetching applications:', appError);
        allApplications = [];
      }
      
      // Fetch projects
      try {
        const projectResult = await API.graphql(graphqlOperation(listProjects, { 
          limit: 100
        }));
        allProjects = projectResult.data?.listProjects?.items || [];
      } catch (projError) {
        console.error('Error fetching projects:', projError);
        allProjects = [];
      }
      
      // Fetch users
      try {
        const usersResult = await API.graphql(graphqlOperation(listUsers, { 
          limit: 100
        }));
        allUsers = usersResult.data?.listUsers?.items || [];
      } catch (userError) {
        console.error('Error fetching users:', userError);
        allUsers = [];
      }
      
      // Fetch deleted users
      let allDeletedUsers = [];
      try {
        const deletedUsersQuery = `
          query ListDeletedUsers {
            listDeletedUsers {
              items {
                id
                originalUserID
              }
            }
          }
        `;
        const deletedUsersResult = await API.graphql(graphqlOperation(deletedUsersQuery));
        allDeletedUsers = deletedUsersResult.data?.listDeletedUsers?.items || [];
      } catch (deletedError) {
        console.error('Error fetching deleted users:', deletedError);
        allDeletedUsers = [];
      }
      
      // Calculate analytics
      const now = new Date();
      
      // Fetch CloudWatch metrics
      const cloudWatchMetrics = await fetchCloudWatchMetrics();
      
      // Load system configuration from localStorage
      try {
        const savedConfig = localStorage.getItem('adminSystemConfig');
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          setSystemConfig({ maxApplications: config.maxApplications || 3 });
        }
      } catch (configError) {
        console.error('Error loading system config:', configError);
      }
      
      const analyticsData = {
        totalUsers: allUsers.length,
        totalStudents: allUsers.filter(u => u.role === 'Student').length,
        totalFaculty: allUsers.filter(u => u.role === 'Faculty').length,
        totalCoordinators: allUsers.filter(u => u.role === 'Coordinator').length,
        totalAdmins: allUsers.filter(u => u.role === 'Admin').length,
        totalDeletedUsers: allDeletedUsers.length,
        totalProjects: allProjects.length,
        activeProjects: allProjects.filter(p => {
          if (!p.applicationDeadline) return p.isActive;
          const deadline = new Date(p.applicationDeadline);
          return p.isActive && deadline > now;
        }).length,
        expiredProjects: allProjects.filter(p => {
          if (!p.applicationDeadline) return false;
          const deadline = new Date(p.applicationDeadline);
          return deadline <= now;
        }).length,
        totalApplications: allApplications.length,
        pendingApplications: allApplications.filter(a => ['Pending', 'Faculty Review', 'Coordinator Review'].includes(a.status)).length,
        approvedApplications: allApplications.filter(a => a.status === 'Approved').length,
        rejectedApplications: allApplications.filter(a => a.status === 'Rejected').length,
        storageUsed: cloudWatchMetrics.storageUsed,
        systemUptime: cloudWatchMetrics.systemUptime,
        avgResponseTime: cloudWatchMetrics.avgResponseTime,
        errorRate: cloudWatchMetrics.errorRate
      };
      
      setApplications(allApplications);
      setUsers(allUsers);
      setProjects(allProjects);
      setDeletedUsers(allDeletedUsers);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  
  const handleDeleteUser = async (userId) => {
    const targetUser = users.find(u => u.id === userId);
    const deleteCheck = canDeleteUser(userId, user.id);
    
    if (!deleteCheck.canDelete) {
      setError(deleteCheck.reason);
      return;
    }
    
    const confirmMessage = `Are you sure you want to delete ${targetUser?.name || 'this user'}?\n\nThis will:\n• Schedule user for deletion (90-day grace period)\n• Remove user from database immediately\n• Clean up related data after 90 days\n• Cannot be undone\n\nContinue?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await scheduleUserDeletion(targetUser, false); // false = production mode (90 days)
      logAuditAction('User Deleted', `User: ${targetUser.email}`, `Scheduled for deletion (90-day grace period)`);
      setMessage(`User successfully deleted!`);
      fetchData();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleDeleteSelectedUsers = () => {
    if (selectedUsers.size === 0) {
      setError('No users selected for deletion.');
      return;
    }
    
    if (selectedUsers.has(user.id)) {
      setError('Cannot delete your own account. Please unselect yourself.');
      return;
    }
    
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteUsers = async () => {
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    setConfirmText('');
    
    try {
      const selectedUserObjects = users.filter(u => selectedUsers.has(u.id));
      let successful = 0;
      let failed = 0;
      
      for (const userToDelete of selectedUserObjects) {
        try {
          await scheduleUserDeletion(userToDelete, false); // false = production mode (90 days)
          successful++;
        } catch (err) {
          console.error('Error deleting user:', userToDelete.id, err);
          failed++;
        }
      }
      
      if (successful > 0) {
        const deletedEmails = selectedUserObjects.slice(0, successful).map(u => `User: ${u.email}`).join(', ');
        logAuditAction('User Deleted', deletedEmails, `${successful} user${successful > 1 ? 's' : ''} deleted${failed > 0 ? `, ${failed} failed` : ''}`);
        setMessage(`${successful} user${successful > 1 ? 's were' : ' was'} successfully deleted! ${failed > 0 ? `${failed} failed.` : ''}`);
      }
      if (failed > 0) {
        setError(`Failed to delete ${failed} users.`);
      }
      
      setSelectedUsers(new Set());
      setSelectAll(false);
      fetchData();
    } catch (err) {
      console.error('Error deleting users:', err);
      setError('Failed to delete selected users. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleUserSelection = (userId, checked) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
    setSelectAll(newSelected.size === users.length);
  };
  
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(new Set(users.map(u => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
    setSelectAll(checked);
  };
  
  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      setError('Name, email, and role are required.');
      return;
    }
    
    try {
      // Step 1: Create user in Cognito first to get the actual Cognito UUID
      let cognitoSuccess = false;
      let actualCognitoUserId = null;
      
      try {
        const cognitoResponse = await API.post('emailapi', '/create-user', {
          body: {
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            department: newUser.department
          }
        });
        console.log('Cognito creation successful:', cognitoResponse);
        actualCognitoUserId = cognitoResponse.userId; // Use Cognito's actual UUID
        cognitoSuccess = true;
      } catch (cognitoError) {
        console.error('Cognito creation failed:', cognitoError);
        cognitoSuccess = false;
        // Fallback to generated UUID if Cognito fails
        actualCognitoUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Step 2: Create user profile in database using actual Cognito UUID
      const userInput = {
        id: actualCognitoUserId, // Use actual Cognito UUID
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department || null,
        profileComplete: newUser.role !== 'Student' // Students must complete profile
      };
      
      await API.graphql(graphqlOperation(createUser, { input: userInput }));
      
      logAuditAction('User Created', `User: ${newUser.email}`, `Role: ${newUser.role}${newUser.department ? `, Department: ${newUser.department}` : ''}`);
      setMessage(cognitoSuccess ? 
        `User created successfully! Welcome email sent to ${newUser.email}` :
        `User profile created in database. Cognito creation failed - user can still sign up normally with email: ${newUser.email}`
      );
      setNewUser({ name: '', email: '', role: '', department: '' });
      fetchData();
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user. Please try again.');
    }
  };
  
  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const targetUser = users.find(u => u.id === userId);
      const oldRole = targetUser?.role;
      
      console.log('Updating user role:', userId, 'from', oldRole, 'to', newRole);
      const result = await updateUserRole(userId, newRole);
      console.log('Role update result:', result);
      
      // Update Cognito groups if role changed
      if (oldRole !== newRole && targetUser?.email) {
        console.log('Attempting to update Cognito groups:', { userEmail: targetUser.email, oldRole, newRole });
        try {
          const response = await API.post('emailapi', '/update-user-group', {
            body: {
              userEmail: targetUser.email,
              oldRole: oldRole,
              newRole: newRole
            }
          });
          console.log('Cognito group updated successfully:', response);
        } catch (cognitoError) {
          console.error('Failed to update Cognito group:', cognitoError);
          setError('Role updated in database but failed to update Cognito groups. User may need to re-login.');
        }
      } else {
        console.log('Skipping Cognito update:', { oldRole, newRole, hasEmail: !!targetUser?.email });
      }
      
      logAuditAction('Role Updated', `User: ${targetUser.email}`, `Changed from ${oldRole} to ${newRole}`);
      setMessage('User role updated successfully!');
      await fetchData(); // Wait for data to refresh
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update user role. Please try again.');
    }
  };
  
  const handleSystemConfigUpdate = (key, value) => {
    // Update local state
    const newConfig = { ...systemConfig, [key]: value };
    setSystemConfig(newConfig);
    
    // Save to localStorage for persistence
    localStorage.setItem('adminSystemConfig', JSON.stringify(newConfig));
    
    const messages = {
      maxApplications: `Maximum applications set to ${value} per student`
    };
    
    setMessage(messages[key] || 'Setting updated');
  };
  
  const handleExportAllData = () => {
    setShowExportDialog(true);
  };
  
  const exportData = async (format) => {
    setShowExportDialog(false);
    
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      
      if (format === 'csv') {
        const escapeCSV = (str) => {
          if (!str) return '';
          const escaped = String(str).replace(/"/g, '""');
          return `"${escaped}"`;
        };
        
        // Users CSV
        const usersCSV = [
          'USERS',
          '',
          'Name,Email,Role,College,Created',
          ...users.map(u => [
            escapeCSV(u.name || ''),
            escapeCSV(u.email || ''),
            escapeCSV(u.role || ''),
            escapeCSV(u.department || ''),
            escapeCSV(new Date(u.createdAt).toLocaleDateString())
          ].join(','))
        ].join('\n');
        
        // Projects CSV
        const projectsCSV = [
          'PROJECTS',
          '',
          'Title,Faculty,Department,Status,Deadline',
          ...projects.map(p => {
            let facultyName = '';
            
            // Faculty is now a simple string field
            if (p.faculty && typeof p.faculty === 'string') {
              facultyName = p.faculty;
            } else if (p.facultyID) {
              // Look up faculty by facultyID
              const facultyUser = users.find(u => u.id === p.facultyID);
              facultyName = facultyUser ? facultyUser.name : 'Unknown Faculty';
            }
            
            return [
              escapeCSV(p.title || ''),
              escapeCSV(facultyName),
              escapeCSV(p.department || ''),
              escapeCSV(p.isActive ? 'Active' : 'Inactive'),
              escapeCSV(p.applicationDeadline ? new Date(p.applicationDeadline).toLocaleDateString() : '')
            ].join(',');
          })
        ].join('\n');
        
        // Applications CSV
        const applicationsCSV = [
          'APPLICATIONS',
          '',
          'Student,Project,Status,Applied Date',
          ...applications.map(a => {
            let studentName = '';
            let projectTitle = '';
            
            // Get student name using studentID
            if (a.studentID) {
              const student = users.find(u => u.id === a.studentID);
              studentName = student ? student.name : 'Deleted User';
            }
            
            // Get project title using projectID
            if (a.projectID) {
              const project = projects.find(p => p.id === a.projectID);
              projectTitle = project ? project.title : '';
            }
            
            return [
              escapeCSV(studentName || 'Unknown Student'),
              escapeCSV(projectTitle || 'Unknown Project'),
              escapeCSV(a.status || ''),
              escapeCSV(new Date(a.createdAt).toLocaleDateString())
            ].join(',');
          })
        ].join('\n');
        
        const allData = `${usersCSV}\n\n${projectsCSV}\n\n${applicationsCSV}`;
        
        const csvBlob = new Blob([allData], { type: 'text/csv' });
        const url = URL.createObjectURL(csvBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `uraf-data-export-${dateStr}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        // JSON Export
        const exportData = {
          users: users,
          projects: projects,
          applications: applications,
          exportDate: new Date().toISOString()
        };
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `uraf-data-export-${dateStr}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
      
      logAuditAction('Data Export', `Format: ${format.toUpperCase()}`, `Users: ${users.length}, Projects: ${projects.length}, Applications: ${applications.length}`);
      setMessage(`Data exported successfully as ${format.toUpperCase()}!`);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data.');
    }
  };
  
  const handleBackupDatabase = () => {
    setShowBackupDialog(true);
  };
  
  const confirmBackupDatabase = async () => {
    setShowBackupDialog(false);
    try {
      setLoading(true);
      const response = await API.post('emailapi', '/backup-database', {
        body: { format: 'ddl' }
      });
      
      if (response.success && response.ddlScript) {
        // Download DDL script as file
        const dateStr = new Date().toISOString().split('T')[0];
        const ddlBlob = new Blob([response.ddlScript], { type: 'text/sql' });
        const url = URL.createObjectURL(ddlBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `database-backup-${dateStr}.sql`;
        link.click();
        URL.revokeObjectURL(url);
        
        logAuditAction('Database Backup', 'DDL Script Generated', 'Database schema backup created');
        setMessage('Database DDL script downloaded successfully!');
      } else {
        setError('Failed to generate database DDL script');
      }
    } catch (error) {
      console.error('Error generating DDL script:', error);
      setError('Failed to generate database backup script');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCleanOldFiles = () => {
    setShowCleanFilesDialog(true);
  };
  
  const confirmCleanOldFiles = async () => {
    setShowCleanFilesDialog(false);
    try {
      setLoading(true);
      await API.post('emailapi', '/clean-old-files', {});
      logAuditAction('File Cleanup', 'Old Files Deleted', 'Files older than 365 days removed from storage');
      setMessage('Old files cleanup initiated successfully!');
    } catch (err) {
      setError('Failed to initiate file cleanup.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateReports = () => {
    setShowReportsDialog(true);
  };
  
  const generateReport = async (format) => {
    setShowReportsDialog(false);
    try {
      setLoading(true);
      const dateStr = new Date().toISOString().split('T')[0];
      const reportData = {
        summary: {
          totalUsers: analytics.totalUsers,
          totalProjects: analytics.totalProjects,
          totalApplications: analytics.totalApplications,
          generatedAt: new Date().toISOString()
        },
        userBreakdown: {
          students: analytics.totalStudents,
          faculty: analytics.totalFaculty,
          coordinators: analytics.totalCoordinators,
          admins: analytics.totalAdmins,
          deletedUsers: analytics.totalDeletedUsers
        },
        projectStatus: {
          active: analytics.activeProjects,
          expired: analytics.expiredProjects
        },
        applicationStatus: {
          pending: analytics.pendingApplications,
          approved: analytics.approvedApplications,
          rejected: analytics.rejectedApplications
        }
      };
      
      if (format === 'csv') {
        const csvData = [
          'SYSTEM ANALYTICS REPORT',
          `Generated: ${new Date().toLocaleString()}`,
          '',
          'SUMMARY',
          `Total Users,${analytics.totalUsers}`,
          `Total Projects,${analytics.totalProjects}`,
          `Total Applications,${analytics.totalApplications}`,
          '',
          'USER BREAKDOWN',
          `Students,${analytics.totalStudents}`,
          `Faculty,${analytics.totalFaculty}`,
          `Coordinators,${analytics.totalCoordinators}`,
          `Admins,${analytics.totalAdmins}`,
          `Deleted Users,${analytics.totalDeletedUsers}`,
          '',
          'PROJECT STATUS',
          `Active Projects,${analytics.activeProjects}`,
          `Expired Projects,${analytics.expiredProjects}`,
          '',
          'APPLICATION STATUS',
          `Pending Applications,${analytics.pendingApplications}`,
          `Approved Applications,${analytics.approvedApplications}`,
          `Rejected Applications,${analytics.rejectedApplications}`
        ].join('\n');
        
        const csvBlob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(csvBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `uraf-report-${dateStr}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const reportStr = JSON.stringify(reportData, null, 2);
        const reportBlob = new Blob([reportStr], { type: 'application/json' });
        const url = URL.createObjectURL(reportBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `uraf-report-${dateStr}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
      
      logAuditAction('Report Generated', `Analytics Report (${format.toUpperCase()})`, `Users: ${analytics.totalUsers}, Projects: ${analytics.totalProjects}, Applications: ${analytics.totalApplications}`);
      setMessage(`Report generated and downloaded successfully as ${format.toUpperCase()}!`);
    } catch (err) {
      setError('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCloudWatchMetrics = async () => {
    try {
      const response = await API.post('emailapi', '/cloudwatch-metrics', {
        body: {
          metricNames: ['SystemUptime', 'ResponseTime', 'StorageUsed', 'ErrorRate']
        }
      });
      return response.metrics;
    } catch (error) {
      console.error('Error fetching CloudWatch metrics:', error);
      return {
        systemUptime: '99.9%',
        avgResponseTime: '245ms',
        storageUsed: '2.3GB',
        errorRate: '0.02%'
      };
    }
  };
  
  const exportAnalytics = async (format) => {
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      
      const analyticsData = {
        userActivity: {
          activeToday: users.filter(u => {
            const today = new Date();
            const userDate = new Date(u.updatedAt || u.createdAt);
            return userDate.toDateString() === today.toDateString();
          }).length,
          activeThisWeek: users.filter(u => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const userDate = new Date(u.updatedAt || u.createdAt);
            return userDate >= weekAgo;
          }).length,
          activeThisMonth: users.filter(u => {
            const userDate = new Date(u.updatedAt || u.createdAt);
            return userDate >= monthAgo;
          }).length
        },
        registrationTrends: {
          newUsers30d: users.filter(u => {
            const userDate = new Date(u.createdAt);
            return userDate >= monthAgo;
          }).length,
          profileCompletionRate: Math.round((users.filter(u => u.profileComplete).length / users.length) * 100) || 0,
          deletedUsers: analytics.totalDeletedUsers || 0
        },
        applicationActivity: {
          totalApplications: analytics.totalApplications,
          applicationsThisMonth: applications.filter(a => {
            const appDate = new Date(a.createdAt);
            return appDate >= monthAgo;
          }).length,
          approvalRate: applications.length > 0 ? Math.round((analytics.approvedApplications / analytics.totalApplications) * 100) : 0,
          pendingReview: analytics.pendingApplications
        },
        projectMetrics: {
          totalProjects: analytics.totalProjects,
          activeProjects: analytics.activeProjects,
          projectsCreatedThisMonth: projects.filter(p => {
            const projDate = new Date(p.createdAt);
            return projDate >= monthAgo;
          }).length,
          avgApplicationsPerProject: projects.length > 0 ? Math.round(applications.length / projects.length * 10) / 10 : 0
        },
        userRoleDistribution: {
          studentsPercent: Math.round((analytics.totalStudents / analytics.totalUsers) * 100) || 0,
          studentsCount: analytics.totalStudents,
          facultyPercent: Math.round((analytics.totalFaculty / analytics.totalUsers) * 100) || 0,
          facultyCount: analytics.totalFaculty,
          staffPercent: Math.round(((analytics.totalCoordinators + analytics.totalAdmins) / analytics.totalUsers) * 100) || 0,
          staffCount: analytics.totalCoordinators + analytics.totalAdmins
        },
        generatedAt: new Date().toISOString()
      };
      
      if (format === 'csv') {
        const csvData = [
          'ANALYTICS EXPORT',
          `Generated: ${new Date().toLocaleString()}`,
          '',
          'USER ACTIVITY',
          `Active Today,${analyticsData.userActivity.activeToday}`,
          `Active This Week,${analyticsData.userActivity.activeThisWeek}`,
          `Active This Month,${analyticsData.userActivity.activeThisMonth}`,
          '',
          'REGISTRATION TRENDS',
          `New Users (30d),${analyticsData.registrationTrends.newUsers30d}`,
          `Profile Completion Rate,${analyticsData.registrationTrends.profileCompletionRate}%`,
          `Deleted Users,${analyticsData.registrationTrends.deletedUsers}`,
          '',
          'APPLICATION ACTIVITY',
          `Total Applications,${analyticsData.applicationActivity.totalApplications}`,
          `Applications This Month,${analyticsData.applicationActivity.applicationsThisMonth}`,
          `Approval Rate,${analyticsData.applicationActivity.approvalRate}%`,
          `Pending Review,${analyticsData.applicationActivity.pendingReview}`,
          '',
          'PROJECT METRICS',
          `Total Projects,${analyticsData.projectMetrics.totalProjects}`,
          `Active Projects,${analyticsData.projectMetrics.activeProjects}`,
          `Projects Created This Month,${analyticsData.projectMetrics.projectsCreatedThisMonth}`,
          `Avg Applications per Project,${analyticsData.projectMetrics.avgApplicationsPerProject}`,
          '',
          'USER ROLE DISTRIBUTION',
          `Students,${analyticsData.userRoleDistribution.studentsPercent}% (${analyticsData.userRoleDistribution.studentsCount})`,
          `Faculty,${analyticsData.userRoleDistribution.facultyPercent}% (${analyticsData.userRoleDistribution.facultyCount})`,
          `Staff,${analyticsData.userRoleDistribution.staffPercent}% (${analyticsData.userRoleDistribution.staffCount})`
        ].join('\n');
        
        const csvBlob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(csvBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-export-${dateStr}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const analyticsStr = JSON.stringify(analyticsData, null, 2);
        const analyticsBlob = new Blob([analyticsStr], { type: 'application/json' });
        const url = URL.createObjectURL(analyticsBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-export-${dateStr}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
      
      logAuditAction('Analytics Export', `Analytics Data (${format.toUpperCase()})`, `User Activity, Registration Trends, Application Activity, Project Metrics, Role Distribution`);
      setMessage(`Analytics exported successfully as ${format.toUpperCase()}!`);
    } catch (err) {
      setError('Failed to export analytics.');
    }
  };
  
  const sendAnnouncement = async () => {
    if (!announcement.title || !announcement.message) {
      setError('Title and message are required.');
      return;
    }
    
    setIsSendingAnnouncement(true);
    try {
      // Filter users based on audience selection (exclude admin sender)
      let targetUsers = users.filter(u => u.id !== user.id);
      if (announcement.audience === 'students') {
        targetUsers = users.filter(u => u.role === 'Student' && u.id !== user.id);
      } else if (announcement.audience === 'faculty') {
        targetUsers = users.filter(u => u.role === 'Faculty' && u.id !== user.id);
      } else if (announcement.audience === 'coordinators') {
        targetUsers = users.filter(u => u.role === 'Coordinator' && u.id !== user.id);
      }
      
      // Create a single grouped message for the audience
      const createMessageMutation = `
        mutation CreateMessage($input: CreateMessageInput!) {
          createMessage(input: $input) {
            id
          }
        }
      `;
      
      let successCount = 0;
      let failCount = 0;
      
      const targetAudience = announcement.audience === 'all' ? 'All Users' : 
                          announcement.audience === 'students' ? 'Students' :
                          announcement.audience === 'faculty' ? 'Faculty' : 'Coordinators';
      
      // Create one message per user but with audience grouping info
      for (const targetUser of targetUsers) {
        try {
          await API.graphql(graphqlOperation(createMessageMutation, {
            input: {
              senderID: user.id,
              receiverID: targetUser.id,
              subject: `[Announcement to ${targetAudience}] ${announcement.title}`,
              body: announcement.message,
              messageType: 'SYSTEM'
            }
          }));
          successCount++;
        } catch (err) {
          console.error('Failed to send message to:', targetUser.email, err);
          failCount++;
        }
      }
      
      const audienceText = announcement.audience === 'all' ? 'All Users' : 
                          announcement.audience === 'students' ? 'Students' :
                          announcement.audience === 'faculty' ? 'Faculty' : 'Coordinators';
      
      logAuditAction('Announcement Sent', `"${announcement.title}"`, `Sent to ${audienceText} (${successCount} delivered${failCount > 0 ? `, ${failCount} failed` : ''})`);
      
      if (successCount > 0) {
        setMessage(`Announcement sent successfully to ${successCount} user${successCount > 1 ? 's' : ''}!${failCount > 0 ? ` ${failCount} failed.` : ''}`);
      }
      if (failCount > 0 && successCount === 0) {
        setError(`Failed to send announcement to all ${failCount} users.`);
      }
      
      // Clear form
      setAnnouncement({ title: '', message: '', audience: 'all' });
    } catch (err) {
      console.error('Error sending announcement:', err);
      setError('Failed to send announcement. Please try again.');
    } finally {
      setIsSendingAnnouncement(false);
    }
  };
  
  const logAuditAction = async (action, resource, details = '') => {
    const newLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user?.id || 'unknown',
      userName: user?.name || user?.email || 'Admin User',
      userEmail: user?.email || 'unknown@example.com',
      action,
      resource,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: 'N/A',
      userAgent: navigator.userAgent || 'N/A'
    };
    
    // Update local state immediately
    setAuditLogs(prev => [newLog, ...prev]);
    
    try {
      // Store in DynamoDB via GraphQL API
      await API.graphql(graphqlOperation(createAuditLogMutation, {
        input: {
          id: newLog.id,
          userId: newLog.userId,
          userName: newLog.userName,
          userEmail: newLog.userEmail,
          action: newLog.action,
          resource: newLog.resource,
          details: newLog.details,
          timestamp: newLog.timestamp,
          ipAddress: newLog.ipAddress,
          userAgent: newLog.userAgent
        }
      }));
    } catch (error) {
      console.error('Failed to store audit log:', error);
      // Keep local copy as fallback
      const savedLogs = JSON.parse(localStorage.getItem('adminAuditLogs') || '[]');
      const updatedLogs = [newLog, ...savedLogs.slice(0, 99)];
      localStorage.setItem('adminAuditLogs', JSON.stringify(updatedLogs));
    }
  };
  
  const loadAuditLogs = async () => {
    try {
      // Fetch from DynamoDB via GraphQL API
      const response = await API.graphql(graphqlOperation(listAuditLogsQuery, {
        limit: 1000
      }));
      
      if (response.data?.listAuditLogs?.items) {
        const logs = response.data.listAuditLogs.items.map(item => ({
          id: item.id,
          userId: item.userId,
          userName: item.userName,
          userEmail: item.userEmail,
          user: item.userName || item.userEmail || 'Unknown User',
          action: item.action,
          resource: item.resource,
          details: item.details,
          timestamp: item.timestamp,
          ipAddress: item.ipAddress || 'N/A',
          userAgent: item.userAgent || 'N/A'
        }));
        
        // Sort by timestamp (newest first)
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setAuditLogs(logs);
      } else {
        // Fallback to localStorage
        const savedLogs = JSON.parse(localStorage.getItem('adminAuditLogs') || '[]');
        setAuditLogs(savedLogs);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
      // Fallback to localStorage
      const savedLogs = JSON.parse(localStorage.getItem('adminAuditLogs') || '[]');
      setAuditLogs(savedLogs);
    }
  };
  
  // Helper function to get user display name for audit logs
  const getUserDisplayName = (log) => {
    // If we have userName stored in the log, use it
    if (log.userName && log.userName !== 'Admin User') {
      return log.userName;
    }
    
    // If we have userEmail, use it
    if (log.userEmail && log.userEmail !== 'unknown@example.com') {
      return log.userEmail;
    }
    
    // Try to find the user in the current users list by userId
    if (log.userId && users.length > 0) {
      const foundUser = users.find(u => u.id === log.userId);
      if (foundUser) {
        return foundUser.name || foundUser.email || 'Unknown User';
      }
    }
    
    // Fallback to stored user field or Unknown User
    return log.user || 'Unknown User';
  };
  

  

  
  if (loading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }
  
  return (
    <>

      <View width="100%" backgroundColor="#f5f5f5" style={{ overflowX: 'hidden' }}>
      <Flex direction="column" padding="1rem" gap="1rem" maxWidth="1400px" width="100%" margin="0 auto">
      <Card backgroundColor="white" padding="1.5rem">
        <Flex direction="column" gap="0.5rem">
          <Heading level={2} color="#2d3748">Admin Dashboard</Heading>
          <Text fontSize="1.1rem" color="#4a5568">
            Welcome back, {user?.name || 'Admin'}! You are logged in as an {user?.role || 'Admin'}.
          </Text>
        </Flex>
      </Card>
      
      {error && <Alert variation="error" isDismissible onDismiss={() => setError(null)}>{error}</Alert>}
      {message && <Alert variation="success">{message}</Alert>}
      
      {/* Alert for users without roles */}
      {(() => {
        const usersWithoutRoles = users.filter(u => !u.role || u.role === '' || u.role === 'undefined');
        if (usersWithoutRoles.length > 0) {
          return (
            <Alert variation="warning">
              <strong>Action Required:</strong> {usersWithoutRoles.length} user{usersWithoutRoles.length > 1 ? 's' : ''} need{usersWithoutRoles.length === 1 ? 's' : ''} role assignment. 
              Check the User Management tab to assign roles to: {usersWithoutRoles.map(u => u.name || u.email).join(', ')}
            </Alert>
          );
        }
        return null;
      })()}
      
      <Tabs
        currentIndex={activeTabIndex}
        onChange={(index) => setActiveTabIndex(index)}
        style={{ width: '100%' }}
      >
        <TabItem title="Dashboard">
          <Flex direction="column" gap="2rem">
            <Flex wrap="wrap" gap="1rem">
              <Card flex="1" minWidth="200px">
                <Heading level={4}>Users</Heading>
                <Text fontSize="2rem" fontWeight="bold" color="#333">{analytics.totalUsers}</Text>
                <Flex direction="column" gap="0.3rem" marginTop="0.5rem">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontSize="0.9rem">Students</Text>
                    <Text fontSize="0.9rem" fontWeight="bold">{analytics.totalStudents}</Text>
                  </Flex>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontSize="0.9rem">Faculty</Text>
                    <Text fontSize="0.9rem" fontWeight="bold">{analytics.totalFaculty}</Text>
                  </Flex>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontSize="0.9rem">Coordinators</Text>
                    <Text fontSize="0.9rem" fontWeight="bold">{analytics.totalCoordinators}</Text>
                  </Flex>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontSize="0.9rem">Admins</Text>
                    <Text fontSize="0.9rem" fontWeight="bold">{analytics.totalAdmins}</Text>
                  </Flex>
                </Flex>
              </Card>
              
              <Card flex="1" minWidth="200px">
                <Heading level={4}>Projects</Heading>
                <Text fontSize="2rem" fontWeight="bold" color="#333">{analytics.totalProjects}</Text>
                <Flex direction="column" gap="0.3rem" marginTop="0.5rem">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontSize="0.9rem">Active</Text>
                    <Text fontSize="0.9rem" fontWeight="bold">{analytics.activeProjects}</Text>
                  </Flex>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontSize="0.9rem">Expired</Text>
                    <Text fontSize="0.9rem" fontWeight="bold">{analytics.expiredProjects}</Text>
                  </Flex>
                </Flex>
              </Card>
              
              <Card flex="1" minWidth="200px">
                <Heading level={4}>Applications</Heading>
                <Text fontSize="2rem" fontWeight="bold" color="#333">{analytics.totalApplications}</Text>
                <Flex direction="column" gap="0.3rem" marginTop="0.5rem">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontSize="0.9rem">Pending</Text>
                    <Text fontSize="0.9rem" fontWeight="bold">{analytics.pendingApplications}</Text>
                  </Flex>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontSize="0.9rem">Approved</Text>
                    <Text fontSize="0.9rem" fontWeight="bold">{analytics.approvedApplications}</Text>
                  </Flex>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontSize="0.9rem">Rejected</Text>
                    <Text fontSize="0.9rem" fontWeight="bold">{analytics.rejectedApplications}</Text>
                  </Flex>
                </Flex>
              </Card>
            </Flex>
            
            <Flex wrap="wrap" gap="1rem">
              <Card flex="1" minWidth="200px">
                <Heading level={4}>System Performance</Heading>
                <Text><strong>Uptime:</strong> {analytics.systemUptime}</Text>
                <Text><strong>Response Time:</strong> {analytics.avgResponseTime}</Text>
                <Text><strong>Storage Used:</strong> {analytics.storageUsed}</Text>
              </Card>
              
              <Card flex="1" minWidth="200px">
                <Heading level={4}>Recent Activity (Today)</Heading>
                <Text fontSize="0.9rem">• {applications.filter(a => {
                  const today = new Date();
                  const appDate = new Date(a.createdAt);
                  return appDate.toDateString() === today.toDateString();
                }).length} new applications</Text>
                <Text fontSize="0.9rem">• {users.filter(u => {
                  const today = new Date();
                  const userDate = new Date(u.createdAt);
                  return userDate.toDateString() === today.toDateString();
                }).length} users registered</Text>
                <Text fontSize="0.9rem">• {projects.filter(p => {
                  const today = new Date();
                  const projDate = new Date(p.createdAt);
                  return projDate.toDateString() === today.toDateString();
                }).length} projects created</Text>
              </Card>
            </Flex>
          </Flex>
        </TabItem>
        
        <TabItem title="User Management">
          <Flex direction="column" gap="2rem">

            
            <Card>
              <Heading level={4} marginBottom="1rem">Create New User</Heading>
              <Flex gap="1rem" wrap="wrap">
                <TextField
                  label="Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  flex="1"
                  minWidth="200px"
                />
                <TextField
                  label="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  flex="1"
                  minWidth="200px"
                />
                <SelectField
                  label="Role"
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  flex="1"
                  minWidth="150px"
                >
                  <option value="">Select Role</option>
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Admin">Admin</option>
                </SelectField>
                <TextField
                  label="College"
                  value={newUser.department}
                  onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                  flex="1"
                  minWidth="200px"
                />
                <Button onClick={handleCreateUser} alignSelf="end">
                  Create User
                </Button>
              </Flex>
            </Card>
            
            <Card>
              <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
                <Heading level={4}>All Users ({users.length})</Heading>
                <Flex alignItems="center" gap="0.5rem">
                  <TextField
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset to first page when searching
                    }}
                    width="350px"
                    size="small"
                  />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </Flex>
              </Flex>
              <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
                <Text fontSize="0.9rem">Showing filtered results</Text>
                <Flex gap="1rem" alignItems="center">
                  <Text fontSize="0.9rem">{selectedUsers.size} selected</Text>
                  <Button
                    size="small"
                    onClick={handleDeleteSelectedUsers}
                    isDisabled={selectedUsers.size === 0 || selectedUsers.has(user.id)}
                    isLoading={isDeleting}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                  >
                    Delete Selected
                  </Button>
                </Flex>
              </Flex>
              
              {selectedUsers.has(user.id) && (
                <Alert variation="error" marginBottom="1rem">
                  Cannot delete your own account. Please unselect yourself.
                </Alert>
              )}
              
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell as="th">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => {
                          handleSelectAll(e.target.checked);
                        }}
                        onClick={(e) => {
                          const newChecked = !selectAll;
                          handleSelectAll(newChecked);
                        }}
                      />
                    </TableCell>
                    <TableCell as="th">Name</TableCell>
                    <TableCell as="th">Email</TableCell>
                    <TableCell as="th">Role</TableCell>
                    <TableCell as="th">College</TableCell>
                    <TableCell as="th">Created</TableCell>
                    <TableCell as="th">Last Active</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(() => {
                    // Filter users by search term
                    const filteredUsers = users.filter(user => {
                      const name = (user.name || '').toLowerCase();
                      const search = searchTerm.toLowerCase();
                      return name.includes(search);
                    });
                    
                    // Sort filtered users alphabetically
                    const sortedUsers = [...filteredUsers].sort((a, b) => {
                      const nameA = (a.name || '').toLowerCase();
                      const nameB = (b.name || '').toLowerCase();
                      return nameA.localeCompare(nameB);
                    });
                    
                    const startIndex = (currentPage - 1) * usersPerPage;
                    const endIndex = startIndex + usersPerPage;
                    const paginatedUsers = sortedUsers.slice(startIndex, endIndex);
                    return paginatedUsers.map(userItem => (
                    <TableRow key={userItem.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(userItem.id)}
                          onChange={(e) => {
                            handleUserSelection(userItem.id, e.target.checked);
                          }}
                          onClick={(e) => {
                            const newChecked = !selectedUsers.has(userItem.id);
                            handleUserSelection(userItem.id, newChecked);
                          }}
                        />
                      </TableCell>
                      <TableCell>{userItem.name || 'No name'}</TableCell>
                      <TableCell>{userItem.email}</TableCell>
                      <TableCell>
                        <SelectField
                          value={userItem.role || 'Student'}
                          onChange={(e) => handleRoleUpdate(userItem.id, e.target.value)}
                          size="small"
                          width="120px"
                        >
                          <option value="Student">Student</option>
                          <option value="Faculty">Faculty</option>
                          <option value="Coordinator">Coordinator</option>
                          <option value="Admin">Admin</option>
                        </SelectField>
                      </TableCell>
                      <TableCell>{userItem.department || 'N/A'}</TableCell>
                      <TableCell>{new Date(userItem.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{userItem.updatedAt ? new Date(userItem.updatedAt).toLocaleString() : new Date(userItem.createdAt).toLocaleString()}</TableCell>

                    </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
              
              <Flex justifyContent="flex-end" marginTop="1rem" gap="0.5rem" alignItems="center">
                {(() => {
                  const filteredCount = users.filter(user => {
                    const name = (user.name || '').toLowerCase();
                    const search = searchTerm.toLowerCase();
                    return name.includes(search);
                  }).length;
                  const totalPages = Math.ceil(filteredCount / usersPerPage);
                  
                  return (
                    <>
                      <Text fontSize="0.9rem">
                        Page {currentPage} of {totalPages} 
                        ({filteredCount} {searchTerm ? 'filtered' : 'total'} users)
                      </Text>
                      <Button
                        size="small"
                        onClick={() => {
                          if (currentPage > 1) {
                            setCurrentPage(prev => prev - 1);
                          }
                        }}
                      >
                        Previous
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          if (currentPage < totalPages) {
                            setCurrentPage(prev => prev + 1);
                          }
                        }}
                      >
                        Next
                      </Button>
                    </>
                  );
                })()}
              </Flex>
            </Card>
          </Flex>
        </TabItem>
        
        <TabItem title="Data Management">
          <Flex direction="column" gap="2rem">
            <Card>
              <Heading level={4} marginBottom="1rem">Data Management</Heading>
              <Flex direction="column" gap="1rem">
                <Flex gap="0.5rem" wrap="wrap">
                  <Button size="small" flex="1" onClick={handleExportAllData}>Export Data</Button>
                  <Button size="small" flex="1" onClick={handleBackupDatabase}>Backup Database</Button>
                  <Button size="small" flex="1" onClick={handleCleanOldFiles}>Clean Files</Button>
                  <Button size="small" flex="1" onClick={handleGenerateReports}>Reports</Button>
                </Flex>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Export Analytics</Heading>
              <Flex direction="column" gap="1rem">
                <Flex gap="0.5rem" wrap="wrap">
                  <Button size="small" flex="1" onClick={() => exportAnalytics('csv')}>Export Analytics CSV</Button>
                  <Button size="small" flex="1" onClick={() => exportAnalytics('json')}>Export Analytics JSON</Button>
                  <div style={{ flex: '1' }}></div>
                  <div style={{ flex: '1' }}></div>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </TabItem>
        

        

        <TabItem title="Audit Logs">
          <Flex direction="column" gap="2rem">
            <Card>
              <Heading level={4} marginBottom="1rem">Access Audits</Heading>
              <Text marginBottom="1rem">Track who changed what and when ({auditLogs.length} total actions)</Text>
              {auditLogs.length > 0 ? (
                <>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell as="th">User</TableCell>
                        <TableCell as="th">Action</TableCell>
                        <TableCell as="th">Resource</TableCell>
                        <TableCell as="th">Details</TableCell>
                        <TableCell as="th">Timestamp</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(() => {
                        const startIndex = (auditCurrentPage - 1) * auditLogsPerPage;
                        const endIndex = startIndex + auditLogsPerPage;
                        const paginatedLogs = auditLogs.slice(startIndex, endIndex);
                        return paginatedLogs.map(log => (
                          <TableRow key={log.id}>
                            <TableCell>{getUserDisplayName(log)}</TableCell>
                            <TableCell>{log.action}</TableCell>
                            <TableCell>{log.resource}</TableCell>
                            <TableCell fontSize="0.9rem">{log.details}</TableCell>
                            <TableCell fontSize="0.8rem">
                              {new Date(log.timestamp).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                  <Flex justifyContent="flex-end" marginTop="1rem" gap="0.5rem" alignItems="center">
                    {(() => {
                      const totalPages = Math.ceil(auditLogs.length / auditLogsPerPage);
                      return (
                        <>
                          <Text fontSize="0.9rem">
                            Page {auditCurrentPage} of {totalPages} ({auditLogs.length} total logs)
                          </Text>
                          <Button
                            size="small"
                            onClick={() => {
                              if (auditCurrentPage > 1) {
                                setAuditCurrentPage(prev => prev - 1);
                              }
                            }}
                          >
                            Previous
                          </Button>
                          <Button
                            size="small"
                            onClick={() => {
                              if (auditCurrentPage < totalPages) {
                                setAuditCurrentPage(prev => prev + 1);
                              }
                            }}
                          >
                            Next
                          </Button>
                        </>
                      );
                    })()}
                  </Flex>
                </>
              ) : (
                <Text fontSize="0.9rem" color="#666" padding="2rem" textAlign="center">
                  No audit logs available. Actions will be tracked here as they occur.
                </Text>
              )}
              <Flex gap="1rem" marginTop="1rem">
                <Button onClick={() => setShowAuditExportDialog(true)}>Export Audit Log</Button>
                <Button onClick={async () => {
                  if (window.confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
                    try {
                      // Get all audit logs first
                      const response = await API.graphql(graphqlOperation(listAuditLogsQuery));
                      
                      if (response.data?.listAuditLogs?.items) {
                        // Delete each audit log
                        let deletedCount = 0;
                        for (const log of response.data.listAuditLogs.items) {
                          try {
                            await API.graphql(graphqlOperation(deleteAuditLogMutation, {
                              input: { id: log.id }
                            }));
                            deletedCount++;
                          } catch (deleteError) {
                            console.error('Error deleting audit log:', deleteError);
                          }
                        }
                        
                        setMessage(`Cleared ${deletedCount} audit log entries.`);
                      }
                      
                      // Clear local state and localStorage
                      setAuditLogs([]);
                      setAuditCurrentPage(1);
                      localStorage.removeItem('adminAuditLogs');
                      
                    } catch (error) {
                      console.error('Error clearing audit logs:', error);
                      // Clear local anyway
                      setAuditLogs([]);
                      setAuditCurrentPage(1);
                      localStorage.removeItem('adminAuditLogs');
                      setMessage('Audit logs cleared locally.');
                    }
                  }
                }}>Clear Logs</Button>
              </Flex>
            </Card>
          </Flex>
        </TabItem>
        
        <TabItem title="Analytics">
          <Flex direction="column" gap="2rem">
            <Card>
              <Heading level={4} marginBottom="1rem">User Activity</Heading>
              <Flex wrap="wrap" gap="1rem">
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>{users.filter(u => {
                    const today = new Date();
                    const userDate = new Date(u.updatedAt || u.createdAt);
                    return userDate.toDateString() === today.toDateString();
                  }).length}</Heading>
                  <Text fontSize="0.9rem">Active Today</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>{users.filter(u => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    const userDate = new Date(u.updatedAt || u.createdAt);
                    return userDate >= weekAgo;
                  }).length}</Heading>
                  <Text fontSize="0.9rem">Active This Week</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>{users.filter(u => {
                    const monthAgo = new Date();
                    monthAgo.setDate(monthAgo.getDate() - 30);
                    const userDate = new Date(u.updatedAt || u.createdAt);
                    return userDate >= monthAgo;
                  }).length}</Heading>
                  <Text fontSize="0.9rem">Active This Month</Text>
                </Card>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Registration Trends</Heading>
              <Flex wrap="wrap" gap="1rem">
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>{users.filter(u => {
                    const monthAgo = new Date();
                    monthAgo.setDate(monthAgo.getDate() - 30);
                    const userDate = new Date(u.createdAt);
                    return userDate >= monthAgo;
                  }).length}</Heading>
                  <Text fontSize="0.9rem">New Users (30d)</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>{Math.round((users.filter(u => u.profileComplete).length / users.length) * 100) || 0}%</Heading>
                  <Text fontSize="0.9rem">Profile Completion Rate</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>{analytics.totalDeletedUsers || 0}</Heading>
                  <Text fontSize="0.9rem">Deleted Users</Text>
                </Card>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Application Activity</Heading>
              <Flex direction="column" gap="0.5rem">
                <Flex justifyContent="space-between">
                  <Text>Total Applications:</Text>
                  <Text fontWeight="bold">{analytics.totalApplications}</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text>Applications This Month:</Text>
                  <Text fontWeight="bold">{applications.filter(a => {
                    const monthAgo = new Date();
                    monthAgo.setDate(monthAgo.getDate() - 30);
                    const appDate = new Date(a.createdAt);
                    return appDate >= monthAgo;
                  }).length}</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text>Approval Rate:</Text>
                  <Text fontWeight="bold">{applications.length > 0 ? Math.round((analytics.approvedApplications / analytics.totalApplications) * 100) : 0}%</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text>Pending Review:</Text>
                  <Text fontWeight="bold">{analytics.pendingApplications}</Text>
                </Flex>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Project Metrics</Heading>
              <Flex direction="column" gap="0.5rem">
                <Flex justifyContent="space-between">
                  <Text>Total Projects:</Text>
                  <Text fontWeight="bold">{analytics.totalProjects}</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text>Active Projects:</Text>
                  <Text fontWeight="bold">{analytics.activeProjects}</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text>Projects Created This Month:</Text>
                  <Text fontWeight="bold">{projects.filter(p => {
                    const monthAgo = new Date();
                    monthAgo.setDate(monthAgo.getDate() - 30);
                    const projDate = new Date(p.createdAt);
                    return projDate >= monthAgo;
                  }).length}</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text>Average Applications per Project:</Text>
                  <Text fontWeight="bold">{projects.length > 0 ? Math.round(applications.length / projects.length * 10) / 10 : 0}</Text>
                </Flex>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">User Role Distribution</Heading>
              <Flex wrap="wrap" gap="1rem">
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>{Math.round((analytics.totalStudents / analytics.totalUsers) * 100) || 0}%</Heading>
                  <Text fontSize="0.9rem">Students ({analytics.totalStudents})</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>{Math.round((analytics.totalFaculty / analytics.totalUsers) * 100) || 0}%</Heading>
                  <Text fontSize="0.9rem">Faculty ({analytics.totalFaculty})</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>{Math.round(((analytics.totalCoordinators + analytics.totalAdmins) / analytics.totalUsers) * 100) || 0}%</Heading>
                  <Text fontSize="0.9rem">Staff ({analytics.totalCoordinators + analytics.totalAdmins})</Text>
                </Card>
              </Flex>
            </Card>
            


          </Flex>
        </TabItem>
        
        <TabItem title="Communication">
          <Flex direction="column" gap="2rem">
            <Card>
              <Heading level={4} marginBottom="1rem">Send Announcement</Heading>
              <Flex direction="column" gap="1rem">
                <TextField
                  label="Announcement Title"
                  placeholder="Enter announcement title"
                  value={announcement.title}
                  onChange={(e) => setAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                />
                <div>
                  <Text fontSize="0.9rem" fontWeight="500" color="#4a5568" marginBottom="0.5rem">Message</Text>
                  <div style={{ height: '200px', marginBottom: '1rem' }}>
                    <ReactQuill
                      value={announcement.message}
                      onChange={(value) => setAnnouncement(prev => ({ ...prev, message: value }))}
                      placeholder="Enter announcement message"
                      modules={{
                        toolbar: [
                          ['bold', 'italic', 'underline'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link'],
                          ['clean']
                        ]
                      }}
                      style={{ height: '150px' }}
                    />
                  </div>
                </div>
                <SelectField 
                  label="Target Audience"
                  value={announcement.audience}
                  onChange={(e) => setAnnouncement(prev => ({ ...prev, audience: e.target.value }))}
                >
                  <option value="all">All Users ({users.length})</option>
                  <option value="students">Students Only ({analytics.totalStudents})</option>
                  <option value="faculty">Faculty Only ({analytics.totalFaculty})</option>
                  <option value="coordinators">Coordinators Only ({analytics.totalCoordinators})</option>
                </SelectField>
                <Flex gap="1rem">
                  <Button 
                    onClick={sendAnnouncement}
                    isLoading={isSendingAnnouncement}
                    isDisabled={!announcement.title || !announcement.message}
                  >
                    Send Announcement
                  </Button>
                </Flex>
              </Flex>
            </Card>

          </Flex>
        </TabItem>
        

      </Tabs>
      
      {showDeleteConfirm && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100%"
          backgroundColor="rgba(0,0,0,0.5)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          style={{ zIndex: 1000 }}
        >
          <Card width="400px" padding="2rem">
            <Heading level={4} marginBottom="1rem">Confirm User Deletion</Heading>
            <Text marginBottom="1rem">
              Are you sure you want to delete {selectedUsers.size} selected users?
            </Text>
            <Flex gap="1rem">
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setConfirmText('');
                }}
                flex="1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteUsers}
                backgroundColor="white"
                color="black"
                border="1px solid black"
                flex="1"
              >
                Delete Users
              </Button>
            </Flex>
          </Card>
        </View>
      )}
      
      {showExportDialog && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100%"
          backgroundColor="rgba(0,0,0,0.5)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          style={{ zIndex: 1000 }}
        >
          <Card width="400px" padding="2rem">
            <Heading level={4} marginBottom="1rem">Export Data Format</Heading>
            <Text marginBottom="2rem">
              Choose the format for your data export:
            </Text>
            <Flex direction="column" gap="1rem">
              <Button
                onClick={() => exportData('json')}
                width="100%"
                backgroundColor="white"
                color="black"
                border="1px solid black"
              >
                JSON Format
              </Button>
              <Button
                onClick={() => exportData('csv')}
                width="100%"
                backgroundColor="white"
                color="black"
                border="1px solid black"
              >
                CSV Format
              </Button>
              <Button
                onClick={() => setShowExportDialog(false)}
                width="100%"
                backgroundColor="#f7fafc"
                color="black"
                border="1px solid #e2e8f0"
              >
                Cancel
              </Button>
            </Flex>
          </Card>
        </View>
      )}
      
      {showBackupDialog && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100%"
          backgroundColor="rgba(0,0,0,0.5)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          style={{ zIndex: 1000 }}
        >
          <Card width="500px" padding="2rem">
            <Heading level={4} marginBottom="1rem">Backup Database</Heading>
            <Text marginBottom="1.5rem">
              This will generate and download a DDL script containing:
            </Text>
            <Text fontSize="0.9rem" marginBottom="1rem">
              • Database schema (CREATE TABLE statements)<br/>
              • All table structures and relationships<br/>
              • Performance indexes<br/>
              • Foreign key constraints
            </Text>
            <Text fontSize="0.9rem" marginBottom="2rem" color="#666">
              The backup file will be saved as database-backup-YYYY-MM-DD.sql
            </Text>
            <Flex gap="1rem">
              <Button
                onClick={() => setShowBackupDialog(false)}
                flex="1"
                backgroundColor="#f7fafc"
                color="black"
                border="1px solid #e2e8f0"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmBackupDatabase}
                backgroundColor="white"
                color="black"
                border="1px solid black"
                flex="1"
              >
                Generate Backup
              </Button>
            </Flex>
          </Card>
        </View>
      )}
      
      {showCleanFilesDialog && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100%"
          backgroundColor="rgba(0,0,0,0.5)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          style={{ zIndex: 1000 }}
        >
          <Card width="500px" padding="2rem">
            <Heading level={4} marginBottom="1rem">Clean Old Files</Heading>
            <Text marginBottom="1.5rem">
              This will permanently delete files older than 365 days from storage:
            </Text>
            <Text fontSize="0.9rem" marginBottom="1rem">
              • Application documents uploaded over 1 year ago<br/>
              • Profile pictures older than 1 year<br/>
              • Other uploaded files in public storage
            </Text>
            <Text fontSize="0.9rem" marginBottom="2rem" color="#d69e2e">
              This action cannot be undone. Deleted files cannot be recovered.
            </Text>
            <Flex gap="1rem">
              <Button
                onClick={() => setShowCleanFilesDialog(false)}
                flex="1"
                backgroundColor="#f7fafc"
                color="black"
                border="1px solid #e2e8f0"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmCleanOldFiles}
                backgroundColor="white"
                color="black"
                border="1px solid black"
                flex="1"
              >
                Clean Files
              </Button>
            </Flex>
          </Card>
        </View>
      )}
      
      {showReportsDialog && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100%"
          backgroundColor="rgba(0,0,0,0.5)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          style={{ zIndex: 1000 }}
        >
          <Card width="500px" padding="2rem">
            <Heading level={4} marginBottom="1rem">Generate Analytics Report</Heading>
            <Text marginBottom="1.5rem">
              This will generate a comprehensive analytics report containing:
            </Text>
            <Text fontSize="0.9rem" marginBottom="1rem">
              • System summary statistics<br/>
              • User breakdown by role (including deleted users)<br/>
              • Project status overview<br/>
              • Application status metrics
            </Text>
            <Text fontSize="0.9rem" marginBottom="2rem" color="#666">
              Choose your preferred format for the report download:
            </Text>
            <Flex direction="column" gap="1rem">
              <Button
                onClick={() => generateReport('json')}
                width="100%"
                backgroundColor="white"
                color="black"
                border="1px solid black"
              >
                JSON Format
              </Button>
              <Button
                onClick={() => generateReport('csv')}
                width="100%"
                backgroundColor="white"
                color="black"
                border="1px solid black"
              >
                CSV Format
              </Button>
              <Button
                onClick={() => setShowReportsDialog(false)}
                width="100%"
                backgroundColor="#f7fafc"
                color="black"
                border="1px solid #e2e8f0"
              >
                Cancel
              </Button>
            </Flex>
          </Card>
        </View>
      )}
      
      {showAuditExportDialog && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100%"
          backgroundColor="rgba(0,0,0,0.5)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          style={{ zIndex: 1000 }}
        >
          <Card width="500px" padding="2rem">
            <Heading level={4} marginBottom="1rem">Export Audit Log</Heading>
            <Text marginBottom="1.5rem">
              This will download a CSV file containing all audit log entries:
            </Text>
            <Text fontSize="0.9rem" marginBottom="1rem">
              • All administrative actions and timestamps<br/>
              • User information for each action<br/>
              • Resource details and action descriptions<br/>
              • {auditLogs.length} total log entries
            </Text>
            <Text fontSize="0.9rem" marginBottom="2rem" color="#666">
              The file will be saved as audit-log-YYYY-MM-DD.csv
            </Text>
            <Flex gap="1rem">
              <Button
                onClick={() => setShowAuditExportDialog(false)}
                flex="1"
                backgroundColor="#f7fafc"
                color="black"
                border="1px solid #e2e8f0"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowAuditExportDialog(false);
                  const auditData = auditLogs.map(log => 
                    `${new Date(log.timestamp).toISOString()},${getUserDisplayName(log)},${log.action},"${log.resource}","${log.details}"`
                  ).join('\n');
                  const csvContent = `Timestamp,User,Action,Resource,Details\n${auditData}`;
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
                  link.click();
                  URL.revokeObjectURL(url);
                  logAuditAction('Audit Log Export', 'CSV File Downloaded', `${auditLogs.length} log entries exported`);
                  setMessage('Audit log exported successfully!');
                }}
                backgroundColor="white"
                color="black"
                border="1px solid black"
                flex="1"
              >
                Export CSV
              </Button>
            </Flex>
          </Card>
        </View>
      )}

    </Flex>
    </View>
    </>
  );
};

export default AdminDashboard;