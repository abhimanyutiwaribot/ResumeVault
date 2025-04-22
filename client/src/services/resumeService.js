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
  // Split responsibilities into bullet points if it's a string
  const formatResponsibilities = (responsibilities) => {
    if (!responsibilities) return '';
    // Split by new lines or periods to create bullet points
    const bullets = responsibilities.split(/[.\n]+/).filter(item => item.trim());
    return bullets.map(item => `<li>${item.trim()}</li>`).join('');
  };

  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.3;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header { margin-bottom: 12px; }
          h1 { 
            font-size: 16pt;
            margin: 0 0 4px 0;
          }
          h2 {
            font-size: 12pt;
            margin: 8px 0 4px 0;
            border-bottom: 1px solid #ccc;
          }
          .contact-info {
            font-size: 9pt;
            margin: 0;
          }
          .section { margin-bottom: 12px; }
          .experience-item, .education-item {
            margin-bottom: 8px;
          }
          .job-title, .degree {
            font-weight: bold;
            font-size: 10pt;
          }
          .company, .institution {
            font-weight: normal;
          }
          .dates {
            float: right;
            font-size: 9pt;
          }
          ul {
            margin: 4px 0;
            padding-left: 20px;
          }
          li {
            margin: 2px 0;
            font-size: 9pt;
          }
          .skills-section {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            font-size: 9pt;
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
          <h2>Professional Summary</h2>
          <p>${data.summary}</p>
        </div>

        <div class="section">
          <h2>Experience</h2>
          ${data.workExperience.map(exp => `
            <div class="experience-item">
              <div class="job-title">${exp.title}</div>
              <div class="company">${exp.company}</div>
              <div class="dates">${exp.startDate} - ${exp.endDate}</div>
              <ul>
                ${formatResponsibilities(exp.responsibilities)}
              </ul>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <h2>Education</h2>
          ${data.education.map(edu => `
            <div class="education-item">
              <div class="degree">${edu.degree}</div>
              <div class="institution">${edu.institution}</div>
              <div class="dates">Graduated: ${edu.graduationDate}</div>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <h2>Skills</h2>
          <div class="skills-section">
            <div>
              <strong>Technical Skills:</strong>
              <p>${data.skills.technical}</p>
            </div>
            <div>
              <strong>Soft Skills:</strong>
              <p>${data.skills.softSkills}</p>
            </div>
            ${data.skills.tools ? `
              <div>
                <strong>Tools & Technologies:</strong>
                <p>${data.skills.tools}</p>
              </div>
            ` : ''}
            ${data.skills.languages ? `
              <div>
                <strong>Languages:</strong>
                <p>${data.skills.languages}</p>
              </div>
            ` : ''}
          </div>
        </div>

        ${data.certifications.length > 0 ? `
          <div class="section">
            <h2>Certifications</h2>
            ${data.certifications.map(cert => `
              <div>
                <strong>${cert.name}</strong>
                <p>${cert.issuer} | ${cert.date}</p>
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
