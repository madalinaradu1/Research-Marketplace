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

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await API.graphql(graphqlOperation(listUsers));
      const userList = result.data.listUsers.items;
      
      // Initialize selected roles with current roles
      const roles = {};
      userList.forEach(user => {
        roles[user.id] = user.role || 'Student';
      });
      
      setUsers(userList);
      setSelectedRoles(roles);
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

  if (loading) return <Text>Loading users...</Text>;
  if (error) return <Text variation="error">{error}</Text>;

  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>User Management</Heading>
      
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell as="th">Name</TableCell>
              <TableCell as="th">Email</TableCell>
              <TableCell as="th">Current Role</TableCell>
              <TableCell as="th">Profile Complete</TableCell>
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
                <TableCell>{user.profileComplete ? 'Yes' : 'No'}</TableCell>
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
                  <Flex direction="row" gap="0.5rem">
                    <Button
                      onClick={() => handleUpdateRole(user.id)}
                      isDisabled={user.role === selectedRoles[user.id]}
                      size="small"
                    >
                      Update Role
                    </Button>
                    {!user.profileComplete && (
                      <Button
                        onClick={() => handleCompleteProfile(user.id)}
                        size="small"
                        variation="primary"
                      >
                        Mark Complete
                      </Button>
                    )}
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