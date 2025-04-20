import React, { useState, useEffect } from "react";
import { logout } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import ResumeForm from "../components/ResumeForm";
import { getUserResumes, deleteResume } from "../services/resumeService";
import { format } from 'date-fns';

const Dashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, resumeId: null });
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const loadResumes = async () => {
      if (user) {
        try {
          const userResumes = await getUserResumes(user.uid);
          setResumes(userResumes);
        } catch (error) {
          console.error("Error loading resumes:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadResumes();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSaveResume = async (data) => {
    try {
      setIsDialogOpen(false);
      alert('Resume generated successfully!');
    } catch (error) {
      console.error('Error handling resume:', error);
      alert('Failed to save resume. Please try again.');
    }
  };

  const handleDelete = async (resumeId) => {
    try {
      await deleteResume(resumeId);
      setResumes(prevResumes => prevResumes.filter(resume => resume.id !== resumeId));
      setDeleteConfirm({ show: false, resumeId: null });
    } catch (error) {
      console.error("Error deleting resume:", error);
      alert("Failed to delete resume. Please try again.");
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return format(date, 'MMM d, yyyy');
  };

  const getTimeDifference = (date) => {
    if (!date) return 'never edited';
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'today';
    if (diff === 1) return 'yesterday';
    return `${diff} days ago`;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Resume<span className="text-gradient">Vault</span></h1>
          <div className="header-right">
            <div className="user-profile">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  referrerPolicy="no-referrer"
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar">
                  {user?.displayName?.[0] || user?.email?.[0]}
                </div>
              )}
              <div className="user-info">
                <p className="user-name">{user?.displayName || 'User'}</p>
              </div>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome back{user?.displayName ? `, ${user.displayName}` : ''}<span className="text-gradient">.</span></h2>
          <p className="subtitle">Create and manage your professional resumes</p>
        </div>

        <div className="action-bar">
          <div className="search-stats">
            <p className="stats">
              <span className="stats-number">{resumes.length}</span> resumes created
            </p>
          </div>
          <button className="create-button" onClick={() => setIsDialogOpen(true)}>
            <span className="button-icon">+</span>
            New Resume
          </button>
        </div>

        <div className="resume-grid">
          {isLoading ? (
            <div className="loading-state">Loading your resumes...</div>
          ) : resumes.length === 0 ? (
            <div className="empty-state">
              <p>You haven't created any resumes yet.</p>
              <button className="create-button" onClick={() => setIsDialogOpen(true)}>
                Create your first resume
              </button>
            </div>
          ) : (
            resumes.map((resume) => (
              <div key={resume.id} className="resume-card">
                <div className="resume-card-header">
                  <div className="resume-icon">📄</div>
                  <div className="resume-status">
                    Last edited {getTimeDifference(resume.lastEdited)}
                  </div>
                </div>
                <div className="resume-card-content">
                  <h3>{resume.personalInfo?.fullName || 'Untitled Resume'}</h3>
                  <p className="resume-description">
                    {resume.summary?.substring(0, 100)}...
                  </p>
                </div>
                <div className="resume-card-actions">
                  <button 
                    className="card-action-button edit"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Edit
                  </button>
                  <button 
                    className="card-action-button download"
                    onClick={() => {/* Add download logic */}}
                  >
                    Download
                  </button>
                  <button 
                    className="card-action-button delete"
                    onClick={() => setDeleteConfirm({ show: true, resumeId: resume.id })}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Delete Resume</h3>
            <p>Are you sure you want to delete this resume? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setDeleteConfirm({ show: false, resumeId: null })}
              >
                Cancel
              </button>
              <button 
                className="delete-button"
                onClick={() => handleDelete(deleteConfirm.resumeId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isDialogOpen && (
        <ResumeForm 
          onSave={handleSaveResume} 
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
