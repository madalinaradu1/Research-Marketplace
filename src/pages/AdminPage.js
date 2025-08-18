import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { 
  Flex, 
  Heading, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  Button,
  SelectField,
  Text,
  Card,
  Tabs,
  TabItem,
  Badge,
  useTheme
} from '@aws-amplify/ui-react';
import { listUsers, listProjects, listApplications } from '../graphql/operations';
import { updateUserRole } from '../utils/updateUserRole';
import { updateProfileCompletion } from '../utils/updateUserProfile';
import { syncUserGroupsToRole } from '../utils/syncUserGroups';
import { updateUser } from '../graphql/operations';

const AdminPage = () => {
  const { tokens } = useTheme();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [selectedDepartments, setSelectedDepartments] = useState({});

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      let userList = [];
      let projectList = [];
      let applicationList = [];
      
      // Fetch users
      try {
        console.log('Fetching users...');
        const usersResult = await API.graphql(graphqlOperation(listUsers, { limit: 100 }));
        userList = usersResult.data?.listUsers?.items || [];
        console.log('Users fetched successfully:', userList.length);
      } catch (userError) {
        console.error('Error fetching users:', userError);
        console.error('User error details:', userError.errors);
      }
      
      // Fetch projects
      try {
        console.log('Fetching projects...');
        const projectsResult = await API.graphql(graphqlOperation(listProjects, { limit: 100 }));
        projectList = projectsResult.data?.listProjects?.items || [];
        console.log('Projects fetched successfully:', projectList.length);
      } catch (projectError) {
        console.error('Error fetching projects:', projectError);
        console.error('Project error details:', projectError.errors);
      }
      
      // Fetch applications
      try {
        console.log('Fetching applications...');
        const applicationsResult = await API.graphql(graphqlOperation(listApplications, { limit: 100 }));
        applicationList = applicationsResult.data?.listApplications?.items || [];
        console.log('Applications fetched successfully:', applicationList.length);
      } catch (appError) {
        console.error('Error fetching applications:', appError);
        console.error('Application error details:', appError.errors);
      }
      
      // Calculate analytics
      const analyticsData = {
        totalUsers: userList?.length || 0,
        totalStudents: userList?.filter(u => u.role === 'Student')?.length || 0,
        totalFaculty: userList?.filter(u => u.role === 'Faculty')?.length || 0,
        totalCoordinators: userList?.filter(u => u.role === 'Coordinator')?.length || 0,
        totalProjects: projectList?.length || 0,
        activeProjects: projectList?.filter(p => p.isActive === true)?.length || 0,
        pendingProjects: projectList?.filter(p => p.isActive === false)?.length || 0,
        totalApplications: applicationList?.length || 0,
        pendingApplications: applicationList?.filter(a => a.status === 'Coordinator Review')?.length || 0,
        approvedApplications: applicationList?.filter(a => a.status === 'Approved')?.length || 0
      };
      
      // Initialize selected roles and departments
      const roles = {};
      const departments = {};
      userList?.forEach(user => {
        roles[user.id] = user.role || 'Student';
        departments[user.id] = user.department || '';
      });
      
      setUsers(userList);
      setProjects(projectList);
      setApplications(applicationList);
      setAnalytics(analyticsData);
      setSelectedRoles(roles);
      setSelectedDepartments(departments);
    } catch (err) {
      console.error('Error in fetchAllData:', err);
      console.error('Error details:', err.errors || err.message || err);
      setError(`Failed to load data: ${err.errors?.[0]?.message || err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId, role) => {
    setSelectedRoles(prev => ({
      ...prev,
      [userId]: role
    }));
  };

  const handleDepartmentChange = (userId, department) => {
    setSelectedDepartments(prev => ({
      ...prev,
      [userId]: department
    }));
  };

  const handleUpdateRole = async (userId) => {
    try {
      await updateUserRole(userId, selectedRoles[userId]);
      await syncUserGroupsToRole(userId);
      setMessage('User role and groups updated successfully!');
      fetchAllData();
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update user role. Please try again.');
    }
  };

  const handleUpdateDepartment = async (userId) => {
    try {
      const input = {
        id: userId,
        department: selectedDepartments[userId] || null
      };
      await API.graphql(graphqlOperation(updateUser, { input }));
      setMessage('Department updated successfully!');
      fetchAllData();
    } catch (err) {
      console.error('Error updating department:', err);
      setError('Failed to update department. Please try again.');
    }
  };
  
  const handleCompleteProfile = async (userId) => {
    try {
      await updateProfileCompletion(userId, true);
      // Refresh the data
      fetchAllData();
    } catch (err) {
      console.error('Error updating profile completion:', err);
      setError('Failed to update profile completion. Please try again.');
    }
  };
  
  const handleSyncGroups = async (userId) => {
    try {
      await syncUserGroupsToRole(userId);
      // Refresh the data
      fetchAllData();
      setMessage('User role synced with Cognito groups successfully!');
    } catch (err) {
      console.error('Error syncing user groups:', err);
      setError('Failed to sync user groups. Please try again.');
    }
  };

  if (loading) return <Text>Loading users...</Text>;
  if (error) return <Text variation="error">{error}</Text>;

  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>Admin Dashboard</Heading>
      
      {message && <Text color="green">{message}</Text>}
      {error && <Text color="red">{error}</Text>}
      
      <Tabs>
        <TabItem title="Analytics">
          <Flex direction="column" gap="2rem">
            <Heading level={3}>System Analytics</Heading>
            
            <Flex wrap="wrap" gap="1rem">
              <Card flex="1" minWidth="200px">
                <Heading level={4}>Users</Heading>
                <Text fontSize="2rem" fontWeight="bold">{analytics.totalUsers}</Text>
                <Flex gap="1rem" marginTop="0.5rem">
                  <Badge backgroundColor={tokens.colors.blue[60]} color="white">Students: {analytics.totalStudents}</Badge>
                  <Badge backgroundColor={tokens.colors.green[60]} color="white">Faculty: {analytics.totalFaculty}</Badge>
                  <Badge backgroundColor={tokens.colors.orange[60]} color="white">Coordinators: {analytics.totalCoordinators}</Badge>
                </Flex>
              </Card>
              
              <Card flex="1" minWidth="200px">
                <Heading level={4}>Projects</Heading>
                <Text fontSize="2rem" fontWeight="bold">{analytics.totalProjects}</Text>
                <Flex gap="1rem" marginTop="0.5rem">
                  <Badge backgroundColor={tokens.colors.green[60]} color="white">Active: {analytics.activeProjects}</Badge>
                  <Badge backgroundColor={tokens.colors.orange[60]} color="white">Pending: {analytics.pendingProjects}</Badge>
                </Flex>
              </Card>
              
              <Card flex="1" minWidth="200px">
                <Heading level={4}>Applications</Heading>
                <Text fontSize="2rem" fontWeight="bold">{analytics.totalApplications}</Text>
                <Flex gap="1rem" marginTop="0.5rem">
                  <Badge backgroundColor={tokens.colors.orange[60]} color="white">Pending: {analytics.pendingApplications}</Badge>
                  <Badge backgroundColor={tokens.colors.green[60]} color="white">Approved: {analytics.approvedApplications}</Badge>
                </Flex>
              </Card>
            </Flex>
            
            <Card>
              <Heading level={4}>Recent Activity</Heading>
              <Text>Activity tracking will be implemented with Lambda functions</Text>
            </Card>
          </Flex>
        </TabItem>
        
        <TabItem title="User Management">
          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell as="th">Name</TableCell>
                  <TableCell as="th">Email</TableCell>
                  <TableCell as="th">Role</TableCell>
                  <TableCell as="th">New Role</TableCell>
                  <TableCell as="th">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role || 'Student'}</TableCell>
                    <TableCell>
                      <SelectField
                        value={selectedRoles[user.id]}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        <option value="Student">Student</option>
                        <option value="Faculty">Faculty</option>
                        <option value="Coordinator">Coordinator</option>
                        <option value="Admin">Admin</option>
                      </SelectField>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleUpdateRole(user.id)}
                        isDisabled={user.role === selectedRoles[user.id]}
                        size="small"
                      >
                        Update Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabItem>
      </Tabs>
    </Flex>
  );
};

export default AdminPage;