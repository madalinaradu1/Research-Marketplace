/* Amplify Params - DO NOT EDIT
	API_URAFAPI_GRAPHQLAPIENDPOINTOUTPUT
	API_URAFAPI_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const https = require('https');
const urlParse = require('url').URL;

// Create AWS AppSync client
const endpoint = process.env.API_URAFAPI_GRAPHQLAPIENDPOINTOUTPUT;
const region = process.env.REGION;

/**
 * Get recommended research opportunities for a user
 */
exports.handler = async (event) => {
    try {
        // Get user ID and limit
        const userId = event.arguments.userId;
        const limit = event.arguments.limit || 5;
        
        // Get user profile to determine interests and major
        const userQuery = {
            query: `
                query GetUser($id: ID!) {
                    getUser(id: $id) {
                        id
                        major
                        interests
                    }
                }
            `,
            variables: {
                id: userId
            }
        };
        
        // Execute user query
        const userData = await executeGraphQL(endpoint, region, userQuery);
        const user = userData.data.getUser;
        
        // If user not found, return empty array
        if (!user) {
            return [];
        }
        
        // Prepare filter based on user interests and major
        const filterConditions = [];
        
        // Add major-based filter if user has a major
        if (user.major) {
            filterConditions.push({
                or: [
                    { department: { contains: user.major } },
                    { requirements: { contains: user.major } }
                ]
            });
        }
        
        // Add interests-based filters if user has interests
        if (user.interests && user.interests.length > 0) {
            const interestFilters = user.interests.map(interest => ({
                or: [
                    { title: { contains: interest } },
                    { description: { contains: interest } },
                    { categories: { contains: interest } },
                    { skills: { contains: interest } }
                ]
            }));
            
            filterConditions.push(...interestFilters);
        }
        
        // If no filter conditions, use default filter
        if (filterConditions.length === 0) {
            filterConditions.push({ status: { eq: "PUBLISHED" } });
        } else {
            // Always include published status
            filterConditions.push({ status: { eq: "PUBLISHED" } });
        }
        
        // Prepare GraphQL query for opportunities
        const opportunitiesQuery = {
            query: `
                query ListResearchOpportunities($filter: ModelResearchOpportunityFilterInput, $limit: Int) {
                    listResearchOpportunities(filter: $filter, limit: $limit) {
                        items {
                            id
                            title
                            description
                            facultyId
                            faculty {
                                id
                                name
                                email
                                type
                            }
                            department
                            requirements
                            deadline
                            startDate
                            endDate
                            status
                            categories
                            skills
                            createdAt
                            updatedAt
                        }
                    }
                }
            `,
            variables: {
                filter: {
                    or: filterConditions
                },
                limit: limit
            }
        };
        
        // Execute opportunities query
        const opportunitiesData = await executeGraphQL(endpoint, region, opportunitiesQuery);
        
        // Get user's existing applications to filter out already applied opportunities
        const applicationsQuery = {
            query: `
                query ListApplications($filter: ModelApplicationFilterInput) {
                    listApplications(filter: $filter) {
                        items {
                            opportunityId
                        }
                    }
                }
            `,
            variables: {
                filter: {
                    userId: { eq: userId }
                }
            }
        };
        
        const applicationsData = await executeGraphQL(endpoint, region, applicationsQuery);
        const appliedOpportunityIds = applicationsData.data.listApplications.items.map(app => app.opportunityId);
        
        // Filter out opportunities the user has already applied to
        let recommendations = opportunitiesData.data.listResearchOpportunities.items.filter(
            opp => !appliedOpportunityIds.includes(opp.id)
        );
        
        // Sort by relevance (simple implementation - can be enhanced)
        recommendations = sortByRelevance(recommendations, user);
        
        // Return recommended opportunities
        return recommendations.slice(0, limit);
    } catch (error) {
        console.error('Error getting recommended opportunities:', error);
        throw error;
    }
};

/**
 * Sort opportunities by relevance to user
 */
function sortByRelevance(opportunities, user) {
    return opportunities.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        
        // Score based on major match
        if (user.major) {
            if (a.department.toLowerCase().includes(user.major.toLowerCase())) scoreA += 3;
            if (b.department.toLowerCase().includes(user.major.toLowerCase())) scoreB += 3;
        }
        
        // Score based on interests match
        if (user.interests && user.interests.length > 0) {
            user.interests.forEach(interest => {
                const interestLower = interest.toLowerCase();
                
                // Check title
                if (a.title.toLowerCase().includes(interestLower)) scoreA += 2;
                if (b.title.toLowerCase().includes(interestLower)) scoreB += 2;
                
                // Check description
                if (a.description.toLowerCase().includes(interestLower)) scoreA += 1;
                if (b.description.toLowerCase().includes(interestLower)) scoreB += 1;
                
                // Check categories
                if (a.categories.some(cat => cat.toLowerCase().includes(interestLower))) scoreA += 2;
                if (b.categories.some(cat => cat.toLowerCase().includes(interestLower))) scoreB += 2;
                
                // Check skills
                if (a.skills && a.skills.some(skill => skill.toLowerCase().includes(interestLower))) scoreA += 2;
                if (b.skills && b.skills.some(skill => skill.toLowerCase().includes(interestLower))) scoreB += 2;
            });
        }
        
        // Sort by score (descending)
        return scoreB - scoreA;
    });
}

/**
 * Execute GraphQL query against AppSync endpoint
 */
async function executeGraphQL(endpoint, region, query) {
    const req = new AWS.HttpRequest(endpoint, region);
    
    req.method = 'POST';
    req.headers.host = new urlParse(endpoint).hostname;
    req.headers['Content-Type'] = 'application/json';
    req.body = JSON.stringify(query);
    
    // Sign the request (IAM authorization)
    const signer = new AWS.Signers.V4(req, 'appsync', true);
    signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate());
    
    return new Promise((resolve, reject) => {
        const httpRequest = https.request({ ...req, host: req.headers.host }, (result) => {
            let data = '';
            
            result.on('data', (chunk) => {
                data += chunk;
            });
            
            result.on('end', () => {
                resolve(JSON.parse(data.toString()));
            });
        });
        
        httpRequest.on('error', (error) => {
            reject(error);
        });
        
        httpRequest.write(req.body);
        httpRequest.end();
    });
}