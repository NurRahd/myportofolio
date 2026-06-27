import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, X } from 'lucide-react';
import collage from '../assets/portfolio-collage.png';
import flowerStem from '../assets/flower-stem.png';
import flowerEnvelope from '../assets/flower-envelope.png';
import crumpledPaper from '../assets/kertasrunyuk.png';
import logoGithub from '../assets/github.svg';
import { api, imageUrl } from '../lib/api';
import Sparkles from '../components/Sparkles';
import './Projects.css';

const categories = ['All', 'Web Development', 'Mobile Development', 'Machine Learning', 'Other'];

function resolveImg(src) {
  if (!src) return collage;
  const url = imageUrl(src);
  return url || collage;
}

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.05 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`fade-in ${visible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalSlide, setModalSlide] = useState(0);

  useEffect(() => {
    api.getProjects().then((data) => {
      setProjects(data);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const visibleProjects = active === 'All'
    ? projects
    : projects.filter((p) => p.cat === active);

  const openModal = (project) => {
    setSelectedProject(project);
    setModalSlide(0);
  };

  useEffect(() => {
    if (!selectedProject) return undefined;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedProject(null);
      if (e.key === 'ArrowRight') setModalSlide((p) => (p + 1) % Math.max(1, selectedProject.images?.length || 1));
      if (e.key === 'ArrowLeft') setModalSlide((p) => (p - 1 + Math.max(1, selectedProject.images?.length || 1)) % Math.max(1, selectedProject.images?.length || 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleKeyDown); };
  }, [selectedProject]);

  // Resolve images array — support both old single image and new images[]
  const getImages = (project) => {
    if (project.images && project.images.length > 0) return project.images;
    if (project.image) return [{ id: 0, src: project.image, pos: project.pos }];
    return [];
  };

  return (
    <div className="projects-page">
      <section className="page-hero projects-hero">
        <img src={crumpledPaper} alt="" className="deco-img crumpled-paper projects-paper" />
        <img src={flowerStem} alt="" className="deco-img projects-hero-flower" />
        <div className="container">
          <FadeIn>
            <p className="script-label">What I've Built</p>
            <h1 className="page-hero-title">My Projects</h1>
            <p className="page-hero-sub">
              A collection of things I've built with passion and dedication. Each project taught me
              something new and pushed me to grow.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="container projects-content">
        <FadeIn>
          <div className="filter-tabs" role="tablist" aria-label="Project categories">
            {categories.map((category) => (
              <button key={category} type="button"
                className={`filter-tab ${active === category ? 'active' : ''}`}
                onClick={() => setActive(category)}>
                {category}
              </button>
            ))}
          </div>
        </FadeIn>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Loading...</div>
        ) : (
          <div className="projects-grid">
            {visibleProjects.map((project, index) => (
              <FadeIn key={project.id} delay={index * 35} className="project-item-wrap">
                <article className="proj-card card" onClick={() => openModal(project)}>
                  <div className="proj-thumb">
                    <img
                      src={resolveImg(project.images?.[0]?.src || project.image)}
                      alt=""
                      className="asset-crop"
                      style={{ '--pos': project.images?.[0]?.pos || project.pos }}
                    />
                  </div>
                  <div className="proj-body">
                    <div className="proj-header">
                      <h3>{project.title}</h3>
                      <div className="proj-links" onClick={(e) => e.stopPropagation()}>
                        {project.github && (
                          <a href={project.github} target="_blank" rel="noopener noreferrer"
                            className="proj-link-icon" title="GitHub Repository">
                            <img src={logoGithub} alt="GitHub" className="proj-link-img" />
                          </a>
                        )}
                        {project.demo && (
                          <a href={project.demo} target="_blank" rel="noopener noreferrer"
                            className="proj-link-icon" title="Live Preview">
                            <ExternalLink size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                    <p>{project.desc}</p>
                    <div className="proj-tags">
                      {project.tags.map((tag) => <span className="chip" key={tag}>{tag}</span>)}
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      <section className="projects-cta">
        <img src={flowerEnvelope} alt="" className="deco-img projects-cta-envelope" />
        <div className="container cta-box card">
          <div>
            <h2>Have an idea in mind?</h2>
            <p>Let's build something amazing together.</p>
          </div>
          <Link to="/contact" className="btn-outline">Let's Talk</Link>
        </div>
      </section>

      {selectedProject && (() => {
        const imgs = getImages(selectedProject);
        const cur = imgs[modalSlide] || imgs[0];
        return (
          <div className="modal-overlay" onClick={() => setSelectedProject(null)}
            role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-content modal-content--activity" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedProject(null)} aria-label="Close modal">
                <X size={20} />
              </button>
              <div className="modal-body-layout">
                {/* Gambar kiri dengan slideshow */}
                <div className="activity-modal-img-wrap">
                  <img
                    className="activity-modal-img"
                    src={resolveImg(cur?.src)}
                    alt=""
                  />
                  {imgs.length > 1 && (
                    <>
                      <button type="button" className="activity-nav prev" aria-label="Previous image"
                        onClick={() => setModalSlide((p) => (p - 1 + imgs.length) % imgs.length)}>
                        {'<'}
                      </button>
                      <button type="button" className="activity-nav next" aria-label="Next image"
                        onClick={() => setModalSlide((p) => (p + 1) % imgs.length)}>
                        {'>'}
                      </button>
                      <div className="activity-dots">
                        {imgs.map((_, i) => (
                          <button type="button" key={i}
                            className={i === modalSlide ? 'active' : ''}
                            aria-label={`Show image ${i + 1}`}
                            onClick={() => setModalSlide(i)} />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Teks kanan */}
                <div className="modal-text-content">
                  <span className="modal-category script-label">{selectedProject.cat}</span>
                  <h2 id="modal-title" className="modal-title">{selectedProject.title}</h2>
                  <p className="modal-long-desc">{selectedProject.longDesc}</p>
                  <div className="modal-section">
                    <h4>Key Features</h4>
                    <ul className="modal-features-list">
                      {selectedProject.features.map((feature, i) => <li key={i}>{feature}</li>)}
                    </ul>
                  </div>
                  <div className="modal-section">
                    <h4>Technologies Used</h4>
                    <div className="modal-tags">
                      {selectedProject.tags.map((tag) => <span className="chip" key={tag}>{tag}</span>)}
                    </div>
                  </div>
                  <div className="modal-actions">
                    {selectedProject.github && (
                      <a href={selectedProject.github} target="_blank" rel="noopener noreferrer" className="btn-primary">
                        <img src={logoGithub} alt="" className="btn-icon-img" />
                        <span>View Repository</span>
                      </a>
                    )}
                    {selectedProject.demo && (
                      <a href={selectedProject.demo} target="_blank" rel="noopener noreferrer" className="btn-outline">
                        <ExternalLink size={16} /><span>Live Preview</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
