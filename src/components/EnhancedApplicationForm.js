import React, { useMemo, useState } from 'react';
import { API, graphqlOperation, Auth, Storage } from 'aws-amplify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Card, 
  TextField,
  TextAreaField,
  SelectField,
  Divider,
  Collection,
  Alert
} from '@aws-amplify/ui-react';
import { createApplication, updateUser, listApplications } from '../graphql/operations';
import { sendNewItemNotification } from '../utils/emailNotifications';
import { useTags } from '../contexts/TagContext';
import { mapTagIdsToDisplayNames } from '../lib/tags/tagDisplay';
import RichTextContent from './common/RichTextContent';
import { countWordsFromRichText, sanitizeRichText } from '../utils/richText';
import buttonStyles from '../styles/dashboardButtons.module.css';
import '../styles/unifiedFormModal.css';

const EnhancedApplicationForm = ({ project, user, onClose, onSuccess }) => {
  const primaryActionButtonClassName = `${buttonStyles.actionButton} ${buttonStyles.actionButtonPrimary} ${buttonStyles.actionButtonCompact}`;
  const secondaryActionButtonClassName = `${buttonStyles.actionButton} ${buttonStyles.actionButtonGhost} ${buttonStyles.actionButtonCompact}`;
  const iconActionButtonClassName = `${buttonStyles.actionButton} ${buttonStyles.actionButtonGhost} ${buttonStyles.actionButtonCompact} ${buttonStyles.actionButtonIcon}`;
  const cacheKey = `application_draft_${user.id || user.username}_${project.id}`;
  
  // Load cached data on component mount
  const loadCachedData = () => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        return {
          statement: data.statement || '',
          courses: data.courses || [{ courseName: '', courseNumber: '', grade: '', semester: '', year: '' }]
        };
      }
    } catch (e) {
      console.error('Error loading cached data:', e);
    }
    return {
      statement: '',
      courses: [{ courseName: '', courseNumber: '', grade: '', semester: '', year: '' }]
    };
  };
  
  const cachedData = loadCachedData();
  const [statement, setStatement] = useState(cachedData.statement);
  const [courses, setCourses] = useState(cachedData.courses);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { tagsById } = useTags();

  const researchInterestNames = useMemo(
    () => mapTagIdsToDisplayNames(user.researchInterests || [], tagsById),
    [user.researchInterests, tagsById]
  );

  const skillNames = useMemo(
    () => mapTagIdsToDisplayNames(user.skills || [], tagsById),
    [user.skills, tagsById]
  );

  const certificateNames = useMemo(
    () => mapTagIdsToDisplayNames(user.certificates || [], tagsById),
    [user.certificates, tagsById]
  );

  const addCourse = () => {
    if (courses.length < 10) {
      const newCourses = [...courses, { courseName: '', courseNumber: '', grade: '', semester: '', year: '' }];
      setCourses(newCourses);
      saveToDraft(statement, newCourses);
    }
  };

  const removeCourse = (index) => {
    const newCourses = courses.filter((_, i) => i !== index);
    setCourses(newCourses);
    saveToDraft(statement, newCourses);
  };

  const updateCourse = (index, field, value) => {
    const updatedCourses = courses.map((course, i) => 
      i === index ? { ...course, [field]: value } : course
    );
    setCourses(updatedCourses);
    saveToDraft(statement, updatedCourses);
  };
  
  // Save form data to localStorage
  const saveToDraft = (currentStatement, currentCourses) => {
    try {
      const draftData = {
        statement: currentStatement,
        courses: currentCourses,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(cacheKey, JSON.stringify(draftData));
    } catch (e) {
      console.error('Error saving draft:', e);
    }
  };
  
  // Clear draft after successful submission
  const clearDraft = () => {
    try {
      localStorage.removeItem(cacheKey);
    } catch (e) {
      console.error('Error clearing draft:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const sanitizedStatement = sanitizeRichText(statement);

    // Validate required fields
    if (!sanitizedStatement) {
      setError('Please fill out the required Statement of Interest field.');
      setIsSubmitting(false);
      return;
    }

    // Validate transcript upload if required
    if (project.requiresTranscript && !uploadedFile) {
      setError('This project requires transcript upload. Please upload your transcript.');
      setIsSubmitting(false);
      return;
    } 

    try {
      // Check application limit by counting current applications
      const currentApplications = await API.graphql(graphqlOperation(listApplications, { 
        limit: 100
      }));
      const userApplications = currentApplications.data.listApplications.items.filter(
        app => app.studentID === (user.id || user.username) && 
        !['Rejected', 'Cancelled', 'Expired', 'Withdrawn'].includes(app.status)
      );
      
      if (userApplications.length >= 3) {
        setError('You have reached the maximum of 3 applications.');
        setIsSubmitting(false);
        return;
      }

      // Validate statement length (around 450 words)
      const wordCount = countWordsFromRichText(sanitizedStatement);
      if (wordCount < 300) {
        setError('Your statement should be at least 300 words. Current count: ' + wordCount);
        setIsSubmitting(false);
        return;
      }

      const currentUser = await Auth.currentAuthenticatedUser();
      const userId = currentUser.username;

      // Filter out empty courses
      const validCourses = courses.filter(course => course.courseName.trim());

      let documentKey = null;
      
      // Upload document if provided
      if (uploadedFile) {
        setUploading(true);
        try {
          const fileExtension = uploadedFile.name.split('.').pop();
          const fileName = `applications/${userId}/${project.id}/${Date.now()}.${fileExtension}`;
          
          const result = await Storage.put(fileName, uploadedFile, {
            contentType: uploadedFile.type,
            metadata: {
              studentId: userId,
              projectId: project.id,
              originalName: uploadedFile.name
            }
          });
          
          documentKey = result.key;
        } catch (uploadError) {
          console.error('Error uploading document:', uploadError);
          setError('Failed to upload document. Please try again.');
          return;
        } finally {
          setUploading(false);
        }
      }

      const applicationInput = {
        studentID: userId,
        projectID: project.id,
        statement: sanitizedStatement,
        relevantCourses: validCourses,
        documentKey,
        status: 'Coordinator Review'
      };

      await API.graphql(graphqlOperation(createApplication, { input: applicationInput }));
      
      // Clear draft after successful submission
      clearDraft();
      
      // Send notification to coordinator about new application
      try {
        await sendNewItemNotification(
          'coordinator@gcu.edu', // Replace with actual coordinator email
          'Coordinator',
          'Application',
          project.title,
          user.name,
          user.email
        );
      } catch (emailError) {
        console.log('Email notification prepared (SES integration pending):', emailError);
      }

      onSuccess();
    } catch (err) {
      console.error('Error submitting application:', err);
      if (err.errors && err.errors.length > 0) {
        console.error('GraphQL error:', err.errors[0].message);
        setError(err.errors[0].message || 'Failed to submit application. Please try again.');
      } else {
        setError('Failed to submit application. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ufm-body">

      <div className="ufm-header">
        <div className="ufm-header-text">
          <h2 className="ufm-title">Apply to {project.title}</h2>
          <p className="ufm-subtitle">Complete the form below to submit your application.</p>
        </div>
        <Button
          type="button"
          data-dashboard-button="true"
          data-close-button="true"
          className={iconActionButtonClassName}
          aria-label="Close application form"
          onClick={onClose}
        >
          <span className="closeButtonGlyph" aria-hidden="true">&times;</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="ufm-form">

        {/* Guidelines */}
        <div className="ufm-info-banner">
          <strong>Application Guidelines</strong>
          <span>
            • Up to 3 applications total &nbsp;• Statement ~450 words &nbsp;• Up to 10 courses &nbsp;• Auto-saved as you type
          </span>
        </div>

        {error && <div className="ufm-error-banner">{error}</div>}

        {/* Section 1: Project Info */}
        <div className="ufm-section">
          <div className="ufm-section-header">
            <p className="ufm-section-title">Research Project</p>
          </div>
          <RichTextContent
            html={project.description}
            className="quill-content"
            style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#1e293b' }}
          />
          {project.department && <p className="ufm-meta">College: {project.department}</p>}
          {project.faculty?.name && <p className="ufm-meta">Faculty: {project.faculty.name}</p>}
          {project.duration && <p className="ufm-meta">Duration: {project.duration}</p>}
        </div>

        {/* Section 2: Student Profile */}
        <div className="ufm-section">
          <div className="ufm-section-header">
            <p className="ufm-section-title">Your Profile</p>
            <p className="ufm-section-desc">This information is pulled from your profile.</p>
          </div>
          <div className="ufm-row-2">
            <p className="ufm-meta">Program: {user.major || 'Not specified'}</p>
            <p className="ufm-meta">Degree: {user.academicYear || 'Not specified'}</p>
          </div>
          <div className="ufm-row-2">
            <p className="ufm-meta">Expected Graduation: {user.expectedGraduation || 'Not specified'}</p>
            <p className="ufm-meta">Availability: {user.availability || 'Not specified'}</p>
          </div>
          <p className="ufm-meta">Research Interests: {researchInterestNames.join(', ') || 'Not specified'}</p>
          <p className="ufm-meta">Skills: {skillNames.join(', ') || 'Not specified'}</p>
          <p className="ufm-meta">Certificates: {certificateNames.join(', ') || 'Not specified'}</p>
        </div>

        {/* Section 3: Statement */}
        <div className="ufm-section">
          <div className="ufm-section-header">
            <p className="ufm-section-title">Statement of Interest <span style={{ color: '#ef4444' }}>*</span></p>
            <p className="ufm-section-desc">Why are you interested? What skills can you bring? What do you hope to gain?</p>
          </div>
          <div className="ufm-editor-wrap">
            <ReactQuill
              value={statement}
              onChange={(value) => {
                setStatement(value);
                saveToDraft(value, courses);
              }}
              placeholder="Why are you interested in this project? Why are you qualified? What skills can you bring? What classes have you taken that relate? What do you hope to get out of this experience?"
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['clean']
                ]
              }}
            />
          </div>
          <p className="ufm-meta">
            Word count: {countWordsFromRichText(statement)} (aim for ~450 words)
          </p>
        </div>

        {/* Section 4: Coursework */}
        <div className="ufm-section">
          <div className="ufm-section-header">
            <p className="ufm-section-title">Relevant Coursework</p>
            <p className="ufm-section-desc">Include college-level courses relevant to this project (up to 10). Do NOT include AP or high school courses.</p>
          </div>

          {courses.map((course, index) => (
            <div key={index} className="ufm-course-card">
              <div className="ufm-course-header">
                <span>Course {index + 1}</span>
                {courses.length > 1 && (
                  <button type="button" data-dashboard-button="true" className={`${buttonStyles.actionButton} ${buttonStyles.actionButtonGhost} ${buttonStyles.actionButtonCompact}`} onClick={() => removeCourse(index)} style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem' }}>
                    Remove
                  </button>
                )}
              </div>
              <div className="ufm-row-2">
                <div className="ufm-field">
                  <label className="ufm-label">Course Name</label>
                  <input className="ufm-input" value={course.courseName} onChange={(e) => updateCourse(index, 'courseName', e.target.value)} placeholder="e.g. Introduction to Psychology" />
                </div>
                <div className="ufm-field">
                  <label className="ufm-label">Course Number</label>
                  <input className="ufm-input" value={course.courseNumber} onChange={(e) => updateCourse(index, 'courseNumber', e.target.value)} placeholder="e.g. PSYC 101" />
                </div>
              </div>
              <div className="ufm-row-3" style={{ marginTop: '0.75rem' }}>
                <div className="ufm-field">
                  <label className="ufm-label">Grade</label>
                  <select className="ufm-select" value={course.grade} onChange={(e) => updateCourse(index, 'grade', e.target.value)}>
                    <option value="">Select Grade</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="B-">B-</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="C-">C-</option>
                    <option value="D">D</option>
                    <option value="P">P (Pass)</option>
                    <option value="IP">IP (In Progress)</option>
                  </select>
                </div>
                <div className="ufm-field">
                  <label className="ufm-label">Semester</label>
                  <select className="ufm-select" value={course.semester} onChange={(e) => updateCourse(index, 'semester', e.target.value)}>
                    <option value="">Select Semester</option>
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
                <div className="ufm-field">
                  <label className="ufm-label">Year</label>
                  <input className="ufm-input" type="text" value={course.year} onChange={(e) => { const value = e.target.value; if (/^\d{0,4}$/.test(value)) { updateCourse(index, 'year', value); } }} placeholder="e.g. 2024" />
                </div>
              </div>
            </div>
          ))}

          {courses.length < 10 && (
            <button type="button" className="ufm-add-link" onClick={addCourse}>+ Add Another Course</button>
          )}
        </div>

        {/* Section 5: Documents */}
        <div className="ufm-section">
          <div className="ufm-section-header">
            <p className="ufm-section-title">
              Supporting Documents {project.requiresTranscript ? <span style={{ color: '#ef4444' }}>* (Transcript Required)</span> : '(Optional)'}
            </p>
            <p className="ufm-section-desc">
              {project.requiresTranscript
                ? 'Please upload your official or unofficial transcript.'
                : 'Upload additional documents that support your application (resume, portfolio, etc.)'}
            </p>
          </div>
          <input
            className="ufm-input"
            type="file"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const allowedExts = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'];
                const fileExt = file.name.split('.').pop().toLowerCase();
                if (!allowedExts.includes(fileExt)) {
                  setError('Invalid file type. Only PDF, DOC, DOCX, TXT, JPG, JPEG, and PNG files are allowed.');
                  e.target.value = '';
                  setUploadedFile(null);
                  return;
                }
                const maxSize = 5 * 1024 * 1024;
                if (file.size > maxSize) {
                  setError('File size exceeds 5MB limit. Please select a smaller file.');
                  e.target.value = '';
                  setUploadedFile(null);
                  return;
                }
                setError(null);
                setUploadedFile(file);
              }
            }}
            required={project.requiresTranscript}
          />
          {uploadedFile && (
            <p className="ufm-file-selected">Selected: {uploadedFile.name}</p>
          )}
        </div>

        {/* Footer */}
        <div className="ufm-footer">
          <button
            type="button"
            data-dashboard-button="true"
            className={secondaryActionButtonClassName}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            data-dashboard-button="true"
            className={primaryActionButtonClassName}
            disabled={isSubmitting || uploading}
          >
            {uploading ? 'Uploading Document...' : 'Submit Application'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default EnhancedApplicationForm;
