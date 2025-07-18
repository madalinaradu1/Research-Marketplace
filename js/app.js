// Main application JavaScript file

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize any components that need setup
    initializeComponents();
    
    // Add event listeners
    setupEventListeners();
});

// Initialize UI components
function initializeComponents() {
    // Check if we're on a page that needs specific initialization
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('search.html')) {
        initializeSearch();
    } else if (currentPath.includes('profile.html')) {
        initializeProfile();
    } else if (currentPath.includes('my-activity.html')) {
        initializeActivity();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add any global event listeners here
}

// Search page functionality
function initializeSearch() {
    const searchForm = document.getElementById('search-form');
    if (!searchForm) return;
    
    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const searchQuery = document.getElementById('search-input').value;
        const searchCategory = document.getElementById('search-category').value;
        
        // Show loading state
        document.getElementById('search-results').innerHTML = '<div class="spinner"></div>';
        
        try {
            // Call the API to search for research opportunities
            const results = await searchOpportunities(searchQuery, searchCategory);
            displaySearchResults(results);
        } catch (error) {
            console.error('Error searching opportunities:', error);
            document.getElementById('search-results').innerHTML = 
                '<p class="error-message">An error occurred while searching. Please try again.</p>';
        }
    });
}

// Search for research opportunities using AWS AppSync/API Gateway
async function searchOpportunities(query, category) {
    try {
        // GraphQL query to search opportunities
        const searchQuery = `
            query SearchOpportunities($query: String!, $category: String) {
                searchOpportunities(query: $query, category: $category) {
                    id
                    title
                    description
                    faculty {
                        id
                        name
                        department
                    }
                    categories
                    deadline
                    status
                }
            }
        `;
        
        const variables = {
            query: query,
            category: category !== 'all' ? category : null
        };
        
        const result = await AWS.Amplify.API.graphql({
            query: searchQuery,
            variables: variables
        });
        
        return result.data.searchOpportunities;
    } catch (error) {
        console.error('Error in searchOpportunities:', error);
        throw error;
    }
}

// Display search results
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    
    if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found. Try different search terms.</p>';
        return;
    }
    
    let html = '<div class="results-grid">';
    
    results.forEach(opportunity => {
        html += `
            <div class="result-card">
                <h3>${opportunity.title}</h3>
                <p class="faculty">Faculty: ${opportunity.faculty.name}, ${opportunity.faculty.department}</p>
                <p>${opportunity.description.substring(0, 150)}${opportunity.description.length > 150 ? '...' : ''}</p>
                <p class="deadline">Deadline: ${new Date(opportunity.deadline).toLocaleDateString()}</p>
                <div class="tags">
                    ${opportunity.categories.map(cat => `<span class="tag">${cat}</span>`).join('')}
                </div>
                <a href="opportunity-details.html?id=${opportunity.id}" class="btn">View Details</a>
            </div>
        `;
    });
    
    html += '</div>';
    resultsContainer.innerHTML = html;
}

// Profile page functionality
function initializeProfile() {
    // Get current user data
    getCurrentUserProfile();
    
    // Setup profile tabs
    const profileTabs = document.querySelectorAll('.profile-tab');
    if (profileTabs.length > 0) {
        profileTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                switchProfileTab(tabId);
            });
        });
    }
    
    // Setup file upload
    const fileUploadForm = document.getElementById('file-upload-form');
    if (fileUploadForm) {
        fileUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            uploadFile();
        });
    }
}

// Get current user profile data
async function getCurrentUserProfile() {
    try {
        // Get current authenticated user
        const user = await AWS.Amplify.Auth.currentAuthenticatedUser();
        
        // Get user attributes
        const { attributes } = user;
        
        // Get user profile data from DynamoDB
        const getUserQuery = `
            query GetUserProfile($id: ID!) {
                getUserProfile(id: $id) {
                    id
                    name
                    email
                    major
                    year
                    interests
                    bio
                    profilePicture
                    documents {
                        id
                        name
                        type
                        url
                        uploadDate
                    }
                }
            }
        `;
        
        const variables = {
            id: user.username
        };
        
        const result = await AWS.Amplify.API.graphql({
            query: getUserQuery,
            variables: variables
        });
        
        const profile = result.data.getUserProfile;
        
        // Update UI with profile data
        updateProfileUI(profile);
        
        // Load user documents
        if (profile.documents && profile.documents.length > 0) {
            displayUserDocuments(profile.documents);
        }
        
    } catch (error) {
        console.error('Error getting user profile:', error);
    }
}

// Update profile UI with user data
function updateProfileUI(profile) {
    // Update profile header
    document.getElementById('profile-name').textContent = profile.name || 'User';
    document.getElementById('profile-major').textContent = profile.major || '';
    document.getElementById('profile-year').textContent = profile.year || '';
    
    if (profile.profilePicture) {
        document.getElementById('profile-pic').src = profile.profilePicture;
    }
    
    // Update profile form fields
    document.getElementById('profile-form-name').value = profile.name || '';
    document.getElementById('profile-form-email').value = profile.email || '';
    document.getElementById('profile-form-major').value = profile.major || '';
    document.getElementById('profile-form-year').value = profile.year || '';
    document.getElementById('profile-form-interests').value = profile.interests || '';
    document.getElementById('profile-form-bio').value = profile.bio || '';
}

// Switch profile tabs
function switchProfileTab(tabId) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.profile-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Deactivate all tabs
    const tabs = document.querySelectorAll('.profile-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Activate selected tab and content
    document.querySelector(`.profile-tab[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-content`).classList.add('active');
}

// Upload file to S3
async function uploadFile() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file to upload');
        return;
    }
    
    try {
        // Show loading state
        document.getElementById('upload-status').innerHTML = '<div class="spinner"></div> Uploading...';
        
        // Upload file to S3
        const result = await AWS.Amplify.Storage.put(
            `documents/${Date.now()}-${file.name}`,
            file,
            {
                contentType: file.type,
                metadata: {
                    userId: (await AWS.Amplify.Auth.currentAuthenticatedUser()).username
                }
            }
        );
        
        // Save file metadata to DynamoDB
        await saveFileMetadata(result.key, file.name, file.type);
        
        // Clear file input and show success message
        fileInput.value = '';
        document.getElementById('upload-status').innerHTML = 
            '<p class="success-message">File uploaded successfully!</p>';
        
        // Refresh user documents
        getCurrentUserProfile();
        
    } catch (error) {
        console.error('Error uploading file:', error);
        document.getElementById('upload-status').innerHTML = 
            '<p class="error-message">Error uploading file. Please try again.</p>';
    }
}

// Save file metadata to DynamoDB
async function saveFileMetadata(key, fileName, fileType) {
    try {
        const user = await AWS.Amplify.Auth.currentAuthenticatedUser();
        
        const mutation = `
            mutation AddUserDocument($input: AddUserDocumentInput!) {
                addUserDocument(input: $input) {
                    id
                    name
                    type
                    url
                    uploadDate
                }
            }
        `;
        
        const variables = {
            input: {
                userId: user.username,
                name: fileName,
                type: fileType,
                key: key,
                uploadDate: new Date().toISOString()
            }
        };
        
        await AWS.Amplify.API.graphql({
            query: mutation,
            variables: variables
        });
        
    } catch (error) {
        console.error('Error saving file metadata:', error);
        throw error;
    }
}

// Display user documents
function displayUserDocuments(documents) {
    const documentsContainer = document.getElementById('user-documents');
    if (!documentsContainer) return;
    
    if (documents.length === 0) {
        documentsContainer.innerHTML = '<p>No documents uploaded yet.</p>';
        return;
    }
    
    let html = '<div class="file-list">';
    
    documents.forEach(doc => {
        html += `
            <div class="file-item">
                <div class="file-name">${doc.name}</div>
                <div class="file-actions">
                    <button onclick="viewDocument('${doc.url}')" class="btn-link">View</button>
                    <button onclick="deleteDocument('${doc.id}')" class="btn-link">Delete</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    documentsContainer.innerHTML = html;
}

// View document
async function viewDocument(url) {
    try {
        // Get the signed URL for the document
        const signedURL = await AWS.Amplify.Storage.get(url);
        window.open(signedURL, '_blank');
    } catch (error) {
        console.error('Error viewing document:', error);
        alert('Error viewing document. Please try again.');
    }
}

// Delete document
async function deleteDocument(docId) {
    if (!confirm('Are you sure you want to delete this document?')) {
        return;
    }
    
    try {
        // Delete from S3 and DynamoDB
        const mutation = `
            mutation DeleteUserDocument($input: DeleteUserDocumentInput!) {
                deleteUserDocument(input: $input)
            }
        `;
        
        const variables = {
            input: {
                id: docId
            }
        };
        
        await AWS.Amplify.API.graphql({
            query: mutation,
            variables: variables
        });
        
        // Refresh user documents
        getCurrentUserProfile();
        
    } catch (error) {
        console.error('Error deleting document:', error);
        alert('Error deleting document. Please try again.');
    }
}

// My Activity page functionality
function initializeActivity() {
    // Get user activity data
    getUserActivity();
}

// Get user activity data
async function getUserActivity() {
    try {
        const user = await AWS.Amplify.Auth.currentAuthenticatedUser();
        
        const query = `
            query GetUserActivity($userId: ID!) {
                getUserApplications(userId: $userId) {
                    id
                    opportunity {
                        id
                        title
                        faculty {
                            name
                        }
                    }
                    status
                    submissionDate
                }
                getUserProjects(userId: $userId) {
                    id
                    title
                    description
                    status
                    startDate
                    endDate
                }
            }
        `;
        
        const variables = {
            userId: user.username
        };
        
        const result = await AWS.Amplify.API.graphql({
            query: query,
            variables: variables
        });
        
        // Display applications and projects
        displayUserApplications(result.data.getUserApplications);
        displayUserProjects(result.data.getUserProjects);
        
    } catch (error) {
        console.error('Error getting user activity:', error);
    }
}

// Display user applications
function displayUserApplications(applications) {
    const applicationsContainer = document.getElementById('user-applications');
    if (!applicationsContainer) return;
    
    if (!applications || applications.length === 0) {
        applicationsContainer.innerHTML = '<p>No applications submitted yet.</p>';
        return;
    }
    
    let html = '<div class="activity-list">';
    
    applications.forEach(app => {
        const statusClass = getStatusClass(app.status);
        
        html += `
            <div class="activity-item">
                <h3>${app.opportunity.title}</h3>
                <p>Faculty: ${app.opportunity.faculty.name}</p>
                <p>Submitted: ${new Date(app.submissionDate).toLocaleDateString()}</p>
                <p class="status ${statusClass}">Status: ${app.status}</p>
                <a href="application-details.html?id=${app.id}" class="btn">View Details</a>
            </div>
        `;
    });
    
    html += '</div>';
    applicationsContainer.innerHTML = html;
}

// Display user projects
function displayUserProjects(projects) {
    const projectsContainer = document.getElementById('user-projects');
    if (!projectsContainer) return;
    
    if (!projects || projects.length === 0) {
        projectsContainer.innerHTML = '<p>No active or completed projects.</p>';
        return;
    }
    
    let html = '<div class="activity-list">';
    
    projects.forEach(project => {
        const statusClass = getStatusClass(project.status);
        
        html += `
            <div class="activity-item">
                <h3>${project.title}</h3>
                <p>${project.description.substring(0, 100)}${project.description.length > 100 ? '...' : ''}</p>
                <p>Period: ${new Date(project.startDate).toLocaleDateString()} - 
                   ${project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}</p>
                <p class="status ${statusClass}">Status: ${project.status}</p>
                <a href="project-details.html?id=${project.id}" class="btn">View Details</a>
            </div>
        `;
    });
    
    html += '</div>';
    projectsContainer.innerHTML = html;
}

// Get CSS class for status
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'approved':
        case 'completed':
        case 'active':
            return 'status-success';
        case 'pending':
        case 'in review':
            return 'status-pending';
        case 'rejected':
        case 'cancelled':
            return 'status-error';
        default:
            return '';
    }
}