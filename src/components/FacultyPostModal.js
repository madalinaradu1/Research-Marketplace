import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { Flex, Text, Button, Badge, View, Heading, Divider, Loader } from '@aws-amplify/ui-react';
import ChatDrawer from './ChatDrawer';

const FacultyPostModal = ({ post, user, onClose }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const isFacultyOwner = user.role === 'Faculty' && (user.id === post.facultyID || user.username === post.facultyID);

  useEffect(() => {
    if (isFacultyOwner) {
      fetchApplicants();
    } else {
      setLoading(false);
    }
  }, [post.id]);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const { listApplications } = await import('../graphql/operations');
      const result = await API.graphql(
        graphqlOperation(listApplications, {
          filter: { projectID: { eq: post.id } },
          limit: 100
        })
      );

      const apps = result.data.listApplications.items || [];
      
      // Fetch student details
      const appsWithStudents = await Promise.all(
        apps.map(async (app) => {
          try {
            const { getUser } = await import('../graphql/operations');
            const studentResult = await API.graphql(graphqlOperation(getUser, { id: app.studentID }));
            return { ...app, student: studentResult.data.getUser };
          } catch (error) {
            console.error('Error fetching student:', error);
            return app;
          }
        })
      );

      setApplicants(appsWithStudents);
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageStudent = (student) => {
    setSelectedStudent(student);
    setChatOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#F59E0B',
      ACCEPTED: '#10B981',
      REJECTED: '#EF4444',
      WITHDRAWN: '#6B7280'
    };
    return colors[status] || '#6B7280';
  };

  if (!post) return null;

  return (
    <>
      <View
        position="fixed"
        top="0"
        left="0"
        width="100vw"
        height="100vh"
        backgroundColor="rgba(0, 0, 0, 0.7)"
        style={{ zIndex: 1000, backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <Flex justifyContent="center" alignItems="center" height="100%" padding="2rem">
          <View
            backgroundColor="#1a1a1a"
            borderRadius="16px"
            maxWidth="900px"
            width="100%"
            maxHeight="90vh"
            style={{ overflow: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Flex direction="column" gap="1.5rem" padding="2rem">
              {/* Header */}
              <Flex justifyContent="space-between" alignItems="flex-start">
                <Flex direction="column" gap="0.5rem">
                  <Heading level={3} color="white">
                    {post.title}
                  </Heading>
                  <Text color="#9CA3AF" fontSize="0.9rem">
                    {post.department} • Posted {new Date(post.createdAt).toLocaleDateString()}
                  </Text>
                </Flex>
                <Button
                  size="small"
                  backgroundColor="transparent"
                  color="#9CA3AF"
                  border="none"
                  onClick={onClose}
                  style={{ fontSize: '1.5rem', padding: '0.5rem' }}
                >
                  ✕
                </Button>
              </Flex>

              <Divider style={{ backgroundColor: '#374151' }} />

              {/* Description */}
              <View>
                <Text fontWeight="600" fontSize="1.1rem" color="white" marginBottom="0.75rem">
                  Description
                </Text>
                <Text color="#D1D5DB" style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {post.description}
                </Text>
              </View>

              {/* Skills & Tags */}
              {post.skillsRequired && post.skillsRequired.length > 0 && (
                <View>
                  <Text fontWeight="600" fontSize="1rem" color="white" marginBottom="0.75rem">
                    Skills Required
                  </Text>
                  <Flex gap="0.5rem" wrap="wrap">
                    {post.skillsRequired.map((skill, idx) => (
                      <Badge
                        key={idx}
                        backgroundColor="#374151"
                        color="#60A5FA"
                        fontSize="0.9rem"
                        padding="0.5rem 1rem"
                        borderRadius="12px"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </Flex>
                </View>
              )}

              {/* Applicants Section - Only for Faculty Owner */}
              {isFacultyOwner && (
                <>
                  <Divider style={{ backgroundColor: '#374151' }} />
                  <View>
                    <Heading level={4} color="white" marginBottom="1rem">
                      Applicants ({applicants.length})
                    </Heading>
                    
                    {loading ? (
                      <Flex justifyContent="center" padding="2rem">
                        <Loader />
                      </Flex>
                    ) : applicants.length === 0 ? (
                      <Flex
                        direction="column"
                        alignItems="center"
                        padding="2rem"
                        backgroundColor="#111827"
                        borderRadius="8px"
                      >
                        <Text color="#6B7280" fontSize="0.95rem">
                          No applicants yet
                        </Text>
                      </Flex>
                    ) : (
                      <Flex direction="column" gap="0.75rem">
                        {applicants.map((app) => (
                          <Flex
                            key={app.id}
                            padding="1rem"
                            backgroundColor="#111827"
                            borderRadius="8px"
                            justifyContent="space-between"
                            alignItems="center"
                            style={{ border: '1px solid #374151' }}
                          >
                            <Flex direction="column" gap="0.25rem" flex="1">
                              <Text color="white" fontWeight="600">
                                {app.student?.name || 'Unknown Student'}
                              </Text>
                              <Text color="#9CA3AF" fontSize="0.85rem">
                                Applied {new Date(app.createdAt).toLocaleDateString()}
                              </Text>
                            </Flex>
                            
                            <Flex gap="0.75rem" alignItems="center">
                              <Badge
                                backgroundColor={getStatusColor(app.status)}
                                color="white"
                                fontSize="0.8rem"
                                padding="0.35rem 0.75rem"
                                borderRadius="12px"
                              >
                                {app.status}
                              </Badge>
                              
                              <Button
                                size="small"
                                backgroundColor="#3B82F6"
                                color="white"
                                onClick={() => handleMessageStudent(app.student)}
                                style={{ borderRadius: '8px' }}
                              >
                                💬 Message
                              </Button>
                            </Flex>
                          </Flex>
                        ))}
                      </Flex>
                    )}
                  </View>
                </>
              )}
            </Flex>
          </View>
        </Flex>
      </View>

      {/* Chat Drawer */}
      {chatOpen && selectedStudent && (
        <ChatDrawer
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          postId={post.id}
          facultyId={user.id || user.username}
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
          currentUserId={user.id || user.username}
        />
      )}
    </>
  );
};

export default FacultyPostModal;
