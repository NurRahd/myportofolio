import { useEffect, useRef, useState } from 'react';
import { Mail, Send } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import ppAboutMe from '../assets/ppaboutme.JPG';
import flowerEnvelope from '../assets/flower-envelope.png';
import flowerCluster from '../assets/flower-cluster.png';
import crumpledPaper from '../assets/kertasrunyuk.png';
import { api, imageUrl } from '../lib/api';
import './Contact.css';

function resolveIconImg(filename) {
  if (!filename) return null;
  const url = imageUrl(filename);
  return url || new URL(`../assets/${filename}`, import.meta.url).href;
}

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.05 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`fade-in ${visible ? 'visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

export default function Contact() {
  const [contactInfo, setContactInfo] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSocialLinks().then(setContactInfo).catch(console.error);
  }, []);

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.sendMessage(form);
      setLoading(false);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <div className="contact-page">
      <section className="page-hero contact-hero">
        <div className="container contact-hero-inner">
          <FadeIn>
            <p className="script-label">Let's Connect</p>
            <h1 className="page-hero-title">Contact Me</h1>
            <p className="page-hero-sub">
              Have a question, project idea, or just want to say hi? I'd love to hear from you!
            </p>
          </FadeIn>
          <div className="envelope-art" aria-hidden="true">
            <img src={crumpledPaper} alt="" className="deco-img crumpled-paper contact-paper" />
            <img src={flowerEnvelope} alt="" className="deco-img contact-envelope" />
          </div>
        </div>
      </section>

      <section className="container contact-layout">
        <FadeIn>
          <div className="contact-grid">
            <div className="contact-form-section">
              <h2>Send Me a Message</h2>
              <p>Fill out the form below and I'll get back to you as soon as possible.</p>
              {sent ? (
                <div className="success-banner">
                  <strong>Message sent!</strong>
                  <span>Thanks for reaching out. I'll get back to you soon.</span>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <label>Your Name<input name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" required /></label>
                  <label>Your Email<input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" required /></label>
                  <label>Subject<input name="subject" value={form.subject} onChange={handleChange} placeholder="What is this regarding?" required /></label>
                  <label>Message<textarea name="message" value={form.message} onChange={handleChange} placeholder="Write your message here..." rows={6} required /></label>
                  {error && <p style={{ color: '#c0392b', fontSize: '0.84rem' }}>{error}</p>}
                  <button type="submit" className="btn-primary submit-btn" disabled={loading}>
                    {loading ? <span className="spinner" /> : <><Send size={15} />Send Message</>}
                  </button>
                </form>
              )}
            </div>

            <aside className="contact-info-section">
              <h2>Contact Information</h2>
              <p>You can also reach me through these channels.</p>
              <div className="info-list">
                {contactInfo.map((item) => {
                  const LucideIcon = item.iconType === 'lucide' && item.iconName
                    ? (LucideIcons[item.iconName] || Mail)
                    : null;
                  return (
                    <div className="info-item" key={item.id || item.platform}>
                      {LucideIcon
                        ? <LucideIcon size={22} />
                        : item.iconImage
                          ? <img src={resolveIconImg(item.iconImage)} alt={item.label} className="contact-info-img" style={{ width: 22, height: 22, objectFit: 'contain' }} />
                          : <Mail size={22} />
                      }
                      <div>
                        <strong>{item.label}</strong>
                        {item.href
                          ? <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}>{item.value}</a>
                          : <span>{item.value}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>
        </FadeIn>
      </section>

      <section className="work-together">
        <img src={flowerCluster} alt="" className="deco-img work-flower" />
        <div className="container wt-inner">
          <div>
            <h2>Let's Work Together</h2>
            <p>I'm open to collaborations, freelance projects, and full-time opportunities.</p>
            <a href="mailto:rahn.capt@gmail.com" className="btn-primary">Let's Talk</a>
          </div>
          <div className="wt-photo-wrap" aria-hidden="true">
            <img src={crumpledPaper} alt="" className="deco-img crumpled-paper wt-paper" />
            <div className="wt-photo paper-photo">
              <span className="tape" />
              <img src={ppAboutMe} alt="" className="asset-crop contact-page-photo" />
            </div>
            <img src={flowerCluster} alt="" className="deco-img wt-photo-flower" />
          </div>
        </div>
      </section>
    </div>
  );
}
