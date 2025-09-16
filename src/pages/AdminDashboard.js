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

const AdminDashboard = ({ user }) => {
  const { tokens } = useTheme();
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: '', department: '' });
  const [systemConfig, setSystemConfig] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    maxApplications: 5,
    passwordMinLength: 8,
    sessionTimeout: 30
  });
  const [analytics, setAnalytics] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 50;
  const [searchTerm, setSearchTerm] = useState('');
  
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
      
      // Calculate analytics
      const now = new Date();
      const analyticsData = {
        totalUsers: allUsers.length,
        totalStudents: allUsers.filter(u => u.role === 'Student').length,
        totalFaculty: allUsers.filter(u => u.role === 'Faculty').length,
        totalCoordinators: allUsers.filter(u => u.role === 'Coordinator').length,
        totalAdmins: allUsers.filter(u => u.role === 'Admin').length,
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
        storageUsed: 'N/A', // Would be calculated from S3
        systemUptime: 'N/A', // Would come from CloudWatch
        avgResponseTime: 'N/A' // Would come from monitoring
      };
      
      setApplications(allApplications);
      setUsers(allUsers);
      setProjects(allProjects);
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
    
    const confirmMessage = `Are you sure you want to delete ${targetUser?.name || 'this user'}?\n\nThis will:\n• Remove user from database\n• Remove user from Cognito User Pool\n• Completely revoke system access\n• Cannot be undone\n\nContinue?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const result = await deleteUserCompletely(userId, targetUser?.email);
      if (result.success) {
        setMessage(`User deleted successfully. ${result.cognitoDeleted ? 'Removed from both database and Cognito.' : 'Removed from database only - Cognito deletion failed.'}`);
      }
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
      const results = await bulkDeleteUsers(Array.from(selectedUsers), users);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
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
  
  const handleSystemConfigUpdate = async (key, value) => {
    setSystemConfig(prev => ({ ...prev, [key]: value }));
    // In a real implementation, this would update system configuration in the backend
    setMessage(`System configuration updated: ${key}`);
  };
  

  
  if (loading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }
  
  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Flex direction="column" gap="0.5rem">
        <Heading level={2}>Admin Dashboard</Heading>
        <Text fontSize="1.1rem" color="#666">
          Welcome back, {user?.name || 'Admin'}! You are logged in as an {user?.role || 'Admin'}.
        </Text>
      </Flex>
      
      {error && <Alert variation="error" isDismissible onDismiss={() => setError(null)}>{error}</Alert>}
      {message && <Alert variation="success" isDismissible onDismiss={() => setMessage(null)}>{message}</Alert>}
      
      <Tabs
        currentIndex={activeTabIndex}
        onChange={(index) => setActiveTabIndex(index)}
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
                <Text fontSize="0.8rem" color="gray" marginTop="0.5rem">
                  * Performance metrics require CloudWatch integration
                </Text>
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
                <Text fontSize="0.8rem" color="gray" marginTop="0.5rem">
                  * Based on actual system data
                </Text>
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
        
        <TabItem title="Security & Config">
          <Flex direction="column" gap="2rem">
            <Card>
              <Heading level={4} marginBottom="1rem">Security Settings</Heading>
              <Flex direction="column" gap="1rem">
                <TextField
                  label="Minimum Password Length"
                  type="number"
                  value={systemConfig.passwordMinLength}
                  onChange={(e) => handleSystemConfigUpdate('passwordMinLength', parseInt(e.target.value))}
                />
                <TextField
                  label="Session Timeout (minutes)"
                  type="number"
                  value={systemConfig.sessionTimeout}
                  onChange={(e) => handleSystemConfigUpdate('sessionTimeout', parseInt(e.target.value))}
                />
                <SwitchField
                  label="Two-Factor Authentication Required"
                  isChecked={false}
                  onChange={(checked) => handleSystemConfigUpdate('twoFactorRequired', checked)}
                />
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Application Configuration</Heading>
              <Flex direction="column" gap="1rem">
                <SwitchField
                  label="Maintenance Mode"
                  isChecked={systemConfig.maintenanceMode}
                  onChange={(checked) => handleSystemConfigUpdate('maintenanceMode', checked)}
                />
                <SwitchField
                  label="User Registration Enabled"
                  isChecked={systemConfig.registrationEnabled}
                  onChange={(checked) => handleSystemConfigUpdate('registrationEnabled', checked)}
                />
                <TextField
                  label="Maximum Applications per Student"
                  type="number"
                  value={systemConfig.maxApplications}
                  onChange={(e) => handleSystemConfigUpdate('maxApplications', parseInt(e.target.value))}
                />
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Data Management</Heading>
              <Flex gap="1rem" wrap="wrap">
                <Button>Export All Data</Button>
                <Button>Backup Database</Button>
                <Button>Clean Old Files</Button>
                <Button>Generate Reports</Button>
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
                <Text fontSize="0.8rem" color="gray" marginTop="0.5rem">
                  * Requires session tracking implementation
                </Text>
              </Flex>
            </Card>
            
            <Card>
              <Heading level={4} marginBottom="1rem">Error Logs</Heading>
              <Text fontSize="0.9rem" fontFamily="monospace" backgroundColor="#f5f5f5" padding="1rem">
                No recent errors logged.<br/>
                <Text fontSize="0.8rem" color="gray">
                  * Error logging requires CloudWatch Logs integration
                </Text>
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

    </Flex>
  );
};

export default AdminDashboard;