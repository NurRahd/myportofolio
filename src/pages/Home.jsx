import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, ExternalLink } from 'lucide-react';
import collage from '../assets/portfolio-collage.png';
import myFoto from '../assets/myfoto.png';
import bgHero from '../assets/bghero.png';
import ppAboutMe from '../assets/ppaboutme.JPG';
import flowerCluster from '../assets/flower-cluster.png';
import flowerStem from '../assets/flower-stem.png';
import flowerEnvelope from '../assets/flower-envelope.png';
import paperPlane from '../assets/paper-plane.png';
import crumpledPaper from '../assets/kertasrunyuk.png';
import leaveImg from '../assets/leave.png';
import logoGithub from '../assets/github.svg';
import { api, imageUrl } from '../lib/api';
import './Home.css';

function resolveImg(src) {
  if (!src) return collage;
  const url = imageUrl(src);
  return url || collage;
}

const DEFAULT_ROTATING_WORDS = [
  'Nisa',
  'a Fullstack Dev',
  'an AI Learner',
  'a UI Crafter',
  'a Problem Solver',
];

function TypeWriter({ words, typingSpeed = 90, deletingSpeed = 55, pauseMs = 1800 }) {
  const [displayed, setDisplayed] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState('typing'); // 'typing' | 'pausing' | 'deleting'
  const timeout = useRef(null);

  useEffect(() => {
    const word = words[wordIdx];

    if (phase === 'typing') {
      if (displayed.length < word.length) {
        timeout.current = setTimeout(
          () => setDisplayed(word.slice(0, displayed.length + 1)),
          typingSpeed
        );
      } else {
        timeout.current = setTimeout(() => setPhase('pausing'), pauseMs);
      }
    } else if (phase === 'pausing') {
      timeout.current = setTimeout(() => setPhase('deleting'), 0);
    } else if (phase === 'deleting') {
      if (displayed.length > 0) {
        timeout.current = setTimeout(
          () => setDisplayed(displayed.slice(0, -1)),
          deletingSpeed
        );
      } else {
        setWordIdx((i) => (i + 1) % words.length);
        setPhase('typing');
      }
    }

    return () => clearTimeout(timeout.current);
  }, [displayed, phase, wordIdx, words, typingSpeed, deletingSpeed, pauseMs]);

  return (
    <span className="typewriter-word">
      {displayed}
      <span className="typewriter-cursor" aria-hidden="true">|</span>
    </span>
  );
}

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [profile, setProfile] = useState({});

  // Parse rotating words from profile, fallback to default
  const rotatingWords = profile.hero_rotating_words
    ? profile.hero_rotating_words.split(',').map((w) => w.trim()).filter(Boolean)
    : DEFAULT_ROTATING_WORDS;

  useEffect(() => {
    api.getProjects(true).then(setFeaturedProjects).catch(console.error);
    api.getProfile().then(setProfile).catch(console.error);
  }, []);
  return (
    <div className="home-page">
      <section className="hero section-wash">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="script-label">{profile.hero_greeting || "Hello, I'm Ryn"}</p>
            <h1>I'm <TypeWriter words={rotatingWords} /></h1>
            <p className="body-copy">
              {profile.hero_subtitle || "I'm an Informatics student passionate about building modern web and mobile applications, machine learning, and creating meaningful digital experiences."}
            </p>
            <div className="hero-actions">
              <Link to="/contact" className="btn-primary">Let's Connect</Link>
              <Link to="/projects" className="btn-outline">View My Work</Link>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="hero-moon-glow" />
            <div className="hero-sparkles">
              {[...Array(18)].map((_, i) => (
                <span key={i} className="sparkle" style={{ '--i': i }} />
              ))}
            </div>
            <img src={bgHero} alt="" className="hero-photo-wash" />
            <img src={myFoto} alt="" className="hero-photo" />
            <img src={flowerCluster} alt="" className="deco-img hero-flower hero-flower-a" />
            <img src={flowerStem} alt="" className="deco-img hero-flower hero-flower-b" />
          </div>
        </div>
      </section>

      <section className="home-about section">
        <img src={leaveImg} alt="" className="deco-img home-about-leave" />
        <div className="container about-preview home-about-strip">
          <div className="about-text">
            <p className="script-label">Get to know me better.</p>
            <h2>About Me <Heart size={20} /></h2>
            <p className="body-copy">
              Informatics student passionate about building web applications, mobile experiences,
              and AI-powered solutions.
            </p>
            <Link to="/about" className="btn-outline">Learn More About Me <ArrowRight size={14} /></Link>
          </div>

          <div className="about-visual" aria-hidden="true">
            <span className="about-dashed-line" />
            <img src={crumpledPaper} alt="" className="deco-img crumpled-paper about-crumpled" />
            <div className="about-polaroid paper-photo">
              <span className="tape" />
              <img src={ppAboutMe} alt="" className="asset-crop" style={{ '--pos': '50% 44%' }} />
            </div>
            <img src={flowerCluster} alt="" className="deco-img about-strip-flower" />
          </div>
        </div>
      </section>

      <section className="home-projects section">
        <div className="container">
          <img src={flowerStem} alt="" className="deco-img projects-heading-flower" />
          <div className="section-header">
            <div>
              <h2>Featured Projects</h2>
              <p>Some of the selected projects I'm proud of.</p>
            </div>
            <Link to="/projects" className="view-all">View All Projects <ArrowRight size={15} /></Link>
          </div>

          <div className="featured-grid">
            {featuredProjects.map((project) => (
              <article className="project-card card" key={project.id}>
                <div className="project-thumb">
                  <img src={resolveImg(project.image)} alt="" className="asset-crop" style={{ '--pos': project.pos }} />
                </div>
                <div className="project-info">
                  <div className="proj-header">
                    <h3>{project.title}</h3>
                    <div className="proj-links">
                      {project.github && (
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="proj-link-icon" title="GitHub Repository">
                          <img src={logoGithub} alt="GitHub" className="proj-link-img" />
                        </a>
                      )}
                      {project.demo && (
                        <a href={project.demo} target="_blank" rel="noopener noreferrer" className="proj-link-icon" title="Live Preview">
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                  <p>{project.desc}</p>
                  <span>{project.cat}</span>
                  <div className="project-tags">
                    {project.tags.map((tag) => <span className="chip" key={tag}>{tag}</span>)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta section">
        <img src={crumpledPaper} alt="" className="deco-img crumpled-paper cta-crumpled" />
        <img src={paperPlane} alt="" className="deco-img cta-plane" />
        <img src={flowerEnvelope} alt="" className="deco-img cta-envelope" />
        <div className="container cta-inner">
          <h2>Let's Build Something Amazing Together</h2>
          <p>I'm open to collaborations, freelance projects, and full-time opportunities.</p>
          <Link to="/contact" className="btn-outline">Let's Talk</Link>
        </div>
      </section>
    </div>
  );
}
