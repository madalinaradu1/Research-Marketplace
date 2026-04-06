import React from 'react';
import { Flex, Text, Button, Badge, View, Heading, Divider } from '@aws-amplify/ui-react';

const PostDetailModal = ({ post, user, onClose, onEdit, onDelete }) => {
  if (!post) return null;

  const getTypeColor = (type) => {
    const colors = {
      RESEARCH_INTEREST: '#3B82F6',
      MENTOR_WANTED: '#F59E0B',
      RESEARCH_IDEA: '#10B981'
    };
    return colors[type] || '#6B7280';
  };

  const getTypeLabel = (type) => {
    const labels = {
      RESEARCH_INTEREST: 'Research Interest',
      MENTOR_WANTED: 'Mentor Wanted',
      RESEARCH_IDEA: 'Research Idea'
    };
    return labels[type] || type;
  };

  const canEdit = (user.id || user.username) === post.student?.id || ['Admin', 'Coordinator'].includes(user.role);

  return (
    <View
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      height="100vh"
      backgroundColor="rgba(0, 0, 0, 0.6)"
      style={{ zIndex: 1000, backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <Flex justifyContent="center" alignItems="center" height="100%" padding="2rem">
        <View
          backgroundColor="white"
          borderRadius="16px"
          maxWidth="800px"
          width="100%"
          maxHeight="90vh"
          style={{ overflow: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <Flex direction="column" gap="1.5rem" padding="2rem">
            {/* Header */}
            <Flex justifyContent="space-between" alignItems="flex-start">
              <Flex alignItems="center" gap="1rem">
                <View
                  width="60px"
                  height="60px"
                  borderRadius="50%"
                  backgroundColor={getTypeColor(post.type)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text color="white" fontSize="2rem">
                    {post.type === 'RESEARCH_INTEREST' ? '🔬' : post.type === 'MENTOR_WANTED' ? '👨🏫' : '💡'}
                  </Text>
                </View>
                <Flex direction="column" gap="0.5rem">
                  <Badge
                    backgroundColor={getTypeColor(post.type)}
                    color="white"
                    fontSize="0.85rem"
                    padding="0.35rem 1rem"
                    borderRadius="12px"
                  >
                    {getTypeLabel(post.type)}
                  </Badge>
                  <Text fontSize="0.9rem" color="#6B7280">
                    Posted {new Date(post.createdAt).toLocaleDateString()}
                  </Text>
                </Flex>
              </Flex>
              <Button
                size="small"
                backgroundColor="transparent"
                color="#6B7280"
                border="none"
                data-close-button="true"
                onClick={onClose}
                style={{ fontSize: '1.5rem', padding: '0.5rem' }}
              >
                <span className="closeButtonGlyph" aria-hidden="true">&times;</span>
              </Button>
            </Flex>

            <Divider />

            {/* Title */}
            <Heading level={3} color="#111827">
              {post.title}
            </Heading>

            {/* Author Info */}
            <Flex alignItems="center" gap="0.75rem">
              <View
                width="48px"
                height="48px"
                borderRadius="50%"
                backgroundColor="#E5E7EB"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text fontSize="1.5rem">👤</Text>
              </View>
              <Flex direction="column">
                <Text fontWeight="600" color="#111827">
                  {(user.id || user.username) === post.student?.id || ['Admin', 'Faculty', 'Coordinator'].includes(user.role)
                    ? post.student?.name
                    : 'GCU Student'}
                </Text>
                <Text fontSize="0.9rem" color="#6B7280">
                  {post.department || 'No College Specified'}
                </Text>
              </Flex>
            </Flex>

            <Divider />

            {/* Description */}
            <View>
              <Text fontWeight="600" fontSize="1.1rem" color="#111827" marginBottom="0.75rem">
                Description
              </Text>
              <Text color="#374151" style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {post.description}
              </Text>
            </View>

            {/* Research Areas */}
            {post.researchAreas && post.researchAreas.length > 0 && (
              <View>
                <Text fontWeight="600" fontSize="1rem" color="#111827" marginBottom="0.75rem">
                  🔬 Research Areas
                </Text>
                <Flex gap="0.5rem" wrap="wrap">
                  {post.researchAreas.map((area, idx) => (
                    <Badge
                      key={idx}
                      backgroundColor="#DBEAFE"
                      color="#1E40AF"
                      fontSize="0.9rem"
                      padding="0.5rem 1rem"
                      borderRadius="12px"
                    >
                      {area}
                    </Badge>
                  ))}
                </Flex>
              </View>
            )}

            {/* Skills Offered */}
            {post.skillsOffered && post.skillsOffered.length > 0 && (
              <View>
                <Text fontWeight="600" fontSize="1rem" color="#111827" marginBottom="0.75rem">
                  ✅ Skills Offered
                </Text>
                <Flex gap="0.5rem" wrap="wrap">
                  {post.skillsOffered.map((skill, idx) => (
                    <Badge
                      key={idx}
                      backgroundColor="#D1FAE5"
                      color="#065F46"
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

            {/* Skills Needed */}
            {post.skillsNeeded && post.skillsNeeded.length > 0 && (
              <View>
                <Text fontWeight="600" fontSize="1rem" color="#111827" marginBottom="0.75rem">
                  🎯 Skills Needed
                </Text>
                <Flex gap="0.5rem" wrap="wrap">
                  {post.skillsNeeded.map((skill, idx) => (
                    <Badge
                      key={idx}
                      backgroundColor="#FEF3C7"
                      color="#92400E"
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

            {/* Time Commitment */}
            {post.timeCommitment && (
              <View>
                <Text fontWeight="600" fontSize="1rem" color="#111827" marginBottom="0.75rem">
                  ⏰ Time Commitment
                </Text>
                <Badge
                  backgroundColor="#F3F4F6"
                  color="#374151"
                  fontSize="0.95rem"
                  padding="0.5rem 1rem"
                  borderRadius="12px"
                >
                  {post.timeCommitment}
                </Badge>
              </View>
            )}

            <Divider />

            {/* Actions */}
            <Flex gap="1rem" justifyContent="flex-end">
              {canEdit && (
                <>
                  <Button
                    backgroundColor="white"
                    color="#3B82F6"
                    border="2px solid #3B82F6"
                    onClick={() => {
                      onEdit(post);
                      onClose();
                    }}
                    style={{ borderRadius: '8px', padding: '0.75rem 1.5rem' }}
                  >
                    ✏️ Edit Post
                  </Button>
                  <Button
                    backgroundColor="white"
                    color="#EF4444"
                    border="2px solid #EF4444"
                    onClick={() => {
                      onDelete(post);
                      onClose();
                    }}
                    style={{ borderRadius: '8px', padding: '0.75rem 1.5rem' }}
                  >
                    🗑️ Delete Post
                  </Button>
                </>
              )}
            </Flex>
          </Flex>
        </View>
      </Flex>
    </View>
  );
};

export default PostDetailModal;
