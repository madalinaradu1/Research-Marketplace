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
  Card
} from '@aws-amplify/ui-react';
import { listUsers } from '../graphql/queries';
import { updateUserRole } from '../utils/updateUserRole';
import { updateProfileCompletion } from '../utils/updateUserProfile';
import { syncUserGroupsToRole } from '../utils/syncUserGroups';
import { updateUser } from '../graphql/operations';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [selectedDepartments, setSelectedDepartments] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await API.graphql(graphqlOperation(listUsers));
      const userList = result.data.listUsers.items;
      
      // Initialize selected roles and departments with current values
      const roles = {};
      const departments = {};
      userList.forEach(user => {
        roles[user.id] = user.role || 'Student';
        departments[user.id] = user.department || '';
      });
      
      setUsers(userList);
      setSelectedRoles(roles);
      setSelectedDepartments(departments);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
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
      // Refresh the user list
      fetchUsers();
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
      fetchUsers();
    } catch (err) {
      console.error('Error updating department:', err);
      setError('Failed to update department. Please try again.');
    }
  };
  
  const handleCompleteProfile = async (userId) => {
    try {
      await updateProfileCompletion(userId, true);
      // Refresh the user list
      fetchUsers();
    } catch (err) {
      console.error('Error updating profile completion:', err);
      setError('Failed to update profile completion. Please try again.');
    }
  };
  
  const handleSyncGroups = async (userId) => {
    try {
      await syncUserGroupsToRole(userId);
      // Refresh the user list
      fetchUsers();
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
      <Heading level={2}>User Management</Heading>
      
      {message && <Text color="green">{message}</Text>}
      {error && <Text color="red">{error}</Text>}
      
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell as="th">Name</TableCell>
              <TableCell as="th">Email</TableCell>
              <TableCell as="th">Role</TableCell>
              <TableCell as="th">Department</TableCell>
              <TableCell as="th">New Role</TableCell>
              <TableCell as="th">New Department</TableCell>
              <TableCell as="th">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role || 'Student'}</TableCell>
                <TableCell>{user.department || 'None'}</TableCell>
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
                  <SelectField
                    value={selectedDepartments[user.id]}
                    onChange={(e) => handleDepartmentChange(user.id, e.target.value)}
                  >
                    <option value="">None</option>
                    <option value="Social Sciences">Social Sciences</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Biology">Biology</option>
                    <option value="Psychology">Psychology</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                  </SelectField>
                </TableCell>
                <TableCell>
                  <Flex direction="column" gap="0.5rem">
                    <Flex direction="row" gap="0.5rem">
                      <Button
                        onClick={() => handleUpdateRole(user.id)}
                        isDisabled={user.role === selectedRoles[user.id]}
                        size="small"
                      >
                        Update Role
                      </Button>
                      <Button
                        onClick={() => handleUpdateDepartment(user.id)}
                        isDisabled={user.department === selectedDepartments[user.id]}
                        size="small"
                        variation="primary"
                      >
                        Update Dept
                      </Button>
                    </Flex>
                    <Flex direction="row" gap="0.5rem">
                      <Button
                        onClick={() => handleSyncGroups(user.id)}
                        size="small"
                        variation="link"
                      >
                        Sync Groups
                      </Button>
                    </Flex>
                  </Flex>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Flex>
  );
};

export default AdminPage;