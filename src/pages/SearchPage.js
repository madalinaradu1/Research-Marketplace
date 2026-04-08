import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Flex,
  Heading,
  SearchField,
  Button,
  Text,
  SelectField,
  Card,
  Badge,
  Collection,
  Loader,
  Divider
} from '@aws-amplify/ui-react';
import { listProjects, listUsers } from '../graphql/operations';
import EnhancedApplicationForm from '../components/EnhancedApplicationForm';
import DashboardPagination from '../components/DashboardPagination';
import RichTextContent from '../components/common/RichTextContent';
import { tagPillProps } from '../styles/tagPills';
import buttonStyles from '../styles/dashboardButtons.module.css';

const TEAM_EASTER_EGG_TRIGGERS = new Set([
  'capstone 2026',
  'capstone team was here'
]);

const TEAM_EASTER_EGG_RESULT = {
  id: 'team-easter-egg-capstone-2026',
  isEasterEgg: true,
  title: 'Capstone 2026 Archive Entry',
  faculty: { name: 'Research Marketplace Team' },
  department: 'Class of 2026',
  duration: '2025-2026',
  description: `
    <p><strong>The Research Marketplace Capstone 2026 team was here!</strong></p>
    <p>Luke, Bradley, Diego, and Arsenije</p>
  `,
  tags: ['Capstone 2026', 'Team Tribute'],
};

let lastTeamConfettiAt = 0;

const fireTeamConfetti = () => {
  const now = Date.now();
  if (now - lastTeamConfettiAt < 1000) {
    return;
  }

  lastTeamConfettiAt = now;

  const burstOptions = {
    spread: 75,
    startVelocity: 35,
    ticks: 160,
    scalar: 1.05,
    zIndex: 2000,
    colors: ['#552b8d', '#6d28d9', '#f4c542', '#ffffff']
  };

  confetti({
    ...burstOptions,
    particleCount: 90,
    origin: { x: 0.2, y: 0.62 }
  });

  confetti({
    ...burstOptions,
    particleCount: 90,
    origin: { x: 0.8, y: 0.62 }
  });
};

const SearchPage = ({ user }) => {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');

  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;
  const [selectedProject, setSelectedProject] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const filterControlButtonClassName = `${buttonStyles.actionButton} ${buttonStyles.actionButtonGhost} ${buttonStyles.actionButtonCompact}`;
  const filterSelectInputStyles = { className: `search-page-filter-select ${filterControlButtonClassName}` };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const shouldShowTeamEasterEgg = TEAM_EASTER_EGG_TRIGGERS.has(normalizedSearch);

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
    'Nursing'
  ];

  const durations = [
    '1 semester',
    '2 semesters',
    '1 year',
    'Summer only',
    'Flexible'
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const queryTerm = searchParams.get('q');
    setSearchTerm(queryTerm || '');
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [projects, searchTerm, selectedCollege, selectedDuration, showAvailableOnly, sortBy]);

  useEffect(() => {
    if (shouldShowTeamEasterEgg) {
      fireTeamConfetti();
    }
  }, [shouldShowTeamEasterEgg]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const projectResult = await API.graphql(graphqlOperation(listProjects, {
        limit: 100
      }));

      const usersResult = await API.graphql(graphqlOperation(listUsers, {
        limit: 100
      }));

      const allProjects = projectResult.data.listProjects.items;
      const allUsers = usersResult.data.listUsers.items;

      // Enrich projects with faculty information
      const enrichedProjects = allProjects.map(project => {
        const faculty = allUsers.find(u => u.id === project.facultyID);
        return {
          ...project,
          faculty
        };
      });

      setProjects(enrichedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        project.department?.toLowerCase().includes(term) ||
        project.faculty?.name?.toLowerCase().includes(term) ||
        project.skillsRequired?.some(skill => skill.toLowerCase().includes(term)) ||
        project.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // College filter
    if (selectedCollege) {
      filtered = filtered.filter(project => project.department === selectedCollege);
    }

    // Duration filter
    if (selectedDuration) {
      filtered = filtered.filter(project => project.duration === selectedDuration);
    }

    // Only show approved projects
    filtered = filtered.filter(project => project.projectStatus === 'Approved');

    // Available projects only (not past deadline)
    if (showAvailableOnly) {
      const now = new Date();
      filtered = filtered.filter(project =>
        !project.applicationDeadline || new Date(project.applicationDeadline) > now
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'deadline':
          if (!a.applicationDeadline && !b.applicationDeadline) return 0;
          if (!a.applicationDeadline) return 1;
          if (!b.applicationDeadline) return -1;
          return new Date(a.applicationDeadline) - new Date(b.applicationDeadline);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'department':
          return (a.department || '').localeCompare(b.department || '');
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination logic
  const displayedProjects = shouldShowTeamEasterEgg
    ? [TEAM_EASTER_EGG_RESULT]
    : filteredProjects;
  const totalPages = Math.ceil(displayedProjects.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = displayedProjects.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCollege('');
    setSelectedDuration('');
    setSortBy('newest');
    // Don't reset showAvailableOnly - let user control this
  };

  if (loading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }

  return (
    <>
      <style>
        {`
          .search-page-search-field button {
            background-color: transparent !important;
            color: gray !important;
            border: none !important;
          }
          .search-page-search-field button[type="submit"] {
            border: 1px solid black !important;
          }
          .search-page-search-field button:hover {
            background-color: transparent !important;
            color: gray !important;
            outline: none !important;
            box-shadow: none !important;
            border: none !important;
          }
          .search-page-search-field button[type="submit"]:hover {
            border: 1px solid black !important;
          }
          .search-page-search-field button:focus {
            outline: none !important;
            box-shadow: none !important;
          }
          .search-page-search-field button:focus-visible {
            outline: none !important;
            box-shadow: none !important;
          }
          .search-page-search-field svg {
            fill: gray !important;
          }
          .search-page-filter-select {
            width: 100% !important;
            text-align: left !important;
            padding-right: 2.25rem !important;
          }
        `}
      </style>
      <Flex direction="column" padding="2rem" gap="2rem">
        {/* Header */}
        <Card
          backgroundColor="white"
          padding="1.5rem"
          style={{
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <Heading
            level={2}
            color="#2d3748"
            fontWeight="600"
            margin="0"
          >
            Search Research Opportunities
          </Heading>
        </Card>

        {/* Search and Filters */}
        <Card
          backgroundColor="#f8fafc"
          padding="1.5rem"
          style={{
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <Flex direction="column" gap="1.5rem">
            {/* Search Bar */}
            <SearchField
              label="Search"
              placeholder="Search by title, description, department, faculty, skills, or research tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
              className="search-page-search-field"
            />

            {/* Filter Row */}
            <Flex direction="row" gap="1rem" wrap="wrap" alignItems="flex-end">
              <SelectField
                label="College"
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                width="250px"
                inputStyles={filterSelectInputStyles}
              >
                <option value="">All Colleges</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </SelectField>

              <SelectField
                label="Duration"
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                width="180px"
                inputStyles={filterSelectInputStyles}
              >
                <option value="">Any Duration</option>
                {durations.map(duration => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </SelectField>

              <SelectField
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                width="180px"
                inputStyles={filterSelectInputStyles}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="deadline">Deadline</option>
                <option value="title">Title A-Z</option>
                <option value="department">College</option>
              </SelectField>

              <Button
                type="button"
                data-dashboard-button="true"
                className={filterControlButtonClassName}
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </Flex>

            {/* Checkboxes */}
            <Flex direction="row" gap="2rem">
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAvailableOnly(!showAvailableOnly);
                }}
              >
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={() => {}}
                  style={{ cursor: 'pointer', pointerEvents: 'none' }}
                />
                <span>Available to apply</span>
              </div>
            </Flex>
          </Flex>
        </Card>

        {/* Results Summary */}
        <Flex justifyContent="space-between" alignItems="center">
          <Text color="#2d3748" fontWeight="500">
            {displayedProjects.length} project{displayedProjects.length !== 1 ? 's' : ''} found
            {searchTerm && ` for "${searchTerm}"`}
          </Text>
          {totalPages > 1 && (
            <Text fontSize="0.9rem" color="#4a5568">
              Page {currentPage} of {totalPages}
            </Text>
          )}
        </Flex>

        {/* Results */}
        {displayedProjects.length === 0 ? (
          <Card
            backgroundColor="#f8fafc"
            padding="2rem"
            textAlign="center"
            style={{
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Text color="#4a5568" fontSize="1.1rem">
              No projects match your search criteria. Try adjusting your filters.
            </Text>
          </Card>
        ) : (
          <>
            <Collection
              items={currentResults}
              type="list"
              gap="1rem"
              wrap="nowrap"
              direction="column"
            >
              {(project) => (
                <Card
                  key={project.id}
                  backgroundColor="white"
                  padding="1.5rem"
                  style={{
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <Flex direction="column" gap="1rem">
                    <Flex justifyContent="space-between" alignItems="flex-start">
                      <Flex direction="column" gap="0.5rem" flex="1">
                        <Heading level={4} color="#2d3748">{project.title}</Heading>
                        <Text fontSize="0.9rem" color="#4a5568">
                          {project.faculty?.name} {'|'} {project.department}
                        </Text>
                        {project.isEasterEgg && (
                          <Text fontSize="0.85rem" color="#805ad5" fontWeight="600">
                            Secret search result unlocked
                          </Text>
                        )}
                      </Flex>

                      <Flex direction="column" gap="0.5rem" alignItems="flex-end">
                        {project.isEasterEgg ? (
                          <Badge backgroundColor="#805ad5" color="white">
                            Capstone 2026
                          </Badge>
                        ) : (
                          <>
                            <Badge
                              backgroundColor={
                                (project.applicationDeadline && new Date(project.applicationDeadline) < new Date()) || !project.isActive ? 'gray' : 'green'
                              }
                              color="white"
                            >
                              {project.applicationDeadline && new Date(project.applicationDeadline) < new Date() ? 'Expired' :
                               project.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {project.applicationDeadline && (
                              <Text fontSize="0.8rem" color="#4a5568">
                                Deadline: {new Date(project.applicationDeadline).toLocaleDateString()}
                              </Text>
                            )}
                          </>
                        )}
                      </Flex>
                    </Flex>

                    <RichTextContent html={project.description} className="quill-content" />

                    {project.skillsRequired && project.skillsRequired.length > 0 && (
                      <Flex direction="column" gap="0.5rem">
                        <Text fontWeight="bold" fontSize="0.9rem" color="#2d3748">Skills Required:</Text>
                        <Flex wrap="wrap" gap="0.5rem">
                          {project.skillsRequired.map((skill, index) => (
                            <Badge key={index} {...tagPillProps}>
                              {skill}
                            </Badge>
                          ))}
                        </Flex>
                      </Flex>
                    )}

                    {project.tags && project.tags.length > 0 && (
                      <Flex direction="column" gap="0.5rem">
                        <Text fontWeight="bold" fontSize="0.9rem" color="#2d3748">Research Tags:</Text>
                        <Flex wrap="wrap" gap="0.5rem">
                          {project.tags.map((tag, index) => (
                            <Badge key={index} {...tagPillProps}>
                              {tag}
                            </Badge>
                          ))}
                        </Flex>
                      </Flex>
                    )}

                    <Divider />

                    <Flex justifyContent="space-between" alignItems="center">
                      <Text fontSize="0.8rem" color="#4a5568">Duration: {project.duration}</Text>

                      {user?.role === 'Student' && !project.isEasterEgg && (
                        <Button
                          className={`${buttonStyles.actionButton} ${buttonStyles.actionButtonPrimary} ${buttonStyles.actionButtonCompact}`}
                          onClick={() => {
                            setSelectedProject(project);
                            setShowApplicationForm(true);
                          }}
                          isDisabled={!project.isActive || (project.applicationDeadline && new Date(project.applicationDeadline) < new Date())}
                        >
                          {project.applicationDeadline && new Date(project.applicationDeadline) < new Date() ? 'Expired' :
                           !project.isActive ? 'Inactive' : 'Apply'}
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                </Card>
              )}
            </Collection>

            {/* Results Counter */}
            {displayedProjects.length > 0 && (
              <Flex justifyContent="flex-end" marginTop="1rem">
                <Text fontSize="0.9rem" color="#4a5568">
                  Showing {startIndex + 1}-{Math.min(endIndex, displayedProjects.length)} of {displayedProjects.length}
                </Text>
              </Flex>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <DashboardPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                justifyContent="center"
                marginTop="2rem"
                maxVisiblePages={10}
              />
            )}
          </>
        )}

        {/* Application Form Modal */}
        {showApplicationForm && selectedProject && (
          <div className="unified-form-modal" onClick={() => { setShowApplicationForm(false); setSelectedProject(null); }}>
            <div className="ufm-card" onClick={(e) => e.stopPropagation()}>
              <EnhancedApplicationForm
                project={selectedProject}
                user={user}
                onClose={() => {
                  setShowApplicationForm(false);
                  setSelectedProject(null);
                }}
                onSuccess={() => {
                  setShowApplicationForm(false);
                  setSelectedProject(null);
                }}
              />
            </div>
          </div>
        )}
      </Flex>
    </>
  );
};

export default SearchPage;
