# GraphQL Schema Update Instructions

## Issue Fixed (Immediate Solution)
The profile save was failing because the frontend was sending `studentId` field which doesn't exist in the GraphQL `UpdateUserInput` type.

**Immediate fix applied:** Removed `studentId` from the mutation input payload in both `CompleteProfilePage.js` and `ProfilePage.js`.

## Long-Term Solution: Add studentId to Schema

To properly support a user-entered student ID field (separate from the system-generated UUID), you need to update the GraphQL schema.

### Step 1: Update the Schema

Edit `amplify/backend/api/researchmarketplace/schema.graphql` and add the `studentId` field to the User type:

```graphql
type User @model @auth(rules: [
  { allow: owner, operations: [create, read, update, delete] },
  { allow: groups, groups: ["Admin"], operations: [read, update] },
  { allow: private, operations: [read] }
]) {
  id: ID!
  name: String!
  email: String!
  role: String!
  studentId: String              # ADD THIS LINE - user-entered student ID
  department: String
  major: String
  academicYear: String
  gpa: Float
  skills: [String]
  researchInterests: [String]
  careerInterests: [String]
  resumeKey: String
  affiliation: String
  profileComplete: Boolean
  status: String
  expectedGraduation: String
  availability: String
  personalStatement: String
  certificates: [String]
  applicationCount: Int
  projects: [Project] @hasMany(indexName: "byFaculty", fields: ["id"])
  applications: [Application] @hasMany(indexName: "byStudent", fields: ["id"])
  posts: [StudentPost] @hasMany(indexName: "byAuthor", fields: ["id"])
  notifications: [Notification] @hasMany(indexName: "byUser", fields: ["id"])
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}
```

### Step 2: Push Schema Changes to AWS

Run the following commands to deploy the schema update:

```bash
# Push the updated schema to AWS
amplify push

# When prompted, confirm the changes
# This will update the DynamoDB table and regenerate GraphQL operations
```

### Step 3: Regenerate GraphQL Code

After pushing, Amplify will automatically regenerate the GraphQL operations including:
- `src/graphql/mutations.js` - will include `studentId` in `UpdateUserInput`
- `src/graphql/queries.js` - will include `studentId` in query responses

### Step 4: Update Frontend Code

Once the schema is deployed, update the mutation inputs in both profile pages to include `studentId`:

**In `CompleteProfilePage.js`:**
```javascript
const input = {
  id: currentUser.username,
  name: formState.name,
  email: currentUser.attributes.email,
  studentId: formState.studentId,  // ADD THIS BACK
  major: formState.currentProgram,
  academicYear: formState.degreeType,
  expectedGraduation: formState.expectedGraduation,
  gpa: formState.gpa ? parseFloat(formState.gpa) : null,
  researchInterests,
  skills,
  availability: formState.availability,
  personalStatement: formState.personalStatement,
  certificates,
  role: formState.role,
  profileComplete: true
};
```

**In `ProfilePage.js`:**
```javascript
const input = {
  id: user.id || user.username,
  name: formState.name,
  studentId: formState.studentId || null,  // ADD THIS BACK
  major: formState.currentProgram,
  academicYear: formState.degreeType,
  expectedGraduation: formState.expectedGraduation || null,
  gpa: formState.gpa ? parseFloat(formState.gpa) : null,
  researchInterests,
  skills,
  availability: formState.availability || null,
  personalStatement: formState.personalStatement || null,
  certificates,
  profileComplete: true
};
```

## Current Field Mapping

The form currently maps to these schema fields correctly:

| Form Field | Schema Field | Type | Status |
|------------|--------------|------|--------|
| studentId | ❌ NOT IN SCHEMA | String | Need to add |
| name | name | String! | ✅ |
| currentProgram | major | String | ✅ |
| degreeType | academicYear | String | ✅ |
| expectedGraduation | expectedGraduation | String | ✅ |
| gpa | gpa | Float | ✅ |
| researchInterests | researchInterests | [String] | ✅ |
| skillsExperience | skills | [String] | ✅ |
| availability | availability | String | ✅ |
| personalStatement | personalStatement | String | ✅ |
| certificates | certificates | [String] | ✅ |

## Notes

- The `id` field in the User type is the system-generated UUID (from Cognito username)
- The `studentId` field will be the user-entered university student ID
- These are separate fields serving different purposes
- No authentication or authorization changes are needed
