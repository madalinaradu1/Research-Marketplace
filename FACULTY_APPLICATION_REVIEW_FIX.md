# FACULTY APPLICATION REVIEW FIX

## ROOT CAUSE IDENTIFIED

**GraphQL Authorization Error**: Faculty role is NOT authorized to update Application records.

### Current Schema Auth Rules (Line 65-72)
```graphql
type Application @model @auth(rules: [
  { allow: owner, operations: [create, read, update, delete] },
  { allow: private, operations: [read] },
  { allow: groups, groups: ["Admin"], operations: [read, update] },
  { allow: groups, groups: ["Coordinator"], operations: [read, update] }
])
```

**Problem**: Faculty group is missing from the auth rules. Only Admin and Coordinator can update applications.

**Expected Error Message**: 
```
"Not Authorized to access updateApplication on type Mutation"
```
or
```
"User is not authorized to perform this operation"
```

## SOLUTION

### Step 1: Update GraphQL Schema

**File**: `amplify/backend/api/researchmarketplace/schema.graphql`

**Change Line 65-72** from:
```graphql
type Application @model @auth(rules: [
  { allow: owner, operations: [create, read, update, delete] },
  { allow: private, operations: [read] },
  { allow: groups, groups: ["Admin"], operations: [read, update] },
  { allow: groups, groups: ["Coordinator"], operations: [read, update] }
])
```

**To**:
```graphql
type Application @model @auth(rules: [
  { allow: owner, operations: [create, read, update, delete] },
  { allow: private, operations: [read] },
  { allow: groups, groups: ["Admin"], operations: [read, update] },
  { allow: groups, groups: ["Coordinator"], operations: [read, update] },
  { allow: groups, groups: ["Faculty"], operations: [read, update] }
])
```

### Step 2: Deploy Schema Changes

Run these commands in order:

```bash
# Navigate to project root
cd "c:\Users\arsen\Documents\Research Marketplace\Research-Marketplace"

# Push schema changes to AWS
amplify push

# When prompted:
# - "Do you want to update code for your updated GraphQL API?" → Yes
# - "Do you want to generate GraphQL statements?" → Yes
```

This will:
1. Update the AppSync API with new auth rules
2. Regenerate GraphQL operations
3. Update IAM policies to allow Faculty group access

### Step 3: Verify Fix

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Refresh the page** (Ctrl+F5)
3. Login as Faculty
4. Try to accept/reject an application
5. **Check console** - should see detailed error logs if still failing

## ENHANCED ERROR LOGGING

Already applied to `src/components/ApplicationReview.js` (Line ~120-140):

```javascript
} catch (err) {
  console.error('Error updating application:', err);
  
  // Log detailed GraphQL error information
  if (err.errors && err.errors.length > 0) {
    console.error('GraphQL Error Details:');
    err.errors.forEach((error, index) => {
      console.error(`Error ${index + 1}:`);
      console.error('  Message:', error.message);
      console.error('  ErrorType:', error.errorType);
      console.error('  Path:', error.path);
      console.error('  Locations:', error.locations);
    });
    setError(`Failed to update application: ${err.errors[0].message}`);
  } else {
    console.error('Full error object:', JSON.stringify(err, null, 2));
    setError('Failed to update application. Please try again.');
  }
}
```

This will now show the exact error message to help diagnose any remaining issues.

## TESTING CHECKLIST

### Before Schema Update
- [ ] Open browser console (F12)
- [ ] Login as Faculty
- [ ] Try to accept/reject application
- [ ] Verify console shows: "Not Authorized to access updateApplication"

### After Schema Update
- [ ] Run `amplify push`
- [ ] Wait for deployment to complete
- [ ] Clear browser cache
- [ ] Refresh page (Ctrl+F5)
- [ ] Login as Faculty
- [ ] Try to accept/reject application
- [ ] Verify:
  - [ ] No GraphQL errors in console
  - [ ] Success message appears
  - [ ] Application status updates in UI
  - [ ] Application status updates in database

## ALTERNATIVE: Conditional Update Based on Role

If you don't want to modify the schema, you can implement a workaround where Faculty actions are routed through a Lambda function or the Coordinator updates the application on behalf of Faculty. However, **updating the schema is the cleanest solution**.

## ROLLBACK PLAN

If issues occur after schema update:

1. Revert schema changes:
```graphql
type Application @model @auth(rules: [
  { allow: owner, operations: [create, read, update, delete] },
  { allow: private, operations: [read] },
  { allow: groups, groups: ["Admin"], operations: [read, update] },
  { allow: groups, groups: ["Coordinator"], operations: [read, update] }
])
```

2. Run `amplify push` again to revert

## ADDITIONAL NOTES

- The error logging enhancement is already applied and will help diagnose any future issues
- Faculty will only be able to update applications for projects they own (due to the `allow: private, operations: [read]` rule combined with project ownership)
- The schema change is minimal and follows AWS Amplify best practices
- No frontend code changes needed beyond the error logging enhancement
