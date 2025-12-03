import { useCallback, useEffect, useState } from "react";
import matter from "gray-matter";
import { Buffer } from "buffer";

if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = Buffer;
}

const RESUME_PATH = `${import.meta.env.BASE_URL}resume.md`;

const emptyResume = {
  name: "",
  title: "",
  location: "",
  email: "",
  phone: "",
  linkedin: "",
  github: "",
  summary: [],
  "professional experiences": [],
  "skills and knowledge": {},
  "online cerfification": [],
  projects: [],
  education: [],
  languages: "",
  skillCategories: [],
};

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

const normalizeResume = (data = {}) => {
  const experienceSource =
    data.experience ||
    data.experiences ||
    data["professional experiences"] ||
    data.professional_experiences;

  const mapExperience = normalizeList(experienceSource).map((item, idx) => ({
    id: `${item.company || "exp"}-${idx}`,
    role: item.role || "",
    company: item.company || "",
    start: item.start || "",
    end: item.end || "",
    details: normalizeList(item.details || item.bullets || []),
  }));

  const mapEducation = normalizeList(data.education).map((item, idx) => ({
    id: `${item.school || "edu"}-${idx}`,
    school: item.school || "",
    degree: item.name || item.degree || "",
    start: item.start || "",
    end: item.end || "",
    details: item.details || "",
  }));

  const mapProjects = normalizeList(data.projects).map((item, idx) => {
    const projectNamesRaw = normalizeList(item["project-name"] || []);
    // Convert project-name array (which may contain objects) to formatted strings
    const subProjects = projectNamesRaw
      .map((subItem) => {
        if (typeof subItem === "string") {
          return subItem;
        }
        // If it's an object like { "Title": "Description" }
        const keys = Object.keys(subItem);
        if (keys.length > 0) {
          const key = keys[0];
          return `${key}: ${subItem[key]}`;
        }
        return "";
      })
      .filter(Boolean);

    return {
      id: `${item.name || "proj"}-${idx}`,
      name: item.name || "",
      link: item.link || item.url || "",
      summary: item.summary || "",
      subProjects: subProjects,
    };
  });

  const links = [];
  if (data.linkedin) {
    links.push({
      id: "linkedin",
      label: "LinkedIn",
      url: data.linkedin.startsWith("http")
        ? data.linkedin
        : `https://${data.linkedin}`,
    });
  }
  if (data.github) {
    links.push({
      id: "github",
      label: "GitHub",
      url: data.github.startsWith("http")
        ? data.github
        : `https://${data.github}`,
    });
  }

  // Handle skills - preserve category structure
  const skillsData =
    data["skills and knowledge"] ||
    data.skills ||
    data.skillCategories ||
    data["skills & knowledge"] ||
    {};
  const skillCategories = [];
  Object.keys(skillsData).forEach((category) => {
    const categoryValue = skillsData[category];
    const skills = normalizeList(categoryValue);
    if (skills.length > 0) {
      skillCategories.push({
        name: category,
        skills: skills,
      });
    }
  });

  // Handle summary - convert array to string
  const summaryText = Array.isArray(data.summary)
    ? data.summary.join(" ")
    : data.summary || "";

  // Handle certifications
  const certifications = normalizeList(
    data.certifications ||
      data["online cerfification"] ||
      data["online certification"]
  ).map((item) =>
    typeof item === "string" ? item : item.name || item.title || ""
  );

  return {
    name: data.name || "",
    title: data.title || "",
    location: data.location || "",
    email: data.email || "",
    phone: data.phone || "",
    linkedin: data.linkedin || "",
    github: data.github || "",
    summary: summaryText,
    links,
    skillCategories,
    certifications: certifications.filter(Boolean),
    experience: mapExperience,
    projects: mapProjects,
    education: mapEducation,
    languages: data.languages || "",
  };
};

const ContactLine = ({ resume }) => {
  const items = [];

  if (resume.location) {
    items.push({ type: "location", value: resume.location, link: null });
  }
  if (resume.email) {
    items.push({
      type: "email",
      value: resume.email,
      link: `mailto:${resume.email}`,
    });
  }
  if (resume.phone) {
    // Format phone for WhatsApp (remove spaces, +, and hyphens)
    const whatsappNumber = resume.phone.replace(/[\s+\-()]/g, "");
    items.push({
      type: "phone",
      value: resume.phone,
      link: `https://wa.me/${whatsappNumber}`,
    });
  }

  return (
    <div className="contact">
      {items.map((item, idx) =>
        item.link ? (
          <a
            key={`contact-${idx}`}
            href={item.link}
            target="_blank"
            rel="noreferrer"
          >
            <span>{item.value}</span>
          </a>
        ) : (
          <span key={`contact-${idx}`}>{item.value}</span>
        )
      )}
    </div>
  );
};

const ContactLinePdf = ({ resume }) => {
  const items = [resume.location, resume.email, resume.phone].filter(Boolean);
  return <p className="contact-pdf">{items.join(" | ")}</p>;
};

const LinksLine = ({ links }) =>
  links && links.length ? (
    <div className="chip-row">
      {links.map((link) => (
        <a
          key={link.id}
          className="link-pill"
          href={link.url}
          target="_blank"
          rel="noreferrer"
        >
          {link.label || link.url}
        </a>
      ))}
    </div>
  ) : null;

const WebResume = ({ resume }) => (
  <div className="resume-container">
    {/* Hero Section */}
    <section className="hero-section">
      <div className="hero-content">
        <img src="/profile.png" alt={resume.name} className="profile-image" />
        <div className="hero-text">
          <h1>{resume.name || "Your name"}</h1>
          <p className="title-text">{resume.title || "Your title"}</p>
          <ContactLine resume={resume} />
          <LinksLine links={resume.links} />
          <button className="download-btn" onClick={() => window.print()}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download Resume
          </button>
        </div>
      </div>
    </section>

    {/* Summary Section */}
    <section className="section summary-section">
      <h2 className="section-title">About</h2>
      <p className="section-text">
        {resume.summary || "Add a short summary in resume.md"}
      </p>
    </section>

    {/* Skills Section */}
    {resume.skillCategories && resume.skillCategories.length > 0 && (
      <section className="section skills-section">
        <h2 className="section-title">Skills & Knowledge</h2>
        {resume.skillCategories.map((category, catIdx) => (
          <div className="skill-category" key={`cat-${catIdx}`}>
            <h3 className="skill-category-title">{category.name}</h3>
            <div className="skills-grid">
              {category.skills.map((skill, idx) => (
                <span className="skill-tag" key={`skill-${catIdx}-${idx}`}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>
    )}

    {/* Experience Section */}
    {resume.experience && resume.experience.length > 0 && (
      <section className="section experience-section">
        <h2 className="section-title">Experience</h2>
        <div className="timeline">
          {resume.experience.map((exp) => (
            <div className="timeline-item" key={exp.id}>
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="experience-header">
                  <h3>{exp.role || "Role"}</h3>
                  <span className="company-badge">
                    {exp.company || "Company"}
                  </span>
                </div>
                <div className="experience-meta">
                  {(exp.start || exp.end) && (
                    <span>
                      {[exp.start, exp.end].filter(Boolean).join(" → ")}
                    </span>
                  )}
                </div>
                {exp.details && exp.details.length > 0 && (
                  <ul className="experience-details">
                    {exp.details.map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Projects Section */}
    {resume.projects && resume.projects.length > 0 && (
      <section className="section projects-section">
        <h2 className="section-title">Projects</h2>
        <div className="projects-grid">
          {resume.projects.map((proj) => (
            <div className="project-card" key={proj.id}>
              <h3>
                {proj.name || "Project"}
                {proj.link && (
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noreferrer"
                    className="project-link"
                  >
                    ↗
                  </a>
                )}
              </h3>
              <p>{proj.summary || "Project summary"}</p>
              {proj.subProjects && proj.subProjects.length > 0 && (
                <ul className="project-sub-list">
                  {proj.subProjects.map((subProj, idx) => (
                    <li key={idx}>{subProj}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Education Section */}
    {resume.education && resume.education.length > 0 && (
      <section className="section education-section">
        <h2 className="section-title">Education</h2>
        <div className="education-list">
          {resume.education.map((edu) => (
            <div className="education-item" key={edu.id}>
              <h3>{edu.degree || "Program"}</h3>
              <p className="school-name">{edu.school || "School"}</p>
              <div className="education-meta">
                {(edu.start || edu.end) && (
                  <span>
                    {[edu.start, edu.end].filter(Boolean).join(" – ")}
                  </span>
                )}
              </div>
              {edu.details && (
                <p className="education-details">{edu.details}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Certifications Section */}
    {resume.certifications && resume.certifications.length > 0 && (
      <section className="section certifications-section">
        <h2 className="section-title">Certifications</h2>
        <ul className="certifications-list">
          {resume.certifications.map((cert, idx) => (
            <li key={idx}>{cert}</li>
          ))}
        </ul>
      </section>
    )}

    {/* Languages Section */}
    {resume.languages && (
      <section className="section languages-section">
        <h2 className="section-title">Languages</h2>
        <p className="section-text">{resume.languages}</p>
      </section>
    )}
  </div>
);

const PdfResume = ({ resume }) => (
  <div className="pdf-sheet resume-shell">
    <div className="header pdf-header">
      <img src="/profile.png" alt={resume.name} className="profile-image-pdf" />
      <div className="name-block">
        <h1>{resume.name || "Your name"}</h1>
        <p className="pdf-title">{resume.title || "Your title"}</p>
        <ContactLinePdf resume={resume} />
        {resume.links && resume.links.length > 0 && (
          <p className="links-pdf">
            {resume.links.map((link, idx) => (
              <span key={link.id}>
                {link.url}
                {idx < resume.links.length - 1 ? " | " : ""}
              </span>
            ))}
          </p>
        )}
      </div>
    </div>

    <div className="section">
      <h3>Summary</h3>
      <p>{resume.summary || "Add a short summary in resume.md"}</p>
    </div>

    {resume.experience && resume.experience.length > 0 && (
      <div className="section">
        <h3>Experience</h3>
        {resume.experience.map((exp) => (
          <div className="item" key={exp.id}>
            <div className="item-header">
              <h4>{exp.role || "Role"}</h4>
              <span className="date-range">
                {[exp.start, exp.end].filter(Boolean).join(" - ")}
              </span>
            </div>
            <p className="company">{exp.company || "Company"}</p>
            {exp.details && exp.details.length > 0 && (
              <ul className="pdf-bullets">
                {exp.details.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    )}

    {resume.projects && resume.projects.length > 0 && (
      <div className="section">
        <h3>Projects</h3>
        {resume.projects.map((proj) => (
          <div className="item" key={proj.id}>
            <h4>
              {proj.name || "Project"}{" "}
              {proj.link && <span className="muted">· {proj.link}</span>}
            </h4>
            <p>{proj.summary || "Project summary"}</p>
            {proj.subProjects && proj.subProjects.length > 0 && (
              <ul>
                {proj.subProjects.map((subProj, idx) => (
                  <li key={idx}>{subProj}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    )}

    {resume.skillCategories && resume.skillCategories.length > 0 && (
      <div className="section">
        <h3>Skills & Knowledge</h3>
        {resume.skillCategories.map((category, catIdx) => (
          <div className="skill-category-pdf" key={`cat-pdf-${catIdx}`}>
            <h4>{category.name}</h4>
            <div className="tags">
              {category.skills.map((skill, idx) => (
                <span className="tag" key={`skill-pdf-${catIdx}-${idx}`}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}

    {resume.education && resume.education.length > 0 && (
      <div className="section">
        <h3>Education</h3>
        {resume.education.map((edu) => (
          <div className="item" key={edu.id}>
            <h4>
              {edu.school || "School"} — {edu.degree || "Program"}
            </h4>
            <div className="meta">
              {(edu.start || edu.end) && (
                <span>{[edu.start, edu.end].filter(Boolean).join(" · ")}</span>
              )}
            </div>
            {edu.details && <p>{edu.details}</p>}
          </div>
        ))}
      </div>
    )}

    {resume.certifications && resume.certifications.length > 0 && (
      <div className="section">
        <h3>Certifications</h3>
        <ul>
          {resume.certifications.map((cert, idx) => (
            <li key={idx}>{cert}</li>
          ))}
        </ul>
      </div>
    )}

    {resume.languages && (
      <div className="section">
        <h3>Languages</h3>
        <p>{resume.languages}</p>
      </div>
    )}
  </div>
);

function App() {
  const [resume, setResume] = useState(emptyResume);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");

  const loadResume = useCallback(async () => {
    try {
      setStatus("loading");
      setError("");
      const res = await fetch(RESUME_PATH, { cache: "no-cache" });
      if (!res.ok) {
        throw new Error(`Failed to fetch resume.md (${res.status})`);
      }
      const text = await res.text();
      const parsed = matter(text);
      const normalized = normalizeResume(parsed.data);
      setResume(normalized);
      setStatus("ready");
    } catch (err) {
      setError(err.message || "Unable to load resume.md");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  return (
    <div className="app">
      {status === "loading" && (
        <div className="loading-state">Loading resume…</div>
      )}
      {status === "error" && <div className="error-box">Error: {error}</div>}
      {status === "ready" && (
        <>
          <div className="web-view">
            <WebResume resume={resume} />
          </div>
          <div className="print-view">
            <PdfResume resume={resume} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
