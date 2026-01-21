# Research Marketplace Workflow Fix

## Executive Summary
The Create Project button works correctly. The issue is **inconsistent status values** throughout the application causing visibility and workflow problems.

## Root Causes Identified

### 1. Project Creation Status ✅ FIXED
- Faculty creates with `projectStatus: 'Pending'` (Line 379)
- Coordinator filters for `projectStatus === 'Pending'` (Line 104)
- **STATUS: Working correctly after previous fix**

### 2. Application Status Inconsistency ⚠️ NEEDS FIX
**Problem**: Application initial status varies across codebase
- EnhancedApplicationForm.js: Uses `'Coordinator Review'`
- Expected by Coordinator: `'Coordinator Review'`
- Expected by Faculty: `'Faculty Review'`
- Schema suggests: Could be `'Submitted'` or `'PENDING_REVIEW'`

### 3. Workflow Status Values
**Current Schema Status Flow**:
```
PROJECT STATUSES:
- Pending → Coordinator reviews → Approved/Rejected/Returned
- Approved → Visible to students
- Rejected → Hidden from students
- Returned → Faculty must edit and resubmit

APPLICATION STATUSES:
- Coordinator Review → Coordinator approves → Faculty Review
- Faculty Review → Faculty approves → Approved
- Rejected → Terminal state
- Returned → Student must resubmit
```

## Files Requiring Changes

### Priority 1: Application Status Standardization

**File**: `src/components/EnhancedApplicationForm.js`
**Current**: Line ~150-200 (application submission)
**Issue**: Initial status may not match coordinator expectations
**Fix**: Ensure status is `'Coordinator Review'`

### Priority 2: Coordinator Dashboard Filter

**File**: `src/pages/CoordinatorDashboard.js`
**Current**: Line 104 filters `projectStatus === 'Pending'` ✅
**Current**: Line ~120 filters applications with `status === 'Coordinator Review'` ✅
**Status**: Already correct

### Priority 3: Faculty Dashboard Application Display

**File**: `src/pages/FacultyDashboard.js`
**Current**: Shows applications with various statuses
**Issue**: May not properly filter for `'Faculty Review'` status
**Fix**: Ensure faculty only sees applications in `'Faculty Review'` status

### Priority 4: Student Application Submission

**File**: `src/pages/SearchPage.js`
**Current**: Only shows `projectStatus === 'Approved'` projects ✅
**Status**: Already correct

## Detailed Code Changes

### Change 1: Verify EnhancedApplicationForm Status
**Location**: `src/components/EnhancedApplicationForm.js`
**Search for**: `status:` in createApplication mutation
**Ensure it's**: `status: 'Coordinator Review'`

### Change 2: Verify Coordinator Approve Action
**Location**: `src/pages/CoordinatorDashboard.js`
**Function**: `handleApplicationAction`
**When approving**: Should set `status: 'Faculty Review'`
**Current code** (Line ~240):
```javascript
case 'approve':
  newStatus = 'Faculty Review';
  break;
```
✅ Already correct

### Change 3: Verify Faculty Review Filter
**Location**: `src/pages/FacultyDashboard.js`
**Function**: `getReviewNeededApplications`
**Current code** (Line ~560):
```javascript
if (user.role === 'Faculty') {
  return app.status === 'Faculty Review';
}
```
✅ Already correct

## Testing Checklist

### End-to-End Workflow Test

1. **Faculty Creates Project**
   - [ ] Click "Create Project" button
   - [ ] Fill required fields (title, description, college, deadline)
   - [ ] Click "Create Project" submit button
   - [ ] Verify console shows: `[FacultyDashboard] Create Project clicked - handler executing`
   - [ ] Verify console shows: `Creating new project with status: Pending`
   - [ ] Verify success message appears
   - [ ] Verify modal closes

2. **Coordinator Sees Pending Project**
   - [ ] Login as Coordinator
   - [ ] Navigate to "Pending Reviews" tab
   - [ ] Verify newly created project appears in Projects section
   - [ ] Click kebab menu (⋯) on project
   - [ ] Click "Approve"
   - [ ] Enter approval reason
   - [ ] Click "Approve" button
   - [ ] Verify project moves to "Approved Items" tab

3. **Student Sees Approved Project**
   - [ ] Login as Student
   - [ ] Navigate to Search page
   - [ ] Verify approved project appears in results
   - [ ] Verify "Apply" button is enabled
   - [ ] Click "Apply" button
   - [ ] Fill application form
   - [ ] Submit application
   - [ ] Verify success message

4. **Coordinator Sees Application**
   - [ ] Login as Coordinator
   - [ ] Navigate to "Pending Reviews" tab
   - [ ] Verify application appears in Applications section
   - [ ] Click kebab menu on application
   - [ ] Click "Approve"
   - [ ] Enter approval reason
   - [ ] Verify application status changes to "Faculty Review"

5. **Faculty Sees Application**
   - [ ] Login as Faculty
   - [ ] Navigate to "Pending Review" tab
   - [ ] Verify application appears under project
   - [ ] Click kebab menu
   - [ ] Click "Review Now"
   - [ ] Approve or reject application
   - [ ] Verify status updates

## Status Value Reference

### Project Status Values
```javascript
'Pending'           // Initial state after faculty creates
'Approved'          // After coordinator approves
'Rejected'          // After coordinator rejects
'Returned'          // Coordinator returns for edits
```

### Application Status Values
```javascript
'Coordinator Review'  // Initial state after student submits
'Faculty Review'      // After coordinator approves
'Approved'            // After faculty approves
'Rejected'            // After coordinator or faculty rejects
'Returned'            // Returned to student for edits
```

## Verification Commands

### Check Project Status in Database
```bash
# Use AWS Console or Amplify CLI to query DynamoDB
# Look for projects with status 'Pending' vs 'Coordinator Review'
```

### Check Application Status in Database
```bash
# Verify applications have status 'Coordinator Review' initially
```

## Rollback Plan

If issues occur:
1. Revert FacultyDashboard.js line 379 to previous status value
2. Revert CoordinatorDashboard.js line 104 to previous filter
3. Run `amplify push` to restore previous state

## Additional Notes

- The Create Project button was never broken - it was a visibility issue
- Previous fix already corrected the status mismatch
- This document provides comprehensive testing to verify the fix
- No code changes needed if previous fix was applied correctly
