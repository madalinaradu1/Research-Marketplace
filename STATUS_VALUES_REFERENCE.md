# QUICK REFERENCE: Research Marketplace Status Values

## PROJECT STATUS VALUES

| Status | Meaning | Who Sees It | Next Action |
|--------|---------|-------------|-------------|
| `Pending` | Awaiting coordinator review | Faculty, Coordinator | Coordinator approves/rejects/returns |
| `Approved` | Ready for student applications | Everyone | Students can apply |
| `Rejected` | Coordinator rejected | Faculty, Coordinator | Terminal state |
| `Returned` | Needs faculty edits | Faculty, Coordinator | Faculty edits and resubmits |

## APPLICATION STATUS VALUES

| Status | Meaning | Who Sees It | Next Action |
|--------|---------|-------------|-------------|
| `Coordinator Review` | Awaiting coordinator review | Student, Coordinator | Coordinator approves/rejects/returns |
| `Faculty Review` | Awaiting faculty review | Student, Faculty, Coordinator | Faculty approves/rejects/returns |
| `Approved` | Student selected for project | Everyone | Project work begins |
| `Rejected` | Application rejected | Student, Faculty, Coordinator | Terminal state |
| `Returned` | Needs student edits | Student, Faculty, Coordinator | Student edits and resubmits |

## WORKFLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    FACULTY CREATES PROJECT                   │
│                    projectStatus: 'Pending'                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              COORDINATOR REVIEWS PROJECT                     │
│  ┌──────────┬──────────────┬──────────────┐                │
│  │ Approve  │   Reject     │   Return     │                │
│  │'Approved'│ 'Rejected'   │ 'Returned'   │                │
│  └────┬─────┴──────────────┴──────┬───────┘                │
└───────┼────────────────────────────┼────────────────────────┘
        │                            │
        │                            └──> Faculty edits & resubmits
        ▼
┌─────────────────────────────────────────────────────────────┐
│              STUDENT APPLIES TO PROJECT                      │
│              status: 'Coordinator Review'                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            COORDINATOR REVIEWS APPLICATION                   │
│  ┌──────────┬──────────────┬──────────────┐                │
│  │ Approve  │   Reject     │   Return     │                │
│  │'Faculty  │ 'Rejected'   │ 'Returned'   │                │
│  │ Review'  │              │              │                │
│  └────┬─────┴──────────────┴──────┬───────┘                │
└───────┼────────────────────────────┼────────────────────────┘
        │                            │
        │                            └──> Student edits & resubmits
        ▼
┌─────────────────────────────────────────────────────────────┐
│              FACULTY REVIEWS APPLICATION                     │
│  ┌──────────┬──────────────┬──────────────┐                │
│  │ Approve  │   Reject     │   Return     │                │
│  │'Approved'│ 'Rejected'   │ 'Returned'   │                │
│  └────┬─────┴──────────────┴──────┬───────┘                │
└───────┼────────────────────────────┼────────────────────────┘
        │                            │
        │                            └──> Student edits & resubmits
        ▼
   PROJECT WORK BEGINS
```

## FILE LOCATIONS

### Project Status Set/Updated
- **Created**: `src/pages/FacultyDashboard.js` line 379
- **Updated**: `src/pages/CoordinatorDashboard.js` line 180-195

### Application Status Set/Updated
- **Created**: `src/components/EnhancedApplicationForm.js` line 178
- **Updated**: `src/pages/CoordinatorDashboard.js` line 280-295
- **Updated**: `src/components/ApplicationReview.js` (faculty review)

### Status Filters
- **Coordinator sees Pending projects**: `src/pages/CoordinatorDashboard.js` line 104
- **Students see Approved projects**: `src/pages/SearchPage.js` line 130
- **Coordinator sees Coordinator Review apps**: `src/pages/CoordinatorDashboard.js` line 120
- **Faculty sees Faculty Review apps**: `src/pages/FacultyDashboard.js` line 560

## GRAPHQL SCHEMA

```graphql
type Project {
  projectStatus: String  # 'Pending' | 'Approved' | 'Rejected' | 'Returned'
}

type Application {
  status: String  # 'Coordinator Review' | 'Faculty Review' | 'Approved' | 'Rejected' | 'Returned'
}
```

## COMMON ISSUES

### Issue: Coordinator doesn't see pending projects
**Cause**: Project has wrong status value
**Fix**: Verify `projectStatus === 'Pending'` (not 'Coordinator Review')

### Issue: Students don't see approved projects  
**Cause**: Project not approved or deadline passed
**Fix**: Verify `projectStatus === 'Approved'` and deadline is future

### Issue: Applications not appearing for coordinator
**Cause**: Application has wrong status value
**Fix**: Verify `status === 'Coordinator Review'`

### Issue: Applications not appearing for faculty
**Cause**: Coordinator hasn't approved yet
**Fix**: Verify `status === 'Faculty Review'`

## TESTING COMMANDS

### Check Project Status
```javascript
// In browser console after fetching projects
projects.forEach(p => console.log(p.title, p.projectStatus));
```

### Check Application Status
```javascript
// In browser console after fetching applications
applications.forEach(a => console.log(a.id, a.status));
```

### Verify Filters
```javascript
// Check what coordinator sees
const pending = projects.filter(p => p.projectStatus === 'Pending');
console.log('Pending projects:', pending.length);

// Check what students see
const approved = projects.filter(p => p.projectStatus === 'Approved');
console.log('Approved projects:', approved.length);
```
