import React, { useState, useEffect, useMemo } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import {
  Flex,
  Heading,
  Text,
  Button,
  Card,
  Loader,
  TextField,
  TextAreaField,
  SelectField,
  Badge,
  View,
  Tabs,
  TabItem
} from '@aws-amplify/ui-react';
import { listStudentPosts, createStudentPost, updateStudentPost, deleteStudentPost } from '../graphql/student-post-operations';
import SliderTabs from '../components/SliderTabs';
import TagSelector from '../components/TagSelector';
import '../components/TagSelector/tagSelector.css';
import { useTags } from '../contexts/TagContext';
import { tagIdsToDisplayNames, toStringArray } from '../components/TagSelector/tagHelpers';
import { hasWordPrefixMatch } from '../lib/tags/normalize';
import dashboardStyles from './StudentDashboard.module.css';

const COLLEGE_OPTIONS = [
  'College of the Arts and Sciences',
  'Collangelo College of Business',
  'College of Education',
  'College of Nursing and Health Care Professions',
  'College of Science, Engineering, and Technology',
  'College of Theology',
  'College of Doctoral Studies',
  'College of Health Sciences',
  'College of Graduate Studies'
];

const EMPTY_FORM_DATA = {
  type: 'RESEARCH_INTEREST',
  title: '',
  description: '',
  department: '',
  timeCommitment: ''
};

function splitResolvedAndLegacyValues(values, resolveTagIds) {
  const resolvedIds = [];
  const legacyValues = [];

  toStringArray(values).forEach((value) => {
    const nextIds = resolveTagIds([value]);

    if (nextIds.length > 0) {
      resolvedIds.push(...nextIds);
      return;
    }

    legacyValues.push(value);
  });

  return {
    resolvedIds: Array.from(new Set(resolvedIds)),
    legacyValues: Array.from(new Set(legacyValues))
  };
}

function combineSelectedAndLegacyValues(selectedTagIds, legacyValues, tagsById) {
  return Array.from(
    new Set([
      ...tagIdsToDisplayNames(selectedTagIds, tagsById),
      ...toStringArray(legacyValues)
    ])
  );
}

const StudentPostsPage = ({ user }) => {
  const { tagsById, resolveTagIds } = useTags();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openKebabMenu, setOpenKebabMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [debouncedCollegeQuery, setDebouncedCollegeQuery] = useState('');
  const [researchAreaTagIds, setResearchAreaTagIds] = useState([]);
  const [skillsOfferedTagIds, setSkillsOfferedTagIds] = useState([]);
  const [skillsNeededTagIds, setSkillsNeededTagIds] = useState([]);
  const [legacyResearchAreas, setLegacyResearchAreas] = useState([]);
  const [legacySkillsOffered, setLegacySkillsOffered] = useState([]);
  const [legacySkillsNeeded, setLegacySkillsNeeded] = useState([]);

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

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedCollegeQuery(formData.department || '');
    }, 250);

    return () => clearTimeout(t);
  }, [formData.department]);

  const collegeSuggestions = useMemo(() => {
    const query = (debouncedCollegeQuery || '').trim();
    return COLLEGE_OPTIONS
      .filter((college) => !query || hasWordPrefixMatch(college, query))
      .slice(0, 8);
  }, [debouncedCollegeQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const result = await API.graphql(graphqlOperation(listStudentPosts, {
        limit: 100
      }));
      
      const posts = result.data.listStudentPosts.items || [];
      console.log('Fetched posts:', posts.length, posts);
      
      // Fetch student data for each post if not already included
      const postsWithStudents = await Promise.all(
        posts.map(async (post) => {
          if (!post.student && post.studentID) {
            try {
              const { getUser } = await import('../graphql/operations');
              const studentResult = await API.graphql(graphqlOperation(getUser, {
                id: post.studentID
              }));
              return {
                ...post,
                student: studentResult.data.getUser
              };
            } catch (error) {
              console.error('Error fetching student for post:', post.id, error);
              return post;
            }
          }
          return post;
        })
      );
      
      setPosts(postsWithStudents);
    } catch (error) {
      console.error('Error fetching posts:', error);
      console.error('Fetch error details:', JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCollegeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, department: value }));
    setShowCollegeDropdown(true);
  };

  const handleCollegeSelect = (college) => {
    setFormData((prev) => ({ ...prev, department: college }));
    setShowCollegeDropdown(false);
  };

  const resetCreateForm = () => {
    setFormData(EMPTY_FORM_DATA);
    setEditingPost(null);
    setResearchAreaTagIds([]);
    setSkillsOfferedTagIds([]);
    setSkillsNeededTagIds([]);
    setLegacyResearchAreas([]);
    setLegacySkillsOffered([]);
    setLegacySkillsNeeded([]);
    setShowCollegeDropdown(false);
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    resetCreateForm();
  };

  const handleResearchAreasChange = (nextIds) => {
    setResearchAreaTagIds(nextIds);
    setLegacyResearchAreas([]);
  };

  const handleSkillsOfferedChange = (nextIds) => {
    setSkillsOfferedTagIds(nextIds);
    setLegacySkillsOffered([]);
  };

  const handleSkillsNeededChange = (nextIds) => {
    setSkillsNeededTagIds(nextIds);
    setLegacySkillsNeeded([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userId = user.id || user.username;
      
      const input = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        department: formData.department || null,
        researchAreas: combineSelectedAndLegacyValues(researchAreaTagIds, legacyResearchAreas, tagsById),
        skillsOffered: combineSelectedAndLegacyValues(skillsOfferedTagIds, legacySkillsOffered, tagsById),
        skillsNeeded: combineSelectedAndLegacyValues(skillsNeededTagIds, legacySkillsNeeded, tagsById),
        timeCommitment: formData.timeCommitment || null
      };

      if (editingPost) {
        input.id = editingPost.id;
        await API.graphql(graphqlOperation(updateStudentPost, { input }));
      } else {
        input.studentID = userId;
        const result = await API.graphql(graphqlOperation(createStudentPost, { input }));
        console.log('Post created:', result);
      }

      await fetchPosts();
      setShowCreateForm(false);
      resetCreateForm();
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      if (error.errors) {
        console.error('GraphQL errors:', error.errors);
        error.errors.forEach(err => {
          console.error('Error details:', err);
          console.error('Error message:', err.message);
          console.error('Error path:', err.path);
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (post) => {
    const resolvedResearchAreas = splitResolvedAndLegacyValues(post.researchAreas, resolveTagIds);
    const resolvedSkillsOffered = splitResolvedAndLegacyValues(post.skillsOffered, resolveTagIds);
    const resolvedSkillsNeeded = splitResolvedAndLegacyValues(post.skillsNeeded, resolveTagIds);

    setEditingPost(post);
    setFormData({
      type: post.type,
      title: post.title,
      description: post.description,
      department: post.department || '',
      timeCommitment: post.timeCommitment || ''
    });
    setResearchAreaTagIds(resolvedResearchAreas.resolvedIds);
    setSkillsOfferedTagIds(resolvedSkillsOffered.resolvedIds);
    setSkillsNeededTagIds(resolvedSkillsNeeded.resolvedIds);
    setLegacyResearchAreas(resolvedResearchAreas.legacyValues);
    setLegacySkillsOffered(resolvedSkillsOffered.legacyValues);
    setLegacySkillsNeeded(resolvedSkillsNeeded.legacyValues);
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

  const getPostTypeLabel = (type) => {
    return postTypes.find(pt => pt.value === type)?.label || type;
  };

  const getPostTypeBadgeTheme = (type) => {
    switch (type) {
      case 'RESEARCH_INTEREST':
        return {
          backgroundColor: '#e8efff',
          borderColor: '#c7d6ff',
          color: '#315ea8'
        };
      case 'MENTOR_WANTED':
        return {
          backgroundColor: '#fff0de',
          borderColor: '#f3d1aa',
          color: '#b46b18'
        };
      case 'RESEARCH_IDEA':
        return {
          backgroundColor: '#e6f6ed',
          borderColor: '#bddfc9',
          color: '#2f7c56'
        };
      default:
        return {
          backgroundColor: '#f1f5f9',
          borderColor: '#d8e0ea',
          color: '#52606f'
        };
    }
  };

  const renderPostTypeBadge = (type) => {
    const badgeTheme = getPostTypeBadgeTheme(type);

    return (
      <Badge
        backgroundColor={badgeTheme.backgroundColor}
        color={badgeTheme.color}
        fontSize="0.8rem"
        padding="0.3rem 0.85rem"
        borderRadius="999px"
        style={{
          border: `1px solid ${badgeTheme.borderColor}`,
          fontWeight: 700
        }}
      >
        {getPostTypeLabel(type)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }

  const validPosts = posts.filter(post => post.student);
  const myPosts = getMyPosts().filter(post => post.student);
  const createPostButtonClassName = `${dashboardStyles.actionButton} ${dashboardStyles.actionButtonPrimary} ${dashboardStyles.actionButtonWide}`;
  const submitPostButtonClassName = `${dashboardStyles.actionButton} ${dashboardStyles.actionButtonPrimary} ${dashboardStyles.actionButtonCompact}`;
  const secondaryActionButtonClassName = `${dashboardStyles.actionButton} ${dashboardStyles.actionButtonGhost} ${dashboardStyles.actionButtonCompact}`;
  const iconActionButtonClassName = `${dashboardStyles.actionButton} ${dashboardStyles.actionButtonGhost} ${dashboardStyles.actionButtonCompact} ${dashboardStyles.actionButtonIcon}`;

  const allPostsContent = (
    <Card backgroundColor="white" padding="1.5rem">
      {validPosts.length === 0 ? (
        <Flex direction="column" alignItems="center" gap="1rem" padding="2rem">
          <Text fontSize="3rem" aria-hidden="true">&#128172;</Text>
          <Text fontSize="1.1rem" color="#4a5568">No posts yet</Text>
          <Text fontSize="0.9rem" color="#718096">Be the first to share your research interests!</Text>
        </Flex>
      ) : (
        <Flex direction="column" gap="0.75rem">
          {validPosts.map((post) => (
            <Card key={post.id} backgroundColor="#f8fafc" padding="1.5rem" border="1px solid #e2e8f0">
              <Flex direction="column" gap="1rem">
                <Flex justifyContent="space-between" alignItems="flex-start">
                  <Flex direction="column" gap="0.5rem" flex="1">
                    <Flex alignItems="center" gap="1rem">
                      <Heading level={4} color="#2d3748">{post.title}</Heading>
                      {renderPostTypeBadge(post.type)}
                    </Flex>
                    <Text fontSize="0.9rem" color="#4a5568">
                      {(user.id || user.username) === post.student?.id || ['Admin', 'Faculty', 'Coordinator'].includes(user.role)
                        ? post.student?.name
                        : 'GCU Student'} <span aria-hidden="true">&middot;</span> {post.department || 'No College'}
                    </Text>
                  </Flex>
                  <Flex alignItems="center" gap="1rem">
                    <Text fontSize="0.8rem" color="gray">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Text>
                    {((user.id || user.username) === post.student?.id || ['Admin', 'Coordinator'].includes(user.role)) && (
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
                          <span aria-hidden="true">&#8942;</span>
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
                                  setPostToDelete(post);
                                  setShowDeleteConfirm(true);
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

                <Text color="#4a5568">{post.description}</Text>

                {post.researchAreas && post.researchAreas.length > 0 && (
                  <Text fontSize="0.9rem" color="#4a5568">
                    <strong>Research Areas:</strong> {post.researchAreas.join(', ')}
                  </Text>
                )}

                {post.skillsOffered && post.skillsOffered.length > 0 && (
                  <Text fontSize="0.9rem" color="#4a5568">
                    <strong>Skills Offered:</strong> {post.skillsOffered.join(', ')}
                  </Text>
                )}

                {post.skillsNeeded && post.skillsNeeded.length > 0 && (
                  <Text fontSize="0.9rem" color="#4a5568">
                    <strong>Skills Needed:</strong> {post.skillsNeeded.join(', ')}
                  </Text>
                )}

                {post.timeCommitment && (
                  <Text fontSize="0.9rem" color="#4a5568">
                    <strong>Time Commitment:</strong> {post.timeCommitment}
                  </Text>
                )}
              </Flex>
            </Card>
          ))}
        </Flex>
      )}
    </Card>
  );

  const myPostsContent = (
    <Card backgroundColor="white" padding="1.5rem">
      {myPosts.length === 0 ? (
        <Flex direction="column" alignItems="center" gap="1rem" padding="2rem">
          <Text fontSize="1.1rem" color="#4a5568">You haven't created any posts yet</Text>
          <Button
            type="button"
            className={createPostButtonClassName}
            onClick={() => {
              resetCreateForm();
              setShowCreateForm(true);
            }}
          >
            Create Your First Post
          </Button>
        </Flex>
      ) : (
        <Flex direction="column" gap="0.75rem">
          {myPosts.map((post) => (
            <Card key={post.id} backgroundColor="#f8fafc" padding="1.5rem" border="1px solid #e2e8f0">
              <Flex direction="column" gap="1rem">
                <Flex justifyContent="space-between" alignItems="center">
                  <Flex alignItems="center" gap="1rem">
                    <Heading level={4} color="#2d3748">{post.title}</Heading>
                    {renderPostTypeBadge(post.type)}
                  </Flex>
                  <Flex alignItems="center" gap="1rem">
                    <Text fontSize="0.8rem" color="gray">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Text>
                    {((user.id || user.username) === post.student?.id || ['Admin', 'Coordinator'].includes(user.role)) && (
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
                          <span aria-hidden="true">&#8942;</span>
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
                                  setPostToDelete(post);
                                  setShowDeleteConfirm(true);
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
                <Text color="#4a5568">{post.description}</Text>
              </Flex>
            </Card>
          ))}
        </Flex>
      )}
    </Card>
  );

  const communityTabs = [
    { label: 'All Posts', content: allPostsContent },
    { label: 'My Posts', content: myPostsContent }
  ];

  return (
    <View width="100%" backgroundColor="#f5f5f5">
      <Flex direction="column" padding="2rem" gap="2rem">
        <Card backgroundColor="white" padding="1.5rem">
          <Flex justifyContent="space-between" alignItems="center">
            <Flex direction="column" gap="0.5rem">
              <Heading level={2} color="#2d3748">Student Research Community</Heading>
              <Text color="#4a5568">
                Share your research interests, find mentors, or propose research ideas to connect with the research community.
              </Text>
            </Flex>
            <Button
              type="button"
              className={createPostButtonClassName}
              onClick={() => {
                resetCreateForm();
                setShowCreateForm(true);
              }}
            >
              Create Post
            </Button>
          </Flex>
        </Card>

      <SliderTabs
        currentIndex={activeTabIndex}
        onChange={setActiveTabIndex}
        tabs={communityTabs}
      />

      {false && (
        <Tabs currentIndex={activeTabIndex} onChange={setActiveTabIndex}>
        <TabItem title="All Posts">
          <Card backgroundColor="white" padding="1.5rem">
            {(() => {
              const validPosts = posts.filter(post => post.student);
              return validPosts.length === 0 ? (
                <Flex direction="column" alignItems="center" gap="1rem" padding="2rem">
                  <Text fontSize="3rem" aria-hidden="true">&#128172;</Text>
                  <Text fontSize="1.1rem" color="#4a5568">No posts yet</Text>
                  <Text fontSize="0.9rem" color="#718096">Be the first to share your research interests!</Text>
                </Flex>
              ) : (
                <Flex direction="column" gap="0.75rem">
                  {validPosts.map((post) => (
                  <Card key={post.id} backgroundColor="#f8fafc" padding="1.5rem" border="1px solid #e2e8f0">
                    <Flex direction="column" gap="1rem">
                      <Flex justifyContent="space-between" alignItems="flex-start">
                        <Flex direction="column" gap="0.5rem" flex="1">
                          <Flex alignItems="center" gap="1rem">
                            <Heading level={4} color="#2d3748">{post.title}</Heading>
                            {renderPostTypeBadge(post.type)}
                          </Flex>
                          <Text fontSize="0.9rem" color="#4a5568">
                            {(user.id || user.username) === post.student?.id || ['Admin', 'Faculty', 'Coordinator'].includes(user.role) 
                              ? post.student?.name 
                              : 'GCU Student'} <span aria-hidden="true">&middot;</span> {post.department || 'No College'}
                          </Text>
                        </Flex>
                      <Flex alignItems="center" gap="1rem">
                        <Text fontSize="0.8rem" color="gray">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </Text>
                        {((user.id || user.username) === post.student?.id || ['Admin', 'Coordinator'].includes(user.role)) && (
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
                              <span aria-hidden="true">&#8942;</span>
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
                                      setPostToDelete(post);
                                      setShowDeleteConfirm(true);
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

                      <Text color="#4a5568">{post.description}</Text>

                      {post.researchAreas && post.researchAreas.length > 0 && (
                        <Text fontSize="0.9rem" color="#4a5568">
                          <strong>Research Areas:</strong> {post.researchAreas.join(', ')}
                        </Text>
                      )}

                      {post.skillsOffered && post.skillsOffered.length > 0 && (
                        <Text fontSize="0.9rem" color="#4a5568">
                          <strong>Skills Offered:</strong> {post.skillsOffered.join(', ')}
                        </Text>
                      )}

                      {post.skillsNeeded && post.skillsNeeded.length > 0 && (
                        <Text fontSize="0.9rem" color="#4a5568">
                          <strong>Skills Needed:</strong> {post.skillsNeeded.join(', ')}
                        </Text>
                      )}

                      {post.timeCommitment && (
                        <Text fontSize="0.9rem" color="#4a5568">
                          <strong>Time Commitment:</strong> {post.timeCommitment}
                        </Text>
                      )}
                    </Flex>
                  </Card>
                  ))}
                </Flex>
              );
            })()}
          </Card>
        </TabItem>

        <TabItem title="My Posts">
          <Card backgroundColor="white" padding="1.5rem">
            {getMyPosts().filter(post => post.student).length === 0 ? (
              <Flex direction="column" alignItems="center" gap="1rem" padding="2rem">
                <Text fontSize="1.1rem" color="#4a5568">You haven't created any posts yet</Text>
                <Button
                  backgroundColor="#4299e1"
                  color="white"
                  size="small"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create Your First Post
                </Button>
              </Flex>
            ) : (
              <Flex direction="column" gap="0.75rem">
                {getMyPosts().filter(post => post.student).map((post) => (
                  <Card key={post.id} backgroundColor="#f8fafc" padding="1.5rem" border="1px solid #e2e8f0">
                    <Flex direction="column" gap="1rem">
                      <Flex justifyContent="space-between" alignItems="center">
                        <Flex alignItems="center" gap="1rem">
                          <Heading level={4} color="#2d3748">{post.title}</Heading>
                          {renderPostTypeBadge(post.type)}
                        </Flex>
                      <Flex alignItems="center" gap="1rem">
                        <Text fontSize="0.8rem" color="gray">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </Text>
                        {((user.id || user.username) === post.student?.id || ['Admin', 'Coordinator'].includes(user.role)) && (
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
                              <span aria-hidden="true">&#8942;</span>
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
                                      setPostToDelete(post);
                                      setShowDeleteConfirm(true);
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
                      <Text color="#4a5568">{post.description}</Text>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            )}
          </Card>
        </TabItem>
        </Tabs>
      )}
      
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
          onClick={closeCreateForm}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="900px"
              width="100%"
              maxHeight="100vh"
              backgroundColor="white"
              style={{ overflow: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" gap="1.5rem" padding="2rem">
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading level={3} color="#2d3748">{editingPost ? 'Edit Post' : 'Create New Post'}</Heading>
                  <Button type="button" data-close-button="true" className={iconActionButtonClassName} onClick={closeCreateForm} aria-label="Close create post modal"><span className="closeButtonGlyph" aria-hidden="true">&times;</span></Button>
                </Flex>

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

                  <View position="relative">
                    <TextField
                      name="department"
                      label="College"
                      value={formData.department}
                      onChange={handleCollegeChange}
                      onFocus={() => setShowCollegeDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCollegeDropdown(false), 120)}
                      placeholder="Start typing to search..."
                    />
                    {showCollegeDropdown && collegeSuggestions.length > 0 && (
                      <ul className="tag-dropdown" style={{ zIndex: 20, maxHeight: '220px', overflowY: 'auto' }}>
                        {collegeSuggestions.map((college) => (
                          <li
                            key={college}
                            className="tag-dropdown-option"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleCollegeSelect(college)}
                          >
                            {college}
                          </li>
                        ))}
                      </ul>
                    )}
                  </View>

                  <Flex direction="column" gap="0.5rem">
                    <Text fontWeight={600} color="#2d3748">Research Areas</Text>
                    <Text fontSize="0.85rem" color="#718096">Type to search and add research areas from the shared tag library.</Text>
                    <TagSelector
                      selectedTagIds={researchAreaTagIds}
                      onChange={handleResearchAreasChange}
                      placeholder="Type to search and add research interests..."
                      maxSelections={10}
                    />
                    {legacyResearchAreas.length > 0 && (
                      <Text fontSize="0.8rem" color="#8a6d3b">
                        Existing values not in the tag library: {legacyResearchAreas.join(', ')}
                      </Text>
                    )}
                  </Flex>

                  <Flex direction="column" gap="0.5rem">
                    <Text fontWeight={600} color="#2d3748">Skills You Offer</Text>
                    <Text fontSize="0.85rem" color="#718096">Add skills you can contribute using the same tag autocomplete as faculty projects.</Text>
                    <TagSelector
                      selectedTagIds={skillsOfferedTagIds}
                      onChange={handleSkillsOfferedChange}
                      placeholder="Type to search and add offered skills..."
                      maxSelections={15}
                    />
                    {legacySkillsOffered.length > 0 && (
                      <Text fontSize="0.8rem" color="#8a6d3b">
                        Existing values not in the tag library: {legacySkillsOffered.join(', ')}
                      </Text>
                    )}
                  </Flex>

                  <Flex direction="column" gap="0.5rem">
                    <Text fontWeight={600} color="#2d3748">Skills You Need</Text>
                    <Text fontSize="0.85rem" color="#718096">Add the skills or experience you want collaborators to bring.</Text>
                    <TagSelector
                      selectedTagIds={skillsNeededTagIds}
                      onChange={handleSkillsNeededChange}
                      placeholder="Type to search and add needed skills..."
                      maxSelections={15}
                    />
                    {legacySkillsNeeded.length > 0 && (
                      <Text fontSize="0.8rem" color="#8a6d3b">
                        Existing values not in the tag library: {legacySkillsNeeded.join(', ')}
                      </Text>
                    )}
                  </Flex>

                  <TextField
                    name="timeCommitment"
                    label="Time Commitment"
                    value={formData.timeCommitment}
                    onChange={handleFormChange}
                    placeholder="e.g. 10 hours/week, Flexible, Summer only"
                  />

                  <Flex gap="1rem" marginTop="1rem" justifyContent="flex-end">
                    <Button
                      type="button"
                      className={secondaryActionButtonClassName}
                      onClick={closeCreateForm}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className={submitPostButtonClassName}
                      isLoading={isSubmitting}
                    >
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              width="400px"
              onClick={(e) => e.stopPropagation()}
            >
              <Heading level={4} marginBottom="1rem">Delete Post</Heading>
              <Text marginBottom="2rem">
                Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
              </Text>
              <Flex gap="1rem">
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setPostToDelete(null);
                  }}
                  flex="1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleDelete(postToDelete.id);
                    setShowDeleteConfirm(false);
                    setPostToDelete(null);
                  }}
                  backgroundColor="white"
                  color="black"
                  border="1px solid black"
                  flex="1"
                  isLoading={isDeleting}
                >
                  Delete
                </Button>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      </Flex>
    </View>
  );
};

export default StudentPostsPage;

