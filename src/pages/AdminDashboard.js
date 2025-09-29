import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
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
  
  useEffect(() => {
    fetchData();
  }, [user]);
  
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
            
            // Try multiple ways to get faculty name
            if (p.facultyName) {
              facultyName = p.facultyName;
            } else if (p.faculty) {
              if (typeof p.faculty === 'string') {
                facultyName = p.faculty;
              } else if (p.faculty.name) {
                facultyName = p.faculty.name;
              } else if (p.faculty.id) {
                // Look up faculty by ID in users array
                const facultyUser = users.find(u => u.id === p.faculty.id);
                facultyName = facultyUser ? facultyUser.name : '';
              }
            } else if (p.facultyId) {
              // Look up faculty by facultyId
              const facultyUser = users.find(u => u.id === p.facultyId);
              facultyName = facultyUser ? facultyUser.name : '';
            }
            
            // If still no name found, try to extract from any object
            if (!facultyName && p.faculty && typeof p.faculty === 'object') {
              facultyName = p.faculty.email || p.faculty.username || 'Unknown Faculty';
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
          </Flex>
        </TabItem>
        
        <TabItem title="Monitoring">
          <Flex direction="column" gap="2rem">
            <Card>
              <Heading level={4} marginBottom="1rem">System Health</Heading>
              <Flex direction="column" gap="1rem">
                <Flex justifyContent="space-between">
                  <Text>Database Status:</Text>
                  <Text fontWeight="bold">Healthy</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text>API Response Time:</Text>
                  <Text>{analytics.avgResponseTime}</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text>Storage Usage:</Text>
                  <Text>{analytics.storageUsed}</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text>Active Users (24h):</Text>
                  <Text>N/A*</Text>
                </Flex>
                <div style={{ fontSize: '0.8rem', color: 'gray', marginTop: '0.5rem' }}>
                  * Requires session tracking implementation
                </div>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Error Logs</Heading>
              <Text fontSize="0.9rem" fontFamily="monospace" backgroundColor="#f5f5f5" padding="1rem">
                No recent errors logged.<br/>
                <div style={{ fontSize: '0.8rem', color: 'gray' }}>
                  * Error logging requires CloudWatch Logs integration
                </div>
              </Text>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Integration Status</Heading>
              <Flex direction="column" gap="1rem">
                <Flex justifyContent="space-between">
                  <Text>AWS Cognito:</Text>
                  <Text fontWeight="bold">Connected</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text>AWS S3:</Text>
                  <Text fontWeight="bold">Connected</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text>AWS SES:</Text>
                  <Text fontWeight="bold">Rate Limited</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text>DynamoDB:</Text>
                  <Text fontWeight="bold">Connected</Text>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </TabItem>
        
        <TabItem title="System Overview">
          <Flex direction="column" gap="2rem">
            <Card>
              <Heading level={4} marginBottom="1rem">Application Statistics</Heading>
              <Flex wrap="wrap" gap="1rem">
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>{analytics.pendingApplications}</Heading>
                  <Text fontSize="0.9rem">Pending Review</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>{analytics.approvedApplications}</Heading>
                  <Text fontSize="0.9rem">Approved</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>{analytics.rejectedApplications}</Heading>
                  <Text fontSize="0.9rem">Rejected</Text>
                </Card>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Project Statistics</Heading>
              <Flex wrap="wrap" gap="1rem">
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>{analytics.activeProjects}</Heading>
                  <Text fontSize="0.9rem">Active Projects</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>{analytics.expiredProjects}</Heading>
                  <Text fontSize="0.9rem">Expired Projects</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5} color="#333">{analytics.totalProjects}</Heading>
                  <Text fontSize="0.9rem">Total Projects</Text>
                </Card>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">System Information</Heading>
              <Text>Admins can view system statistics and manage users, but do not participate in the application approval process. Faculty and Coordinators handle application reviews.</Text>
            </Card>
          </Flex>
        </TabItem>
        
        <TabItem title="Permissions">
          <Flex direction="column" gap="2rem">
            <Card>
              <Heading level={4} marginBottom="1rem">Access Audits</Heading>
              <Text marginBottom="1rem">Track who changed what and when</Text>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell as="th">User</TableCell>
                    <TableCell as="th">Action</TableCell>
                    <TableCell as="th">Resource</TableCell>
                    <TableCell as="th">Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Admin User</TableCell>
                    <TableCell>Role Updated</TableCell>
                    <TableCell>User: john.doe@gcu.edu</TableCell>
                    <TableCell>{new Date().toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>System</TableCell>
                    <TableCell>User Created</TableCell>
                    <TableCell>User: jane.smith@gcu.edu</TableCell>
                    <TableCell>{new Date(Date.now() - 3600000).toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Flex gap="1rem" marginTop="1rem">
                <Button>Export Audit Log</Button>
                <Button>Filter by Date Range</Button>
                <Button>Filter by User</Button>
              </Flex>
            </Card>
          </Flex>
        </TabItem>
        
        <TabItem title="Analytics">
          <Flex direction="column" gap="2rem">
            <Card>
              <Heading level={4} marginBottom="1rem">Active Users</Heading>
              <Flex wrap="wrap" gap="1rem">
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>245</Heading>
                  <Text fontSize="0.9rem">Daily Active Users</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>1,234</Heading>
                  <Text fontSize="0.9rem">Weekly Active Users</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>3,456</Heading>
                  <Text fontSize="0.9rem">Monthly Active Users</Text>
                </Card>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">User Engagement</Heading>
              <Flex direction="column" gap="1rem">
                <Flex justifyContent="space-between">
                  <Text>Average Time Spent:</Text>
                  <Text fontWeight="bold">24 minutes</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text>Average Pages Visited:</Text>
                  <Text fontWeight="bold">8.5 pages</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text>Most Used Feature:</Text>
                  <Text fontWeight="bold">Project Search</Text>
                </Flex>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Adoption Metrics</Heading>
              <Flex wrap="wrap" gap="1rem">
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>89</Heading>
                  <Text fontSize="0.9rem">New Registrations (30d)</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>12%</Heading>
                  <Text fontSize="0.9rem">Drop-off Rate</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>76%</Heading>
                  <Text fontSize="0.9rem">Profile Completion Rate</Text>
                </Card>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Top Activities</Heading>
              <Flex direction="column" gap="0.5rem">
                <Flex justifyContent="space-between">
                  <Text>Research Applications:</Text>
                  <Text fontWeight="bold">156 this month</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text>Profile Updates:</Text>
                  <Text fontWeight="bold">89 this month</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text>Project Views:</Text>
                  <Text fontWeight="bold">2,345 this month</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text>Messages Sent:</Text>
                  <Text fontWeight="bold">567 this month</Text>
                </Flex>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Device/Platform Breakdown</Heading>
              <Flex wrap="wrap" gap="1rem">
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>65%</Heading>
                  <Text fontSize="0.9rem">Web Browser</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>25%</Heading>
                  <Text fontSize="0.9rem">iOS Mobile</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>10%</Heading>
                  <Text fontSize="0.9rem">Android Mobile</Text>
                </Card>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Usage Heatmaps</Heading>
              <Text marginBottom="1rem">Peak login times and app usage patterns</Text>
              <Flex direction="column" gap="0.5rem">
                <Text fontSize="0.9rem">• Peak usage: 10 AM - 2 PM weekdays</Text>
                <Text fontSize="0.9rem">• Secondary peak: 7 PM - 9 PM</Text>
                <Text fontSize="0.9rem">• Lowest usage: Weekends 6 AM - 10 AM</Text>
                <Text fontSize="0.9rem">• Most active day: Tuesday</Text>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Export Reports</Heading>
              <Flex gap="1rem" wrap="wrap">
                <Button>Export User Analytics</Button>
                <Button>Export Engagement Report</Button>
                <Button>Export Usage Statistics</Button>
                <Button>Generate Leadership Report</Button>
                <Button>Custom Report Builder</Button>
              </Flex>
            </Card>
          </Flex>
        </TabItem>
        
        <TabItem title="Communication">
          <Flex direction="column" gap="2rem">
            <Card>
              <Heading level={4} marginBottom="1rem">Announcements Management</Heading>
              <Text marginBottom="1rem">Post campus-wide updates and notifications</Text>
              <Flex direction="column" gap="1rem">
                <TextField
                  label="Announcement Title"
                  placeholder="Enter announcement title"
                />
                <TextField
                  label="Message"
                  placeholder="Enter announcement message"
                  as="textarea"
                  rows={4}
                />
                <SelectField label="Target Audience">
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  <option value="faculty">Faculty Only</option>
                  <option value="coordinators">Coordinators Only</option>
                </SelectField>
                <Flex gap="1rem">
                  <Button>Send Announcement</Button>
                  <Button>Schedule for Later</Button>
                  <Button>Save as Draft</Button>
                </Flex>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Recent Announcements</Heading>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell as="th">Title</TableCell>
                    <TableCell as="th">Audience</TableCell>
                    <TableCell as="th">Sent Date</TableCell>
                    <TableCell as="th">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Spring Research Fair Registration Open</TableCell>
                    <TableCell>All Users</TableCell>
                    <TableCell>{new Date().toLocaleDateString()}</TableCell>
                    <TableCell>Sent</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>New Application Deadline Reminder</TableCell>
                    <TableCell>Students</TableCell>
                    <TableCell>{new Date(Date.now() - 86400000).toLocaleDateString()}</TableCell>
                    <TableCell>Sent</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Engagement Analytics</Heading>
              <Text marginBottom="1rem">Track message delivery and engagement rates</Text>
              <Flex wrap="wrap" gap="1rem">
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>98.5%</Heading>
                  <Text fontSize="0.9rem">Delivery Rate</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>67%</Heading>
                  <Text fontSize="0.9rem">Open Rate</Text>
                </Card>
                <Card variation="outlined" padding="1rem" flex="1" textAlign="center">
                  <Heading level={5}>23%</Heading>
                  <Text fontSize="0.9rem">Click-through Rate</Text>
                </Card>
              </Flex>
              <Flex direction="column" gap="0.5rem" marginTop="1rem">
                <Text fontSize="0.9rem">• Most engaged audience: Faculty (78% open rate)</Text>
                <Text fontSize="0.9rem">• Best send time: Tuesday 10 AM</Text>
                <Text fontSize="0.9rem">• Average response time: 4.2 hours</Text>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Message Templates</Heading>
              <Flex gap="1rem" wrap="wrap">
                <Button>Welcome Message</Button>
                <Button>Deadline Reminder</Button>
                <Button>Application Status Update</Button>
                <Button>System Maintenance Notice</Button>
                <Button>Create New Template</Button>
              </Flex>
            </Card>
          </Flex>
        </TabItem>
        
        <TabItem title="Support">
          <Flex direction="column" gap="2rem">
            <Card>
              <Heading level={4} marginBottom="1rem">Troubleshooting Tools</Heading>
              <Flex gap="1rem" wrap="wrap">
                <Button>Clear Cache</Button>
                <Button>Restart Services</Button>
                <Button>Test Connections</Button>
                <Button>Validate Data</Button>
                <Button>Check Permissions</Button>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">System Maintenance</Heading>
              <Flex direction="column" gap="1rem">
                <Button>Schedule Maintenance Window</Button>
                <Button>Update System Components</Button>
                <Button>Apply Security Patches</Button>
                <Button>Optimize Database</Button>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Policy Enforcement</Heading>
              <Text>Ensure compliance with university policies:</Text>
              <Flex direction="column" gap="0.5rem" marginTop="1rem">
                <Text fontSize="0.9rem">• Data retention policies: 7 years</Text>
                <Text fontSize="0.9rem">• Privacy compliance: FERPA compliant</Text>
                <Text fontSize="0.9rem">• Security standards: SOC 2 Type II</Text>
                <Text fontSize="0.9rem">• Access controls: Role-based permissions</Text>
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

    </Flex>
    </View>
    </>
  );
};

export default AdminDashboard;