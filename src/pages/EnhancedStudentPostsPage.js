import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { Flex, Heading, Text, Button, Card, Loader, Tabs, TabItem, TextField, TextAreaField, SelectField, View } from '@aws-amplify/ui-react';
import { listStudentPosts, createStudentPost, updateStudentPost, deleteStudentPost, onCreateStudentPostCustom, onUpdateStudentPostCustom, onDeleteStudentPostCustom } from '../graphql/student-post-operations';
import PostCard from '../components/PostCard';
import SearchFilterBar from '../components/SearchFilterBar';
import PostDetailModal from '../components/PostDetailModal';
import { useNavigate } from 'react-router-dom';

const EnhancedStudentPostsPage = ({ user }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
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
  const [filters, setFilters] = useState({
    keyword: '',
    type: '',
    researchArea: '',
    timeCommitment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const colleges = ['Computer Science', 'Biology', 'Chemistry', 'Physics', 'Psychology', 'Social Sciences', 'Engineering', 'Mathematics', 'Business', 'Education', 'Nursing', 'Technology', 'Other'];
  const postTypes = [
    { value: 'RESEARCH_INTEREST', label: 'Research Interest' },
    { value: 'MENTOR_WANTED', label: 'Mentor Wanted' },
    { value: 'RESEARCH_IDEA', label: 'Research Idea' }
  ];

  useEffect(() => {
    fetchPosts();
    setupSubscriptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [posts, filters, activeTabIndex]);

  const setupSubscriptions = () => {
    try {
      const createSub = API.graphql(graphqlOperation(onCreateStudentPostCustom)).subscribe({
        next: ({ value }) => {
          const newPost = value.data.onCreateStudentPost;
          fetchPostWithStudent(newPost);
        },
        error: (error) => console.warn('Subscription error:', error)
      });

      const updateSub = API.graphql(graphqlOperation(onUpdateStudentPostCustom)).subscribe({
        next: ({ value }) => {
          const updatedPost = value.data.onUpdateStudentPost;
          setPosts(prev => prev.map(p => p.id === updatedPost.id ? { ...p, ...updatedPost } : p));
        },
        error: (error) => console.warn('Subscription error:', error)
      });

      const deleteSub = API.graphql(graphqlOperation(onDeleteStudentPostCustom)).subscribe({
        next: ({ value }) => {
          const deletedId = value.data.onDeleteStudentPost.id;
          setPosts(prev => prev.filter(p => p.id !== deletedId));
        },
        error: (error) => console.warn('Subscription error:', error)
      });

      return () => {
        createSub.unsubscribe();
        updateSub.unsubscribe();
        deleteSub.unsubscribe();
      };
    } catch (error) {
      console.warn('Subscriptions not available:', error);
      return () => {};
    }
  };

  const fetchPostWithStudent = async (post) => {
    if (!post.student && post.studentID) {
      try {
        const { getUser } = await import('../graphql/operations');
        const studentResult = await API.graphql(graphqlOperation(getUser, { id: post.studentID }));
        setPosts(prev => [...prev, { ...post, student: studentResult.data.getUser }]);
      } catch (error) {
        console.error('Error fetching student:', error);
        setPosts(prev => [...prev, post]);
      }
    } else {
      setPosts(prev => [...prev, post]);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const result = await API.graphql(graphqlOperation(listStudentPosts, { limit: 100 }));
      const posts = result.data.listStudentPosts.items || [];
      
      const postsWithStudents = await Promise.all(
        posts.map(async (post) => {
          if (!post.student && post.studentID) {
            try {
              const { getUser } = await import('../graphql/operations');
              const studentResult = await API.graphql(graphqlOperation(getUser, { id: post.studentID }));
              return { ...post, student: studentResult.data.getUser };
            } catch (error) {
              return post;
            }
          }
          return post;
        })
      );
      
      setPosts(postsWithStudents);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...posts];

    // Tab filtering
    if (activeTabIndex === 1) {
      const userId = user.id || user.username;
      filtered = filtered.filter(post => post.student?.id === userId);
    }

    // Keyword search
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(post =>
        post.title?.toLowerCase().includes(keyword) ||
        post.description?.toLowerCase().includes(keyword) ||
        post.skillsOffered?.some(s => s.toLowerCase().includes(keyword)) ||
        post.skillsNeeded?.some(s => s.toLowerCase().includes(keyword))
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(post => post.type === filters.type);
    }

    // Research area filter
    if (filters.researchArea) {
      filtered = filtered.filter(post =>
        post.researchAreas?.some(area => area.includes(filters.researchArea))
      );
    }

    // Time commitment filter
    if (filters.timeCommitment) {
      filtered = filtered.filter(post =>
        post.timeCommitment?.includes(filters.timeCommitment)
      );
    }

    setFilteredPosts(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ keyword: '', type: '', researchArea: '', timeCommitment: '' });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(v => v !== '').length;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const userId = user.id || user.username;
      const input = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        department: formData.department || null,
        researchAreas: formData.researchAreas ? formData.researchAreas.split(',').map(s => s.trim()) : [],
        skillsOffered: formData.skillsOffered ? formData.skillsOffered.split(',').map(s => s.trim()) : [],
        skillsNeeded: formData.skillsNeeded ? formData.skillsNeeded.split(',').map(s => s.trim()) : [],
        timeCommitment: formData.timeCommitment || null
      };

      if (editingPost) {
        input.id = editingPost.id;
        await API.graphql(graphqlOperation(updateStudentPost, { input }));
      } else {
        input.studentID = userId;
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
    } catch (error) {
      console.error('Error saving post:', error);
      setSubmitError(error.errors?.[0]?.message || error.message || 'Failed to save post');
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

  const handleDelete = async (post) => {
    setPostToDelete(post);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await API.graphql(graphqlOperation(deleteStudentPost, { input: { id: postToDelete.id } }));
      setShowDeleteConfirm(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Loader size="large" />
      </Flex>
    );
  }

  return (
    <View width="100%" backgroundColor="#F9FAFB" minHeight="100vh">
      <Flex direction="column" padding="2rem" gap="1.5rem" maxWidth="1400px" margin="0 auto">
        {/* Header */}
        <Card backgroundColor="white" padding="2rem" borderRadius="12px" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <Flex justifyContent="space-between" alignItems="center">
            <Flex direction="column" gap="0.5rem">
              <Heading level={2} color="#111827">Student Research Community</Heading>
              <Text color="#6B7280" fontSize="1rem">
                Connect with peers, share research interests, and find mentors
              </Text>
            </Flex>
            <Button
              backgroundColor="#3B82F6"
              color="white"
              size="large"
              onClick={() => setShowCreateForm(true)}
              style={{ borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: '600' }}
            >
              ➕ Create Post
            </Button>
          </Flex>
        </Card>

        {/* Search & Filters */}
        <SearchFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          activeFiltersCount={getActiveFiltersCount()}
        />

        {/* Tabs */}
        <Tabs currentIndex={activeTabIndex} onChange={setActiveTabIndex}>
          <TabItem title={`All Posts (${posts.filter(p => p.student).length})`}>
            {filteredPosts.filter(p => p.student).length === 0 ? (
              <Card backgroundColor="white" padding="3rem" borderRadius="12px" style={{ textAlign: 'center' }}>
                <Text fontSize="3rem">💬</Text>
                <Heading level={4} color="#6B7280" marginTop="1rem">No posts found</Heading>
                <Text color="#9CA3AF" marginTop="0.5rem">
                  {getActiveFiltersCount() > 0 ? 'Try adjusting your filters' : 'Be the first to share your research interests!'}
                </Text>
              </Card>
            ) : (
              <View
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                  gap: '1.5rem'
                }}
              >
                {filteredPosts.filter(p => p.student).map(post => (
                  <View key={post.id}>
                    <PostCard
                      post={post}
                      user={user}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onExpand={setSelectedPost}
                    />
                    {(user.id || user.username) !== post.student?.id && (
                      <Button
                        size="small"
                        backgroundColor="#3B82F6"
                        color="white"
                        onClick={() => navigate('/messages', { state: { recipientId: post.student?.id, recipientName: post.student?.name, subject: `Re: ${post.title}` } })}
                        style={{ width: '100%', marginTop: '-0.5rem', borderRadius: '0 0 12px 12px' }}
                      >
                        💬 Message
                      </Button>
                    )}
                  </View>
                ))}
              </View>
            )}
          </TabItem>

          <TabItem title={`My Posts (${posts.filter(p => p.student?.id === (user.id || user.username)).length})`}>
            {filteredPosts.filter(p => p.student).length === 0 ? (
              <Card backgroundColor="white" padding="3rem" borderRadius="12px" style={{ textAlign: 'center' }}>
                <Text fontSize="3rem">📝</Text>
                <Heading level={4} color="#6B7280" marginTop="1rem">No posts yet</Heading>
                <Text color="#9CA3AF" marginTop="0.5rem">Create your first post to get started</Text>
                <Button
                  backgroundColor="#3B82F6"
                  color="white"
                  marginTop="1.5rem"
                  onClick={() => setShowCreateForm(true)}
                  style={{ borderRadius: '8px' }}
                >
                  Create Post
                </Button>
              </Card>
            ) : (
              <View
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                  gap: '1.5rem'
                }}
              >
                {filteredPosts.filter(p => p.student).map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    user={user}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onExpand={setSelectedPost}
                  />
                ))}
              </View>
            )}
          </TabItem>
        </Tabs>

        {/* Create/Edit Modal */}
        {showCreateForm && (
          <View
            position="fixed"
            top="0"
            left="0"
            width="100vw"
            height="100vh"
            backgroundColor="rgba(0, 0, 0, 0.6)"
            style={{ zIndex: 1000, backdropFilter: 'blur(4px)' }}
            onClick={() => {
              setShowCreateForm(false);
              setEditingPost(null);
            }}
          >
            <Flex justifyContent="center" alignItems="center" height="100%" padding="2rem">
              <Card
                maxWidth="700px"
                width="100%"
                maxHeight="90vh"
                backgroundColor="white"
                borderRadius="16px"
                style={{ overflow: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <Flex direction="column" gap="1.5rem" padding="2rem">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Heading level={3} color="#111827">{editingPost ? 'Edit Post' : 'Create New Post'}</Heading>
                    <Button
                      size="small"
                      backgroundColor="transparent"
                      color="#6B7280"
                      border="none"
                      data-close-button="true"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingPost(null);
                      }}
                      style={{ fontSize: '1.5rem' }}
                    >
                      <span className="closeButtonGlyph" aria-hidden="true">&times;</span>
                    </Button>
                  </Flex>

                  <form onSubmit={handleSubmit}>
                    <Flex direction="column" gap="1rem">
                      {submitError && (
                        <Card backgroundColor="#FEE2E2" padding="1rem" borderRadius="8px">
                          <Text color="#DC2626">{submitError}</Text>
                        </Card>
                      )}

                      <SelectField name="type" label="Post Type *" value={formData.type} onChange={handleFormChange} required>
                        {postTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </SelectField>

                      <TextField name="title" label="Title *" value={formData.title} onChange={handleFormChange} required placeholder="Brief, descriptive title" />
                      <TextAreaField name="description" label="Description *" value={formData.description} onChange={handleFormChange} required rows={5} placeholder="Detailed description" />
                      <SelectField name="department" label="College" value={formData.department} onChange={handleFormChange}>
                        <option value="">Select College</option>
                        {colleges.map(college => (
                          <option key={college} value={college}>{college}</option>
                        ))}
                      </SelectField>

                      <TextField name="researchAreas" label="Research Areas (comma-separated)" value={formData.researchAreas} onChange={handleFormChange} placeholder="e.g. Machine Learning, Data Analysis" />
                      <TextField name="skillsOffered" label="Skills You Offer (comma-separated)" value={formData.skillsOffered} onChange={handleFormChange} placeholder="e.g. Python, Statistics" />
                      <TextField name="skillsNeeded" label="Skills You Need (comma-separated)" value={formData.skillsNeeded} onChange={handleFormChange} placeholder="e.g. R Programming, Data Visualization" />
                      <TextField name="timeCommitment" label="Time Commitment" value={formData.timeCommitment} onChange={handleFormChange} placeholder="e.g. 10 hours/week" />

                      <Flex gap="1rem" marginTop="1rem" justifyContent="flex-end">
                        <Button onClick={() => { setShowCreateForm(false); setEditingPost(null); }} backgroundColor="white" color="#6B7280" border="1px solid #E5E7EB" style={{ borderRadius: '8px' }}>
                          Cancel
                        </Button>
                        <Button type="submit" backgroundColor="#3B82F6" color="white" isLoading={isSubmitting} style={{ borderRadius: '8px' }}>
                          {editingPost ? 'Update Post' : 'Create Post'}
                        </Button>
                      </Flex>
                    </Flex>
                  </form>
                </Flex>
              </Card>
            </Flex>
          </View>
        )}

        {/* Detail Modal */}
        {selectedPost && (
          <PostDetailModal
            post={selectedPost}
            user={user}
            onClose={() => setSelectedPost(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <View
            position="fixed"
            top="0"
            left="0"
            width="100vw"
            height="100vh"
            backgroundColor="rgba(0, 0, 0, 0.6)"
            style={{ zIndex: 1001, backdropFilter: 'blur(4px)' }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <Flex justifyContent="center" alignItems="center" height="100%">
              <Card width="400px" borderRadius="12px" onClick={(e) => e.stopPropagation()}>
                <Heading level={4} marginBottom="1rem">Delete Post</Heading>
                <Text marginBottom="2rem">Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.</Text>
                <Flex gap="1rem">
                  <Button onClick={() => setShowDeleteConfirm(false)} flex="1" backgroundColor="white" border="1px solid #E5E7EB">Cancel</Button>
                  <Button onClick={confirmDelete} flex="1" backgroundColor="#EF4444" color="white">Delete</Button>
                </Flex>
              </Card>
            </Flex>
          </View>
        )}
      </Flex>
    </View>
  );
};

export default EnhancedStudentPostsPage;
