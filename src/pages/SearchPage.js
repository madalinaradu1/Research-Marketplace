import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { useSearchParams } from 'react-router-dom';
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
  Divider,
  CheckboxField,
  View
} from '@aws-amplify/ui-react';
import { listProjects, listUsers } from '../graphql/operations';
import EnhancedApplicationForm from '../components/EnhancedApplicationForm';

const SearchPage = ({ user }) => {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');

  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;
  const [selectedProject, setSelectedProject] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

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
    if (queryTerm) {
      setSearchTerm(queryTerm);
    }
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [projects, searchTerm, selectedDepartment, selectedDuration, showAvailableOnly, sortBy]);

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

    // Department filter
    if (selectedDepartment) {
      filtered = filtered.filter(project => project.department === selectedDepartment);
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
  const totalPages = Math.ceil(filteredProjects.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = filteredProjects.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedDuration('');

    setShowAvailableOnly(true);
    setSortBy('newest');
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
      <Heading level={2}>Search Research Opportunities</Heading>
      
      {/* Search and Filters */}
      <Card>
        <Flex direction="column" gap="1.5rem">
          {/* Search Bar */}
          <SearchField
            label="Search"
            placeholder="Search by title, description, department, faculty, skills, or research tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {/* Filter Row */}
          <Flex direction="row" gap="1rem" wrap="wrap" alignItems="flex-end">
            <SelectField
              label="Department"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              width="250px"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </SelectField>
            
            <SelectField
              label="Duration"
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              width="180px"
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
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="deadline">Deadline</option>
              <option value="title">Title A-Z</option>
              <option value="department">Department</option>
            </SelectField>
            
            <Button onClick={clearFilters} variation="link">
              Clear Filters
            </Button>
          </Flex>
          
          {/* Checkboxes */}
          <Flex direction="row" gap="2rem">
            <CheckboxField
              label="Available to apply"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
            />
          </Flex>
        </Flex>
      </Card>
      
      {/* Results Summary */}
      <Flex justifyContent="space-between" alignItems="center">
        <Text>
          {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
          {searchTerm && ` for "${searchTerm}"`}
        </Text>
        {totalPages > 1 && (
          <Text fontSize="0.9rem" color="gray">
            Page {currentPage} of {totalPages}
          </Text>
        )}
      </Flex>
      
      {/* Results */}
      {filteredProjects.length === 0 ? (
        <Card>
          <Text>No projects match your search criteria. Try adjusting your filters.</Text>
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
            <Card key={project.id}>
              <Flex direction="column" gap="1rem">
                <Flex justifyContent="space-between" alignItems="flex-start">
                  <Flex direction="column" gap="0.5rem" flex="1">
                    <Heading level={4}>{project.title}</Heading>
                    <Text fontSize="0.9rem" color="gray">
                      {project.faculty?.name} • {project.department}
                    </Text>
                  </Flex>
                  
                  <Flex direction="column" gap="0.5rem" alignItems="flex-end">
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
                      <Text fontSize="0.8rem" color="gray">
                        Deadline: {new Date(project.applicationDeadline).toLocaleDateString()}
                      </Text>
                    )}
                  </Flex>
                </Flex>
                
                <Text>{project.description}</Text>
                
                {project.skillsRequired && project.skillsRequired.length > 0 && (
                  <Flex direction="column" gap="0.5rem">
                    <Text fontWeight="bold" fontSize="0.9rem">Skills Required:</Text>
                    <Flex wrap="wrap" gap="0.5rem">
                      {project.skillsRequired.map((skill, index) => (
                        <Badge key={index} backgroundColor="lightgray" color="white">
                          Skills: {skill}
                        </Badge>
                      ))}
                    </Flex>
                  </Flex>
                )}
                
                {project.tags && project.tags.length > 0 && (
                  <Flex direction="column" gap="0.5rem">
                    <Text fontWeight="bold" fontSize="0.9rem">Research Tags:</Text>
                    <Flex wrap="wrap" gap="0.5rem">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} backgroundColor="lightgray" color="white">
                          {tag}
                        </Badge>
                      ))}
                    </Flex>
                  </Flex>
                )}
                
                <Divider />
                
                <Flex justifyContent="space-between" alignItems="center">
                  <Flex gap="1rem">
                    <Text fontSize="0.8rem">Duration: {project.duration}</Text>
                    {project.requiresTranscript && (
                      <Badge backgroundColor="orange" color="white">
                        Transcript Required
                      </Badge>
                    )}
                  </Flex>
                  
                  {user?.role === 'Student' && (
                    <Button 
                      size="small" 
                      backgroundColor="white"
                      color="black"
                      border="1px solid black"
                      onClick={() => {
                        setSelectedProject(project);
                        setShowApplicationForm(true);
                      }}
                      isDisabled={!project.isActive || (project.applicationDeadline && new Date(project.applicationDeadline) < new Date())}
                    >
                      {project.applicationDeadline && new Date(project.applicationDeadline) < new Date() ? 'Expired' :
                       !project.isActive ? 'Inactive' : 'Apply Now'}
                    </Button>
                  )}
                </Flex>
              </Flex>
            </Card>
          )}
        </Collection>
        
        {/* Results Counter */}
        {filteredProjects.length > 0 && (
          <Flex justifyContent="flex-end" marginTop="1rem">
            <Text fontSize="0.9rem" color="gray">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length}
            </Text>
          </Flex>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Flex justifyContent="center" alignItems="center" gap="0.5rem" marginTop="2rem">
            <Button 
              size="small" 
              onClick={() => goToPage(currentPage - 1)}
              isDisabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {/* Page Numbers */}
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
              let pageNum;
              if (totalPages <= 10) {
                pageNum = i + 1;
              } else if (currentPage <= 5) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 4) {
                pageNum = totalPages - 9 + i;
              } else {
                pageNum = currentPage - 4 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  size="small"
                  variation={currentPage === pageNum ? "primary" : "link"}
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button 
              size="small" 
              onClick={() => goToPage(currentPage + 1)}
              isDisabled={currentPage === totalPages}
            >
              Next
            </Button>
          </Flex>
        )}
        </>
      )}
      
      {/* Application Form Modal */}
      {showApplicationForm && selectedProject && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => setShowApplicationForm(false)}
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
              <EnhancedApplicationForm 
                project={selectedProject}
                user={user}
                onClose={() => setShowApplicationForm(false)}
                onSuccess={() => {
                  setShowApplicationForm(false);
                  setSelectedProject(null);
                  // Optionally refresh data or show success message
                }}
              />
            </Card>
          </Flex>
        </View>
      )}
    </Flex>
  );
};

export default SearchPage;