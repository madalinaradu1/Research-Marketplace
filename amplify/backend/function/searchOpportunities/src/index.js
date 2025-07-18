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
 * Search for research opportunities based on query and optional category
 */
exports.handler = async (event) => {
    try {
        // Get search parameters
        const query = event.arguments.query;
        const category = event.arguments.category;
        const limit = event.arguments.limit || 20;
        
        // Prepare GraphQL query
        const graphqlQuery = {
            query: `
                query SearchResearchOpportunities($filter: ModelResearchOpportunityFilterInput, $limit: Int) {
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
                    and: [
                        { status: { eq: "PUBLISHED" } },
                        {
                            or: [
                                { title: { contains: query } },
                                { description: { contains: query } },
                                { department: { contains: query } },
                                { requirements: { contains: query } }
                            ]
                        }
                    ]
                },
                limit: limit
            }
        };
        
        // Add category filter if provided
        if (category) {
            graphqlQuery.variables.filter.and.push({
                categories: { contains: category }
            });
        }
        
        // Execute GraphQL query
        const data = await executeGraphQL(endpoint, region, graphqlQuery);
        
        // Return search results
        return data.data.listResearchOpportunities.items;
    } catch (error) {
        console.error('Error searching opportunities:', error);
        throw error;
    }
};

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