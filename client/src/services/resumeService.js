import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  setDoc,
  query,
  where,
  getDocs,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const saveResume = async (resumeData) => {
  if (!auth.currentUser) {
    throw new Error('No authenticated user found');
  }
  
  try {
    // Create a new doc reference with auto-generated ID
    const resumeRef = doc(collection(db, 'resumes'));
    
    // Add the data with the user ID
    await setDoc(resumeRef, {
      ...resumeData,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return resumeRef.id;
  } catch (error) {
    console.error('Error saving resume:', error);
    throw error;
  }
};

export const generateResumeHTML = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.personalInfo.fullName} - Resume</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Arial, sans-serif;
        }
        
        body {
          max-width: 850px;
          margin: 40px auto;
          padding: 40px;
          background: #ffffff;
          color: #2d3748;
          line-height: 1.6;
        }

        .header {
          text-align: center;
          margin-bottom: 2.5rem;
          padding-bottom: 2.5rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .header h1 {
          font-size: 2.5rem;
          color: #1a202c;
          margin-bottom: 0.5rem;
          letter-spacing: -0.5px;
        }

        .contact-info {
          color: #4a5568;
          font-size: 1.1rem;
        }

        .contact-info a {
          color: #4299e1;
          text-decoration: none;
        }

        .section {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
        }

        .section-title {
          font-size: 1.5rem;
          color: #2b6cb0;
          margin-bottom: 1.2rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e2e8f0;
          font-weight: 600;
        }

        .summary {
          font-size: 1.1rem;
          color: #4a5568;
          line-height: 1.8;
          margin-bottom: 2rem;
        }

        .experience-item, .education-item {
          margin-bottom: 1.5rem;
          break-inside: avoid;
        }

        .experience-item h3, .education-item h3 {
          color: #2d3748;
          font-size: 1.2rem;
          margin-bottom: 0.3rem;
        }

        .experience-meta, .education-meta {
          color: #718096;
          font-size: 0.95rem;
          margin-bottom: 0.8rem;
        }

        .responsibilities {
          color: #4a5568;
          padding-left: 1.2rem;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          margin-top: 1rem;
        }

        .skills-category h3 {
          color: #2d3748;
          font-size: 1.1rem;
          margin-bottom: 0.8rem;
        }

        .skills-list {
          color: #4a5568;
          line-height: 1.6;
        }

        .certification-item {
          margin-bottom: 1rem;
        }

        .certification-item h3 {
          color: #2d3748;
          font-size: 1.1rem;
          margin-bottom: 0.3rem;
        }

        .certification-meta {
          color: #718096;
          font-size: 0.95rem;
        }

        @media print {
          body {
            margin: 0;
            padding: 20px;
          }

          .header {
            margin-bottom: 2rem;
            padding-bottom: 2rem;
          }

          .section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${data.personalInfo.fullName}</h1>
        <div class="contact-info">
          ${data.personalInfo.email} • ${data.personalInfo.phone} • ${data.personalInfo.location}<br>
          ${data.personalInfo.linkedIn ? `<a href="${data.personalInfo.linkedIn}" target="_blank">LinkedIn Profile</a>` : ''}
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Professional Summary</h2>
        <div class="summary">${data.summary}</div>
      </div>

      <div class="section">
        <h2 class="section-title">Experience</h2>
        ${data.workExperience.map(exp => `
          <div class="experience-item">
            <h3>${exp.title} - ${exp.company}</h3>
            <div class="experience-meta">${exp.startDate} - ${exp.endDate} | ${exp.location}</div>
            <div class="responsibilities">${exp.responsibilities}</div>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2 class="section-title">Education</h2>
        ${data.education.map(edu => `
          <div class="education-item">
            <h3>${edu.degree}</h3>
            <div class="education-meta">
              ${edu.institution} | ${edu.location}<br>
              Graduated: ${edu.graduationDate} ${edu.gpa ? `| GPA: ${edu.gpa}` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2 class="section-title">Skills</h2>
        <div class="skills-grid">
          <div class="skills-category">
            <h3>Technical Skills</h3>
            <div class="skills-list">${data.skills.technical}</div>
          </div>
          <div class="skills-category">
            <h3>Soft Skills</h3>
            <div class="skills-list">${data.skills.softSkills}</div>
          </div>
          ${data.skills.tools ? `
            <div class="skills-category">
              <h3>Tools & Technologies</h3>
              <div class="skills-list">${data.skills.tools}</div>
            </div>
          ` : ''}
          ${data.skills.languages ? `
            <div class="skills-category">
              <h3>Languages</h3>
              <div class="skills-list">${data.skills.languages}</div>
            </div>
          ` : ''}
        </div>
      </div>

      ${data.certifications.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Certifications</h2>
          ${data.certifications.map(cert => `
            <div class="certification-item">
              <h3>${cert.name}</h3>
              <div class="certification-meta">${cert.issuer} | ${cert.date}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </body>
    </html>
  `;
};

export const getUserResumes = async (userId) => {
  try {
    const resumesRef = collection(db, 'resumes');
    const q = query(resumesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastEdited: doc.data().updatedAt?.toDate() || doc.data().createdAt?.toDate()
    }));
  } catch (error) {
    console.error('Error fetching resumes:', error);
    throw error;
  }
};

export const getResumeById = async (resumeId) => {
  try {
    const resumeDoc = await getDoc(doc(db, 'resumes', resumeId));
    if (!resumeDoc.exists()) {
      throw new Error('Resume not found');
    }
    return {
      id: resumeDoc.id,
      ...resumeDoc.data()
    };
  } catch (error) {
    console.error('Error fetching resume:', error);
    throw error;
  }
};

export const deleteResume = async (resumeId) => {
  try {
    await deleteDoc(doc(db, 'resumes', resumeId));
  } catch (error) {
    console.error('Error deleting resume:', error);
    throw error;
  }
};
