import React, { useState } from "react";
import { saveResume, generateResumeHTML } from '../services/resumeService';
import { powerVerbs, exampleStatements, industryKeywords, strengthenStatement } from '../services/resumeSuggestions';

const ResumeForm = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedIn: "",
    },
    summary: "",
    workExperience: [
      {
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        responsibilities: "",
      },
    ],
    education: [
      {
        degree: "",
        institution: "",
        location: "",
        graduationDate: "",
        gpa: "",
      },
    ],
    skills: {
      technical: "",
      softSkills: "",
      tools: "",
      languages: "",
    },
    certifications: [
      {
        name: "",
        issuer: "",
        date: "",
      },
    ],
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [showExamples, setShowExamples] = useState({ section: null, index: null, field: null });
  const [activeExample, setActiveExample] = useState({ section: null, index: null, field: null });

  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1:
        if (!formData.personalInfo.fullName) newErrors.fullName = 'Name is required';
        if (!formData.personalInfo.email) newErrors.email = 'Email is required';
        if (!formData.personalInfo.phone) newErrors.phone = 'Phone is required';
        break;
      case 2:
        if (!formData.summary) newErrors.summary = 'Summary is required';
        break;
      case 3:
        if (formData.workExperience.length === 0) {
          newErrors.workExperience = 'Add at least one work experience';
        }
        break;
      // Add validation for other steps as needed
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (section, index, field, value) => {
    if (section === "personalInfo" || section === "skills") {
      setFormData({
        ...formData,
        [section]: { ...formData[section], [field]: value },
      });
    } else if (Array.isArray(formData[section])) {
      const newArray = [...formData[section]];
      newArray[index] = { ...newArray[index], [field]: value };
      setFormData({ ...formData, [section]: newArray });
    }
  };

  const handleContentChange = (section, value) => {
    const contentSuggestions = strengthenStatement(value);
    setSuggestions(contentSuggestions);
  };

  const addSection = (section) => {
    const emptyItem = {
      workExperience: {
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        responsibilities: "",
      },
      education: {
        degree: "",
        institution: "",
        location: "",
        graduationDate: "",
        gpa: "",
      },
      certifications: {
        name: "",
        issuer: "",
        date: "",
      },
    };

    setFormData({
      ...formData,
      [section]: [...formData[section], emptyItem[section]],
    });
  };

  const removeEntry = (section, index) => {
    const newArray = [...formData[section]];
    newArray.splice(index, 1);
    setFormData({ ...formData, [section]: newArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Save to Firestore
      const resumeId = await saveResume(formData);
      
      // Generate HTML
      const resumeHTML = generateResumeHTML(formData);
      
      // Create a Blob and download
      const blob = new Blob([resumeHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Close dialog and notify parent
      onSave({ ...formData, id: resumeId });
      onClose();
    } catch (error) {
      console.error('Error generating resume:', error);
      alert('Failed to generate resume. Please try again.');
    }
  };

  const handleNext = (e) => {
    e.preventDefault(); // Prevent form submission
    if (validateStep(currentStep)) {
      setCurrentStep(step => Math.min(step + 1, steps.length));
    }
  };

  const handlePrevious = (e) => {
    e.preventDefault(); // Prevent form submission
    setCurrentStep(step => Math.max(step - 1, 1));
  };

  const renderError = (field) => {
    return errors[field] ? (
      <span className="error-message">{errors[field]}</span>
    ) : null;
  };

  const renderInput = (section, index, field, placeholder, type = "text") => (
    <div className="form-field">
      <input
        type={type}
        placeholder={placeholder}
        value={
          section === "personalInfo" || section === "skills"
            ? formData[section][field]
            : formData[section][index][field]
        }
        onChange={(e) => handleChange(section, index, field, e.target.value)}
        className={errors[field] ? 'input-error' : ''}
      />
      {renderError(field)}
    </div>
  );

  const renderSuggestions = () => {
    if (suggestions.length === 0) return null;

    return (
      <div className="content-suggestions">
        <h4>Suggestions for Improvement:</h4>
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </div>
    );
  };

  const useExample = (section, index, field, example) => {
    const filledExample = example
      .replace(/{X}/g, '5')
      .replace(/{Y}/g, '30')
      .replace(/{role}/g, formData.workExperience[0]?.title || 'Professional')
      .replace(/{technology}/g, 'relevant technologies')
      .replace(/{metric}/g, 'efficiency')
      .replace(/{methodology}/g, 'Agile')
      .replace(/{specific_metric}/g, '25%')
      .replace(/{feature\/project}/g, 'key initiatives')
      .replace(/{departments}/g, 'multiple departments');

    if (section === "workExperience") {
      const newArray = [...formData.workExperience];
      newArray[index] = { ...newArray[index], [field]: filledExample };
      setFormData(prev => ({ ...prev, workExperience: newArray }));
    } else if (section === "summary") {
      setFormData(prev => ({ ...prev, summary: filledExample }));
    } else if (section.includes('.')) {
      const [mainSection, subSection] = section.split('.');
      setFormData(prev => ({
        ...prev,
        [mainSection]: { ...prev[mainSection], [subSection]: filledExample }
      }));
    }
    
    setActiveExample({ section: null, index: null, field: null });
  };

  const renderExamples = (section, index, field) => (
    <div className="content-examples">
      <button 
        type="button" 
        className="example-trigger"
        onClick={() => setActiveExample(prev => ({
          section: prev.section === section && prev.index === index ? null : section,
          index: prev.section === section && prev.index === index ? null : index,
          field: field
        }))}>
        {activeExample.section === section && activeExample.index === index ? 'Hide Examples' : 'Show Examples'}
      </button>
      {activeExample.section === section && activeExample.index === index && (
        <div className="examples-content">
          {(section === "workExperience" ? 
            exampleStatements.workExperience :  // Changed from responsibilities to workExperience
            section.includes('.') ? 
              exampleStatements[section.split('.')[0]][section.split('.')[1]] :
              exampleStatements[section])?.map((example, i) => (
            <button
              key={i}
              type="button"
              className="example-item"
              onClick={() => useExample(section, index, field, example)}
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderSummaryField = () => (
    <div className="form-field">
      <textarea
        className="textarea-summary"
        placeholder="Write a compelling professional summary..."
        value={formData.summary}
        onChange={(e) => {
          setFormData(prev => ({ ...prev, summary: e.target.value }));
          handleContentChange("summary", e.target.value);
        }}
        rows={4}
      />
      {renderError("summary")}
      {renderSuggestions()}
      {renderExamples("summary", 0, "summary")}
    </div>
  );

  const renderWorkExperienceEntry = (exp, index) => (
    <div key={index} className="experience-entry">
      <div className="entry-header">
        <h4>Experience {index + 1}</h4>
        <button
          type="button"
          className="remove-button"
          onClick={() => removeEntry("workExperience", index)}
        >
          ✕
        </button>
      </div>
      {renderInput("workExperience", index, "title", "Job Title")}
      {renderInput("workExperience", index, "company", "Company")}
      {renderInput("workExperience", index, "location", "Location")}
      <div className="form-row">
        {renderInput("workExperience", index, "startDate", "Start Date")}
        {renderInput("workExperience", index, "endDate", "End Date")}
      </div>
      <div className="form-field">
        <textarea
          className="textarea-responsibilities"
          placeholder="Key responsibilities and achievements..."
          value={exp.responsibilities}
          onChange={(e) => {
            handleChange("workExperience", index, "responsibilities", e.target.value);
            handleContentChange("workExperience", e.target.value);
          }}
        />
        {renderSuggestions()}
        {renderExamples("workExperience", index, "responsibilities")}
      </div>
    </div>
  );

  const steps = [
    { title: "Personal Information", section: "personalInfo" },
    { title: "Professional Summary", section: "summary" },
    { title: "Work Experience", section: "workExperience" },
    { title: "Education", section: "education" },
    { title: "Skills", section: "skills" },
    { title: "Certifications", section: "certifications" },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <section>
            <h3>Personal Information</h3>
            {renderInput("personalInfo", 0, "fullName", "Full Name")}
            {renderInput("personalInfo", 0, "email", "Email")}
            {renderInput("personalInfo", 0, "phone", "Phone Number")}
            {renderInput("personalInfo", 0, "location", "Location")}
            {renderInput("personalInfo", 0, "linkedIn", "LinkedIn URL")}
          </section>
        );
      case 2:
        return (
          <section>
            <h3>Professional Summary</h3>
            {renderSummaryField()}
          </section>
        );
      case 3:
        return (
          <section>
            <h3>Work Experience</h3>
            {formData.workExperience.map((exp, index) => renderWorkExperienceEntry(exp, index))}
            <button type="button" className="add-section-button" onClick={() => addSection("workExperience")}>
              Add Experience
            </button>
          </section>
        );
      case 4:
        return (
          <section>
            <h3>Education</h3>
            {formData.education.map((edu, index) => (
              <div key={index} className="education-entry">
                <div className="entry-header">
                  <h4>Education {index + 1}</h4>
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeEntry("education", index)}
                  >
                    ✕
                  </button>
                </div>
                {renderInput("education", index, "degree", "Degree")}
                {renderInput("education", index, "institution", "Institution")}
                {renderInput("education", index, "location", "Location")}
                {renderInput("education", index, "graduationYear", "Graduation Year")}
                {renderInput("education", index, "gpa", "GPA")}
              </div>
            ))}
            <button type="button" className="add-section-button" onClick={() => addSection("education")}>
              Add Education
            </button>
          </section>
        );
      case 5:
        return (
          <section>
            <h3>Skills</h3>
            <div className="form-field">
              <textarea
                className="textarea-skills"
                placeholder="Technical Skills (e.g., Programming Languages, Frameworks)"
                value={formData.skills.technical}
                onChange={(e) => {
                  handleChange("skills", 0, "technical", e.target.value);
                  handleContentChange("skills", e.target.value);
                }}
              />
              {renderSuggestions()}
              {renderExamples("skills.technical", 0, "technical")}
            </div>
            <div className="form-field">
              <textarea
                className="textarea-skills"
                placeholder="Soft Skills"
                value={formData.skills.softSkills}
                onChange={(e) => handleChange("skills", 0, "softSkills", e.target.value)}
              />
              {renderSuggestions()}
              {renderExamples("skills.softSkills", 0, "softSkills")}
            </div>
            <div className="form-field">
              <textarea
                className="textarea-skills"
                placeholder="Tools"
                value={formData.skills.tools}
                onChange={(e) => handleChange("skills", 0, "tools", e.target.value)}
              />
              {renderSuggestions()}
              {renderExamples("skills.tools", 0, "tools")}
            </div>
            <div className="form-field">
              <textarea
                className="textarea-skills"
                placeholder="Languages"
                value={formData.skills.languages}
                onChange={(e) => handleChange("skills", 0, "languages", e.target.value)}
              />
              {/* {renderSuggestions()}
              {renderExamples("skills.languages", 0, "languages")} */}
            </div>
          </section>
        );
      case 6:
        return (
          <section>
            <h3>Certifications</h3>
            {formData.certifications.map((cert, index) => (
              <div key={index} className="certification-entry">
                <div className="entry-header">
                  <h4>Certification {index + 1}</h4>
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeEntry("certifications", index)}
                  >
                    ✕
                  </button>
                </div>
                <div className="form-field">
                  <input
                    type="text"
                    placeholder="Certification Name"
                    value={cert.name}
                    onChange={(e) => {
                      handleChange("certifications", index, "name", e.target.value);
                      handleContentChange("certifications", e.target.value);
                    }}
                  />
                  {renderSuggestions()}
                  {renderExamples("certifications", index, "name")}
                </div>
                {renderInput("certifications", index, "issuer", "Issuer")}
                {renderInput("certifications", index, "date", "Date")}
              </div>
            ))}
            <button 
              type="button" 
              className="add-section-button"
              onClick={() => addSection("certifications")}
            >
              Add Certification
            </button>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="resume-form-container">
      <div className="form-header">
        <h2>{steps[currentStep - 1].title}</h2>
      </div>
      
      <div className="progress-steps">
        {steps.map((step, index) => (
          <div 
            key={step.section}
            className={`progress-step ${currentStep > index ? 'completed' : ''} ${index + 1 === currentStep ? 'active' : ''}`}
            onClick={() => index < currentStep && setCurrentStep(index + 1)}
          >
            {index + 1}
          </div>
        ))}
      </div>

      <form 
        className="resume-form" 
        onSubmit={(e) => {
          e.preventDefault();
          if (currentStep === steps.length) {
            handleSubmit(e);
          }
        }}
      >
        {renderStepContent()}

        <div className="form-actions">
          {currentStep > 1 && (
            <button 
              type="button" 
              className="form-button secondary" 
              onClick={handlePrevious}
            >
              Previous
            </button>
          )}
          
          {currentStep < steps.length ? (
            <button 
              type="button" 
              className="form-button primary" 
              onClick={handleNext}
            >
              Next
            </button>
          ) : (
            <button 
              type="submit" 
              className="form-button primary"
            >
              Generate Resume
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ResumeForm;
