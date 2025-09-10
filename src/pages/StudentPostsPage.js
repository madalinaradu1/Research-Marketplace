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
  TextField,
  TextAreaField,
  SelectField,
  Badge,
  View,
  Divider
} from '@aws-amplify/ui-react';
import { listStudentPosts, createStudentPost, updateStudentPost, deleteStudentPost } from '../graphql/student-post-operations';

const StudentPostsPage = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'RESEARCH_INTEREST',
    title: '',
    description: '',
    department: '',
    researchAreas: '',
    skillsOffered: '',
    skillsNeeded: '',
    timeCommitment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openKebabMenu, setOpenKebabMenu] = useState(null);

  const departments = [
    'Computer Science',
    'Biology',
    'Chemistry',
    'Physics',
    'Psychology',
    'Social Sciences',
    'Engineering',
    'Mathematics',
    'Business',
    'Education',
    'Nursing',
    'Technology',
    'Other'
  ];

  const postTypes = [
    { value: 'RESEARCH_INTEREST', label: 'Research Interest' },
    { value: 'MENTOR_WANTED', label: 'Mentor Wanted' },
    { value: 'RESEARCH_IDEA', label: 'Research Idea' }
  ];

  useEffect(() => {
    fetchPosts();
  }, [user]);
  
  // Close kebab menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenKebabMenu(null);
    };
    
    if (openKebabMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openKebabMenu]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const result = await API.graphql(graphqlOperation(listStudentPosts, {
        limit: 100
      }));
      
      setPosts(result.data.listStudentPosts.items || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userId = user.id || user.username;
      
      const input = {
        studentID: editingPost ? editingPost.studentID : userId,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        department: formData.department || null,
        researchAreas: formData.researchAreas ? formData.researchAreas.split(',').map(s => s.trim()) : [],
        skillsOffered: formData.skillsOffered ? formData.skillsOffered.split(',').map(s => s.trim()) : [],
        skillsNeeded: formData.skillsNeeded ? formData.skillsNeeded.split(',').map(s => s.trim()) : [],
        timeCommitment: formData.timeCommitment || null,
        isActive: true
      };

      if (editingPost) {
        input.id = editingPost.id;
        await API.graphql(graphqlOperation(updateStudentPost, { input }));
      } else {
        await API.graphql(graphqlOperation(createStudentPost, { input }));
      }

      setShowCreateForm(false);
      setEditingPost(null);
      setFormData({
        type: 'RESEARCH_INTEREST',
        title: '',
        description: '',
        department: '',
        researchAreas: '',
        skillsOffered: '',
        skillsNeeded: '',
        timeCommitment: ''
      });
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.errors) {
        console.error('GraphQL errors:', error.errors);
        error.errors.forEach(err => console.error('Error details:', err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      type: post.type,
      title: post.title,
      description: post.description,
      department: post.department || '',
      researchAreas: post.researchAreas ? post.researchAreas.join(', ') : '',
      skillsOffered: post.skillsOffered ? post.skillsOffered.join(', ') : '',
      skillsNeeded: post.skillsNeeded ? post.skillsNeeded.join(', ') : '',
      timeCommitment: post.timeCommitment || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (postId) => {
    setIsDeleting(true);
    try {
      await API.graphql(graphqlOperation(deleteStudentPost, { input: { id: postId } }));
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getMyPosts = () => {
    const userId = user.id || user.username;
    return posts.filter(post => post.student?.id === userId);
  };

  const getPostsByType = (type) => {
    return posts.filter(post => post.type === type && post.isActive);
  };

  const getPostTypeLabel = (type) => {
    return postTypes.find(pt => pt.value === type)?.label || type;
  };

  const getPostTypeColor = (type) => {
    switch (type) {
      case 'RESEARCH_INTEREST': return 'blue';
      case 'MENTOR_WANTED': return 'orange';
      case 'RESEARCH_IDEA': return 'green';
      default: return 'gray';
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
    <Flex direction="column" padding="2rem" gap="2rem">
      <Flex justifyContent="space-between" alignItems="center">
        <Heading level={2}>Student Research Community</Heading>
        <Button
          backgroundColor="white"
          color="black"
          border="1px solid black"
          size="small"
          onClick={() => setShowCreateForm(true)}
        >
          Create Post
        </Button>
      </Flex>

      <Text>
        Share your research interests, find mentors, or propose research ideas to connect with the research community.
      </Text>

      <Tabs currentIndex={activeTabIndex} onChange={setActiveTabIndex}>
        <TabItem title="All Posts">
          {posts.length === 0 ? (
            <Card>
              <Text>No posts yet. Be the first to share your research interests!</Text>
            </Card>
          ) : (
            <Collection
              items={posts.filter(post => post.isActive)}
              type="list"
              gap="1rem"
              wrap="nowrap"
              direction="column"
            >
              {(post) => (
                <Card key={post.id}>
                  <Flex direction="column" gap="1rem">
                    <Flex justifyContent="space-between" alignItems="flex-start">
                      <Flex direction="column" gap="0.5rem" flex="1">
                        <Flex alignItems="center" gap="1rem">
                          <Heading level={4}>{post.title}</Heading>
                          <Text fontSize="0.8rem" color="gray" fontWeight="bold">
                            {getPostTypeLabel(post.type)}
                          </Text>
                        </Flex>
                        <Text fontSize="0.9rem" color="gray">
                          {(user.id || user.username) === post.student?.id || ['Admin', 'Faculty', 'Coordinator'].includes(user.role) 
                            ? post.student?.name 
                            : 'Anonymous Student'} • {post.department || 'No Department'}
                        </Text>
                      </Flex>
                      <Flex alignItems="center" gap="1rem">
                        <Text fontSize="0.8rem" color="gray">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </Text>
                        {((user.id || user.username) === post.student?.id || user.role === 'Admin') && (
                          <View position="relative">
                            <Button 
                              size="medium"
                              backgroundColor="transparent"
                              color="black"
                              border="none"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenKebabMenu(openKebabMenu === post.id ? null : post.id);
                              }}
                              style={{ padding: '0.75rem' }}
                            >
                              ⋯
                            </Button>
                            {openKebabMenu === post.id && (
                              <Card
                                position="absolute"
                                top="100%"
                                left="0"
                                style={{ zIndex: 100, minWidth: '120px' }}
                                backgroundColor="white"
                                border="1px solid black"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Flex direction="column" gap="0">
                                  <Button
                                    size="small"
                                    backgroundColor="white"
                                    color="black"
                                    border="none"
                                    style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                    onClick={() => {
                                      handleEdit(post);
                                      setOpenKebabMenu(null);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="small"
                                    backgroundColor="white"
                                    color="black"
                                    border="none"
                                    style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                    onClick={() => {
                                      if (window.confirm('Are you sure you want to delete this post?')) {
                                        handleDelete(post.id);
                                      }
                                      setOpenKebabMenu(null);
                                    }}
                                    isLoading={isDeleting}
                                  >
                                    Delete
                                  </Button>
                                </Flex>
                              </Card>
                            )}
                          </View>
                        )}
                      </Flex>
                    </Flex>

                    <Text>{post.description}</Text>

                    {post.researchAreas && post.researchAreas.length > 0 && (
                      <Text fontSize="0.9rem">
                        <strong>Research Areas:</strong> {post.researchAreas.join(', ')}
                      </Text>
                    )}

                    {post.skillsOffered && post.skillsOffered.length > 0 && (
                      <Text fontSize="0.9rem">
                        <strong>Skills Offered:</strong> {post.skillsOffered.join(', ')}
                      </Text>
                    )}

                    {post.skillsNeeded && post.skillsNeeded.length > 0 && (
                      <Text fontSize="0.9rem">
                        <strong>Skills Needed:</strong> {post.skillsNeeded.join(', ')}
                      </Text>
                    )}

                    {post.timeCommitment && (
                      <Text fontSize="0.9rem">
                        <strong>Time Commitment:</strong> {post.timeCommitment}
                      </Text>
                    )}
                  </Flex>
                </Card>
              )}
            </Collection>
          )}
        </TabItem>

        <TabItem title="My Posts">
          {getMyPosts().length === 0 ? (
            <Card>
              <Text>You haven't created any posts yet.</Text>
              <Button
                backgroundColor="white"
                color="black"
                border="1px solid black"
                size="small"
                onClick={() => setShowCreateForm(true)}
                marginTop="1rem"
              >
                Create Your First Post
              </Button>
            </Card>
          ) : (
            <Collection
              items={getMyPosts()}
              type="list"
              gap="1rem"
              wrap="nowrap"
              direction="column"
            >
              {(post) => (
                <Card key={post.id}>
                  <Flex direction="column" gap="1rem">
                    <Flex justifyContent="space-between" alignItems="center">
                      <Flex alignItems="center" gap="1rem">
                        <Heading level={4}>{post.title}</Heading>
                        <Text fontSize="0.8rem" color="gray" fontWeight="bold">
                          {getPostTypeLabel(post.type)}
                        </Text>
                      </Flex>
                      <Flex alignItems="center" gap="1rem">
                        <Text fontSize="0.8rem" color="gray">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </Text>
                        {((user.id || user.username) === post.student?.id || user.role === 'Admin') && (
                          <View position="relative">
                            <Button 
                              size="medium"
                              backgroundColor="transparent"
                              color="black"
                              border="none"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenKebabMenu(openKebabMenu === post.id ? null : post.id);
                              }}
                              style={{ padding: '0.75rem' }}
                            >
                              ⋯
                            </Button>
                            {openKebabMenu === post.id && (
                              <Card
                                position="absolute"
                                top="100%"
                                left="0"
                                style={{ zIndex: 100, minWidth: '120px' }}
                                backgroundColor="white"
                                border="1px solid black"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Flex direction="column" gap="0">
                                  <Button
                                    size="small"
                                    backgroundColor="white"
                                    color="black"
                                    border="none"
                                    style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                    onClick={() => {
                                      handleEdit(post);
                                      setOpenKebabMenu(null);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="small"
                                    backgroundColor="white"
                                    color="black"
                                    border="none"
                                    style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                    onClick={() => {
                                      if (window.confirm('Are you sure you want to delete this post?')) {
                                        handleDelete(post.id);
                                      }
                                      setOpenKebabMenu(null);
                                    }}
                                    isLoading={isDeleting}
                                  >
                                    Delete
                                  </Button>
                                </Flex>
                              </Card>
                            )}
                          </View>
                        )}
                      </Flex>
                    </Flex>
                    <Text>{post.description}</Text>
                  </Flex>
                </Card>
              )}
            </Collection>
          )}
        </TabItem>
      </Tabs>

      {/* Create Post Modal */}
      {showCreateForm && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => setShowCreateForm(false)}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="800px"
              width="100%"
              maxHeight="100vh"
              style={{ overflow: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Heading level={3}>{editingPost ? 'Edit Post' : 'Create New Post'}</Heading>
              <Divider margin="1rem 0" />

              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="1rem">
                  <SelectField
                    name="type"
                    label="Post Type *"
                    value={formData.type}
                    onChange={handleFormChange}
                    required
                  >
                    {postTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </SelectField>

                  <TextField
                    name="title"
                    label="Title *"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                    placeholder="Brief, descriptive title"
                  />

                  <TextAreaField
                    name="description"
                    label="Description *"
                    value={formData.description}
                    onChange={handleFormChange}
                    required
                    rows={5}
                    placeholder="Detailed description of your research interest, mentor needs, or research idea"
                  />

                  <SelectField
                    name="department"
                    label="Department"
                    value={formData.department}
                    onChange={handleFormChange}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </SelectField>

                  <TextField
                    name="researchAreas"
                    label="Research Areas (comma-separated)"
                    value={formData.researchAreas}
                    onChange={handleFormChange}
                    placeholder="e.g. Machine Learning, Data Analysis, Bioinformatics"
                  />

                  <TextField
                    name="skillsOffered"
                    label="Skills You Offer (comma-separated)"
                    value={formData.skillsOffered}
                    onChange={handleFormChange}
                    placeholder="e.g. Python, Statistics, Lab Experience"
                  />

                  <TextField
                    name="skillsNeeded"
                    label="Skills You Need (comma-separated)"
                    value={formData.skillsNeeded}
                    onChange={handleFormChange}
                    placeholder="e.g. R Programming, Literature Review, Data Visualization"
                  />

                  <TextField
                    name="timeCommitment"
                    label="Time Commitment"
                    value={formData.timeCommitment}
                    onChange={handleFormChange}
                    placeholder="e.g. 10 hours/week, Flexible, Summer only"
                  />

                  <Flex gap="1rem" marginTop="1rem">
                    <Button onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      backgroundColor="white"
                      color="black"
                      border="1px solid black"
                      isLoading={isSubmitting}
                    >
                      {editingPost ? 'Update Post' : 'Create Post'}
                    </Button>
                  </Flex>
                </Flex>
              </form>
            </Card>
          </Flex>
        </View>
      )}
    </Flex>
  );
};

export default StudentPostsPage;