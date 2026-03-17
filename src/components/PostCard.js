import React, { useState } from 'react';
import { Flex, Text, Button, Badge, View } from '@aws-amplify/ui-react';

const PostCard = ({ post, user, onEdit, onDelete, onExpand }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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
      position="relative"
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onExpand(post)}
    >
      <View
        backgroundColor="white"
        borderRadius="12px"
        padding="1.5rem"
        style={{
          border: isHovered ? `2px solid ${getTypeColor(post.type)}` : '1px solid #E5E7EB',
          boxShadow: isHovered ? '0 10px 25px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        <Flex direction="column" gap="1rem">
          {/* Header */}
          <Flex justifyContent="space-between" alignItems="flex-start">
            <Flex alignItems="center" gap="0.75rem" flex="1">
              <View
                width="40px"
                height="40px"
                borderRadius="50%"
                backgroundColor={getTypeColor(post.type)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text color="white" fontSize="1.2rem">
                  {post.type === 'RESEARCH_INTEREST' ? '🔬' : post.type === 'MENTOR_WANTED' ? '👨‍🏫' : '💡'}
                </Text>
              </View>
              <Flex direction="column" gap="0.25rem">
                <Text fontWeight="600" fontSize="1.1rem" color="#111827">
                  {post.title}
                </Text>
                <Text fontSize="0.85rem" color="#6B7280">
                  {(user.id || user.username) === post.student?.id || ['Admin', 'Faculty', 'Coordinator'].includes(user.role)
                    ? post.student?.name
                    : 'GCU Student'} • {new Date(post.createdAt).toLocaleDateString()}
                </Text>
              </Flex>
            </Flex>
            <Flex alignItems="center" gap="0.5rem">
              <Badge
                backgroundColor={getTypeColor(post.type)}
                color="white"
                fontSize="0.75rem"
                padding="0.25rem 0.75rem"
                borderRadius="12px"
              >
                {getTypeLabel(post.type)}
              </Badge>
              {canEdit && (
                <View position="relative">
                  <Button
                    size="small"
                    backgroundColor="transparent"
                    color="#6B7280"
                    border="none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    style={{ padding: '0.5rem', fontSize: '1.2rem' }}
                  >
                    ⋮
                  </Button>
                  {showMenu && (
                    <View
                      position="absolute"
                      top="100%"
                      right="0"
                      backgroundColor="white"
                      borderRadius="8px"
                      style={{
                        zIndex: 100,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        minWidth: '120px'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="small"
                        backgroundColor="transparent"
                        color="#111827"
                        border="none"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(post);
                          setShowMenu(false);
                        }}
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem' }}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        size="small"
                        backgroundColor="transparent"
                        color="#EF4444"
                        border="none"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(post);
                          setShowMenu(false);
                        }}
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem' }}
                      >
                        🗑️ Delete
                      </Button>
                    </View>
                  )}
                </View>
              )}
            </Flex>
          </Flex>

          {/* Description */}
          <Text color="#374151" fontSize="0.95rem" style={{ lineHeight: '1.6' }}>
            {post.description.length > 150 ? `${post.description.substring(0, 150)}...` : post.description}
          </Text>

          {/* Tags */}
          <Flex gap="0.5rem" wrap="wrap">
            {post.department && (
              <Badge backgroundColor="#F3F4F6" color="#374151" fontSize="0.8rem" padding="0.25rem 0.75rem" borderRadius="12px">
                🏛️ {post.department}
              </Badge>
            )}
            {post.researchAreas?.slice(0, 2).map((area, idx) => (
              <Badge key={idx} backgroundColor="#DBEAFE" color="#1E40AF" fontSize="0.8rem" padding="0.25rem 0.75rem" borderRadius="12px">
                {area}
              </Badge>
            ))}
            {post.researchAreas?.length > 2 && (
              <Badge backgroundColor="#F3F4F6" color="#6B7280" fontSize="0.8rem" padding="0.25rem 0.75rem" borderRadius="12px">
                +{post.researchAreas.length - 2} more
              </Badge>
            )}
          </Flex>

          {/* Quick Actions (on hover) */}
          {isHovered && (
            <Flex gap="0.5rem" style={{ animation: 'fadeIn 0.2s ease' }}>
              <Button
                size="small"
                backgroundColor={getTypeColor(post.type)}
                color="white"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand(post);
                }}
                style={{ flex: 1 }}
              >
                View Details
              </Button>
            </Flex>
          )}
        </Flex>
      </View>
    </View>
  );
};

export default PostCard;
