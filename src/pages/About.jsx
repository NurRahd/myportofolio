import { useEffect, useRef, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { X } from 'lucide-react';
import flowerStem from '../assets/flower-stem.png';
import flowerCluster from '../assets/flower-cluster.png';
import crumpledPaper from '../assets/kertasrunyuk.png';
import ppAboutMe from '../assets/ppaboutme.JPG';
import { api, imageUrl } from '../lib/api';
import Sparkles from '../components/Sparkles';
import './About.css';

// Resolve a lucide icon by string name
function LucideIcon({ name, size = 15, strokeWidth = 2.2 }) {
  const Icon = LucideIcons[name] || LucideIcons.Box;
  return <Icon size={size} strokeWidth={strokeWidth} />;
}

// Render skill icon — lucide or uploaded image
function SkillIcon({ skill }) {
  if (skill.iconType === 'image' && skill.iconImage) {
    return (
      <img
        src={resolveImg(skill.iconImage)}
        alt=""
        style={{ width: 15, height: 15, objectFit: 'contain', flexShrink: 0 }}
      />
    );
  }
  const Icon = LucideIcons[skill.iconName] || LucideIcons.Box;
  return <Icon size={15} strokeWidth={2.2} />;
}

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`fade-in ${visible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Resolve image src — supports both uploaded (UUID via Supabase) and legacy asset names
function resolveImg(src) {
  if (!src) return null;
  const url = imageUrl(src);
  if (url) return url;
  // Try to load via dynamic import (for legacy seeded filenames)
  return new URL(`../assets/${src}`, import.meta.url).href;
}

export default function About() {
  const [skillGroups, setSkillGroups] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [visibleCertificates, setVisibleCertificates] = useState(3);
  const [visibleActivities, setVisibleActivities] = useState(2);
  const [visibleExperiences, setVisibleExperiences] = useState(4);
  const [activitySlides, setActivitySlides] = useState({});
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [modalSlideIndex, setModalSlideIndex] = useState(0);

  useEffect(() => {
    Promise.all([
      api.getSkills(),
      api.getExperiences(),
      api.getEducation(),
      api.getCertificates(),
      api.getActivities(),
    ]).then(([sg, exp, edu, certs, acts]) => {
      setSkillGroups(sg);
      // Sort experiences: parse field period, terbaru di atas
      // Format period: "Feb 2026 - Present", "2024 - 2025", "2026", dll
      const parsePeriodStart = (period) => {
        if (!period) return 0;
        // Ambil bagian pertama sebelum " - "
        const part = period.split('-')[0].trim();
        // Cek apakah ada nama bulan
        const months = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
        const tokens = part.toLowerCase().split(/\s+/);
        let year = 0, month = 0;
        for (const t of tokens) {
          if (/^\d{4}$/.test(t)) year = Number(t);
          if (months[t]) month = months[t];
        }
        return year * 100 + month; // e.g. 202602, 202400
      };
      const hasPresent = (period) => /present/i.test(period);
      const sortedExp = [...exp].sort((a, b) => {
        const aPresent = hasPresent(a.period);
        const bPresent = hasPresent(b.period);
        // "Present" selalu di atas
        if (aPresent && !bPresent) return -1;
        if (!aPresent && bPresent) return 1;
        // Keduanya present atau keduanya tidak: bandingkan start date
        return parsePeriodStart(b.period) - parsePeriodStart(a.period);
      });
      setExperiences(sortedExp);
      setEducation(edu);

      const sortedCerts = [...certs].sort((a, b) => {
        const timeA = Date.parse(a.issued) || 0;
        const timeB = Date.parse(b.issued) || 0;
        return timeB - timeA;
      });
      setCertificates(sortedCerts);

      setActivities(acts);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to load data:', err);
      setLoading(false);
    });
  }, []);

  const shownCertificates = certificates.slice(0, visibleCertificates);
  const shownActivities = activities.slice(0, visibleActivities);
  const shownExperiences = experiences.slice(0, visibleExperiences);

  const moveActivitySlide = (id, length, direction) => {
    setActivitySlides((current) => {
      const active = current[id] || 0;
      return { ...current, [id]: (active + direction + length) % length };
    });
  };

  useEffect(() => {
    if (!selectedActivity) return undefined;
    document.body.style.overflow = 'hidden';
    setModalSlideIndex(0);
    const handleKeyDown = (event) => { if (event.key === 'Escape') setSelectedActivity(null); };
    window.addEventListener('keydown', handleKeyDown);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleKeyDown); };
  }, [selectedActivity]);

  if (loading) {
    return (
      <div className="about-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="about-page">
      <section className="page-hero about-hero">
        <Sparkles count={16} />
        <div className="container about-hero-inner">
          <FadeIn className="about-hero-copy">
            <p className="script-label">Get To Know Me</p>
            <h1 className="page-hero-title">Nisa Nur Rahmadani </h1>
            <p className="page-hero-sub">
              I am an informatics student who loves turning ideas into useful digital solutions.
              I enjoy learning new technologies and building products that can solve real problems.
            </p>
          </FadeIn>

          <FadeIn delay={80} className="about-hero-art" aria-hidden="true">
            <img src={crumpledPaper} alt="" className="deco-img crumpled-paper about-paper" />
            <img src={flowerStem} alt="" className="deco-img about-flower" />
            <img src={flowerCluster} alt="" className="deco-img about-flower-cluster" />
            <div className="paper-photo about-photo-card">
              <img src={ppAboutMe} alt="" />
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="container about-content">
        {/* Skills */}
        <FadeIn delay={40}>
          <section className="section-block skills-section">
            <div className="section-heading">
              <h2>Skills & Technologies</h2>
              <p>Technologies I work with.</p>
            </div>
            <div className="skill-stack">
              {skillGroups.map((group) => (
                <div className="skill-group" key={group.id}>
                  <h3>{group.title}</h3>
                  <div className="skill-chips">
                    {group.skills.map((skill) => (
                      <span className="skill-chip" key={skill.id}>
                        <SkillIcon skill={skill} />
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Experience */}
        <FadeIn delay={80}>
          <section className="section-block">
            <div className="section-heading">
              <h2>Experience</h2>
              <p>My professional journey.</p>
            </div>
            <div className="experience-timeline">
              {shownExperiences.map((item) => (
                <article className="experience-item" key={item.id}>
                  <div className="experience-brand">
                    {item.logoImage
                      ? <img src={resolveImg(item.logoImage)} alt="" />
                      : <span />}
                  </div>
                  <div className="experience-content">
                    <p className="experience-period">
                      {item.period}<span> · {item.duration}</span>
                    </p>
                    <h3>{item.title}</h3>
                    <p className="experience-institution">{item.institution}</p>
                    <ul className="experience-points">
                      {item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                    </ul>
                    <p className="experience-skills">
                      <b>Skills:</b> {item.skills.join(' · ')}
                    </p>
                  </div>
                </article>
              ))}
            </div>
            {visibleExperiences < experiences.length && (
              <div className="load-more-row">
                <button type="button" className="load-more-btn"
                  onClick={() => setVisibleExperiences((c) => Math.min(c + 4, experiences.length))}>
                  Load More Experience
                </button>
              </div>
            )}
          </section>
        </FadeIn>

        {/* Education */}
        <FadeIn delay={120}>
          <section className="section-block">
            <div className="section-heading">
              <h2>Education</h2>
              <p>My educational background.</p>
            </div>
            <div className="education-list">
              {education.map((item) => (
                <article className="education-card card" key={item.id}>
                  <div className="education-logo">
                    {item.logoImage && <img src={resolveImg(item.logoImage)} alt={item.school} />}
                  </div>
                  <div>
                    <h3>{item.school}</h3>
                    <p>{item.degree}</p>
                    <span>{item.period} | {item.score}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Certificates */}
        <FadeIn delay={160}>
          <section className="section-block certificates-section">
            <div className="section-heading">
              <h2>Certificates</h2>
              <p>Some of my achievements.</p>
            </div>
            <div className="info-card-grid three">
              {shownCertificates.map((certificate) => (
                <article className="info-card cert-detail-card card" key={certificate.id}>
                  <div className="cert-image">
                    {certificate.image && (
                      <img
                        src={resolveImg(certificate.image)}
                        alt=""
                        className="asset-crop"
                        style={{
                          '--pos': certificate.imagePos,
                          '--fit': certificate.imageFit,
                          '--zoom': certificate.imageZoom || 1,
                        }}
                      />
                    )}
                  </div>
                  <div className="cert-body">
                    <h3>{certificate.name}</h3>
                    <p>{certificate.issuer}</p>
                    <span>Certificate ID: {certificate.certificateId}</span>
                    <span>{certificate.issued}</span>
                    <span>{certificate.expires}</span>
                    {certificate.file && (
                      <a href={certificate.file} target="_blank" className="certificate-link" rel="noreferrer">
                        Open certificate
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
            {visibleCertificates < certificates.length && (
              <div className="load-more-row">
                <button type="button" className="load-more-btn"
                  onClick={() => setVisibleCertificates((c) => Math.min(c + 3, certificates.length))}>
                  Load More Certificates
                </button>
              </div>
            )}
          </section>
        </FadeIn>

        {/* Activities */}
        <FadeIn delay={200}>
          <section className="section-block">
            <div className="section-heading">
              <h2>Activities</h2>
              <p>Organizations and activities I've been part of.</p>
            </div>
            <div className="info-card-grid">
              {shownActivities.map((activity) => (
                <article
                  className="activity-article-card card"
                  key={activity.id}
                  onClick={() => setSelectedActivity(activity)}
                >
                  <div className="activity-image">
                    {activity.images.map((image, index) => (
                      <img
                        key={image.id}
                        src={resolveImg(image.src)}
                        alt=""
                        className={`activity-slide ${index === (activitySlides[activity.id] || 0) ? 'active' : ''}`}
                        style={{ '--pos': image.pos }}
                      />
                    ))}
                    {activity.images.length > 1 && (
                      <>
                        <button type="button" className="activity-nav prev"
                          aria-label="Previous activity image"
                          onClick={(e) => { e.stopPropagation(); moveActivitySlide(activity.id, activity.images.length, -1); }}>
                          {'<'}
                        </button>
                        <button type="button" className="activity-nav next"
                          aria-label="Next activity image"
                          onClick={(e) => { e.stopPropagation(); moveActivitySlide(activity.id, activity.images.length, 1); }}>
                          {'>'}
                        </button>
                        <div className="activity-dots" onClick={(e) => e.stopPropagation()}>
                          {activity.images.map((image, index) => (
                            <button type="button" key={image.id}
                              className={index === (activitySlides[activity.id] || 0) ? 'active' : ''}
                              aria-label={`Show image ${index + 1}`}
                              onClick={() => setActivitySlides((c) => ({ ...c, [activity.id]: index }))} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="activity-body">
                    <p className="activity-date">{activity.date}</p>
                    <h3>{activity.title}</h3>
                    <p className="activity-desc">{activity.description}</p>
                    <div className="activity-tags">
                      {activity.tags.map((tag) => <span className="chip" key={tag}>{tag}</span>)}
                    </div>
                    <a href="#activity-detail" className="read-more-link"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedActivity(activity); }}>
                      Read more
                    </a>
                  </div>
                </article>
              ))}
            </div>
            {visibleActivities < activities.length && (
              <div className="load-more-row">
                <button type="button" className="load-more-btn"
                  onClick={() => setVisibleActivities((c) => Math.min(c + 2, activities.length))}>
                  Load More Activities
                </button>
              </div>
            )}
          </section>
        </FadeIn>
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="modal-overlay" onClick={() => setSelectedActivity(null)}
          role="dialog" aria-modal="true" aria-labelledby="activity-modal-title">
          <div className="modal-content modal-content--activity" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedActivity(null)} aria-label="Close modal">
              <X size={20} />
            </button>
            <div className="modal-body-layout">
              {/* Gambar kiri — portrait tampil penuh */}
              <div className="activity-modal-img-wrap">
                <img
                  className="activity-modal-img"
                  src={resolveImg(selectedActivity.images[modalSlideIndex]?.src)}
                  alt=""
                />
                {selectedActivity.images.length > 1 && (
                  <>
                    <button type="button" className="activity-nav prev" aria-label="Previous image"
                      onClick={() => setModalSlideIndex((p) => (p - 1 + selectedActivity.images.length) % selectedActivity.images.length)}>
                      {'<'}
                    </button>
                    <button type="button" className="activity-nav next" aria-label="Next image"
                      onClick={() => setModalSlideIndex((p) => (p + 1) % selectedActivity.images.length)}>
                      {'>'}
                    </button>
                    <div className="activity-dots">
                      {selectedActivity.images.map((image, index) => (
                        <button type="button" key={image.id}
                          className={index === modalSlideIndex ? 'active' : ''}
                          aria-label={`Show image ${index + 1}`}
                          onClick={() => setModalSlideIndex(index)} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Teks kanan */}
              <div className="modal-text-content">
                <span className="modal-category script-label">Activity Detail</span>
                <span className="activity-date modal-date">{selectedActivity.date}</span>
                <h2 id="activity-modal-title" className="modal-title">{selectedActivity.title}</h2>
                <p className="modal-long-desc">{selectedActivity.longDesc}</p>
                <div className="modal-section">
                  <h4>Key Details & Achievements</h4>
                  <ul className="modal-features-list">
                    {selectedActivity.details.map((detail) => <li key={detail}>{detail}</li>)}
                  </ul>
                </div>
                <div className="modal-section">
                  <h4>Tags</h4>
                  <div className="modal-tags">
                    {selectedActivity.tags.map((tag) => <span className="chip" key={tag}>{tag}</span>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
