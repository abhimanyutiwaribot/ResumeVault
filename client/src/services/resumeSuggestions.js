export const powerVerbs = {
  leadership: [
    "Led", "Managed", "Directed", "Spearheaded", "Orchestrated",
    "Oversaw", "Supervised", "Guided", "Mentored", "Cultivated"
  ],
  technical: [
    "Developed", "Implemented", "Engineered", "Architected", "Optimized",
    "Debugged", "Automated", "Streamlined", "Designed", "Integrated"
  ],
  achievement: [
    "Achieved", "Increased", "Reduced", "Improved", "Enhanced",
    "Accelerated", "Generated", "Delivered", "Exceeded", "Maximized"
  ]
};

export const exampleStatements = {
  workExperience: [
    "Led a cross-functional team of {X} members to deliver {Y} project ahead of schedule",
    "Increased team productivity by {X}% through implementation of {Y} methodology",
    "Reduced operational costs by {X}% by optimizing {Y} processes",
    "Developed and launched {X} that resulted in {Y}% improvement in user engagement"
  ],
  summary: [
    "Innovative {role} with {X}+ years of experience in designing and implementing {technology} solutions. Proven track record of {achievement} resulting in {Y}% {improvement_metric}.",
    "Results-driven {role} professional with expertise in {technology_stack}. Successfully led {X} projects delivering {Y}% {metric} improvement through strategic {methodology} implementation.",
    "Dynamic {role} combining technical expertise in {technologies} with strong leadership abilities. Demonstrated success in {achievement}, improving {metric} by {X}%.",
    "Detail-oriented {role} specializing in {specialty_area}. Track record of delivering {outcome} through effective implementation of {methodologies}.",
    "Forward-thinking {role} with proven ability to {key_skill}. Consistently achieved {X}% {improvement} through innovative approaches to {challenge}.",
    "Experienced {role} professional with deep expertise in {industry_specific} solutions. Led cross-functional teams to deliver {X} successful projects with {Y}% {success_metric}."
  ],
  responsibilities: [
    "Led development and implementation of {feature/project}",
    "Managed a team of {X} professionals across {departments}",
    "Spearheaded initiatives resulting in {specific metric} improvement"
      ],
  skills: {
    technical: [
      "Proficient in {languages} with {X}+ years of hands-on development experience",
      "Expert in {framework} development, building {type} applications",
      "Strong background in {domain} with expertise in {specific_technologies}"
    ],
    softSkills: [
      "Strong leadership and team collaboration abilities demonstrated through {X} successful projects",
      "Excellent communication skills with experience presenting to {stakeholder_type}",
      "Problem-solving focused, consistently delivering solutions for {challenge_type}"
    ],
    tools: [
      "Advanced proficiency in {tool_names} for {specific_purpose}",
      "Experienced with {CI_tools} for continuous integration and deployment",
      "Expert in {design_tools} for UI/UX development"
    ]
  },
  education: [
    "Bachelor's in {field} with focus on {specialization}",
    "Master's in {field} - Thesis on {topic}",
    "Graduate studies in {field} with {X} GPA"
  ],
  certifications: [
    "{cert_name} - Industry standard certification in {domain}",
    "Advanced certification in {technology} from {provider}",
    "Professional {field} certification with {specialization} focus"
  ]
};

export const industryKeywords = {
  software: [
    "Agile", "Scrum", "CI/CD", "DevOps", "Cloud Computing",
    "Microservices", "RESTful APIs", "Version Control", "Test-Driven Development"
  ],
  marketing: [
    "SEO", "Content Strategy", "Marketing Analytics", "ROI",
    "Lead Generation", "Customer Acquisition", "A/B Testing"
  ],
  finance: [
    "Financial Analysis", "Risk Management", "Portfolio Management",
    "Financial Modeling", "Forecasting", "Budgeting"
  ]
};

export const summaryKeywords = {
  metrics: [
    "productivity", "efficiency", "user satisfaction",
    "system performance", "team velocity", "cost reduction",
    "revenue growth", "customer satisfaction", "market share"
  ],
  achievements: [
    "successful project deliveries",
    "system optimizations",
    "process improvements",
    "team expansions",
    "technological transformations",
    "infrastructure upgrades"
  ],
  methodologies: [
    "Agile", "Scrum", "Kanban",
    "DevOps", "CI/CD", "Test-Driven Development",
    "Lean", "Six Sigma"
  ]
};

export const fieldKeywords = {
  technical: [
    "Full-stack development", "Cloud architecture", "Database management",
    "API design", "System architecture", "Mobile development"
  ],
  tools: [
    "Version control", "Project management", "IDE", 
    "Testing frameworks", "Deployment tools", "Monitoring systems"
  ],
  softSkills: [
    "Team leadership", "Communication", "Problem-solving",
    "Project management", "Time management", "Conflict resolution"
  ],
  education: [
    "Computer Science", "Software Engineering", "Information Technology",
    "Data Science", "Artificial Intelligence", "Web Development"
  ]
};

const strengthenSummary = (summary) => {
  const suggestions = [];
  
  if (!summary.includes('%') && !summary.match(/\d+/)) {
    suggestions.push("Include specific metrics or quantifiable achievements");
  }
  
  if (!summary.match(/(expertise|experience|background) in/i)) {
    suggestions.push("Mention your expertise areas or relevant experience");
  }
  
  if (!summary.match(/(led|managed|developed|implemented|created)/i)) {
    suggestions.push("Include leadership or major project contributions");
  }
  
  if (summary.length < 100) {
    suggestions.push("Consider expanding your summary to highlight more key achievements");
  }
  
  return suggestions;
};

const strengthenFields = {
  skills: (content) => {
    const suggestions = [];
    if (!content.match(/\d+\+? years?/i)) {
      suggestions.push("Add years of experience with key technologies");
    }
    if (!content.includes(",")) {
      suggestions.push("List multiple skills separated by commas");
    }
    if (!content.match(/(proficient|expert|advanced|experienced) in/i)) {
      suggestions.push("Indicate proficiency level with skills");
    }
    return suggestions;
  },

  education: (content) => {
    const suggestions = [];
    if (!content.match(/GPA|grade|honors|distinction/i)) {
      suggestions.push("Consider adding academic achievements or GPA if notable");
    }
    if (!content.match(/(major|minor|concentration|focus|specialization) in/i)) {
      suggestions.push("Specify major/specialization if applicable");
    }
    return suggestions;
  },

  certifications: (content) => {
    const suggestions = [];
    if (!content.match(/\b(19|20)\d{2}\b/)) {
      suggestions.push("Add year of certification completion");
    }
    if (!content.match(/license|number|id/i)) {
      suggestions.push("Consider adding certification number if applicable");
    }
    return suggestions;
  }
};

export const strengthenStatement = (statement, type = 'general') => {
  if (type === 'summary') {
    return strengthenSummary(statement);
  }
  
  if (strengthenFields[type]) {
    return strengthenFields[type](statement);
  }
  
  const weakWords = ["did", "made", "worked on", "helped with", "responsible for"];
  const suggestions = [];

  // Check for weak words
  weakWords.forEach(word => {
    if (statement.toLowerCase().includes(word)) {
      suggestions.push(`Consider replacing "${word}" with a stronger action verb`);
    }
  });

  // Check for metrics
  if (!statement.match(/\d+/)) {
    suggestions.push("Add specific metrics or numbers to quantify your achievement");
  }

  // Check for action verbs
  if (!powerVerbs.leadership.some(verb => statement.includes(verb)) &&
      !powerVerbs.technical.some(verb => statement.includes(verb)) &&
      !powerVerbs.achievement.some(verb => statement.includes(verb))) {
    suggestions.push("Start with a strong action verb");
  }

  return suggestions;
};
