import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { getTheme, toggleTheme } from '../lib/theme.js';
import './Navbar.css';

const links = ['Home', 'About', 'Projects', 'Contact'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getTheme);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const isActive = (link) => {
    const path = link === 'Home' ? '/' : `/${link.toLowerCase()}`;
    return location.pathname === path;
  };

  const handleToggle = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">Rahd.</Link>
        <ul className={`navbar-links${menuOpen ? ' open' : ''}`}>
          {links.map(l => (
            <li key={l}>
              <Link
                to={l === 'Home' ? '/' : `/${l.toLowerCase()}`}
                className={isActive(l) ? 'active' : ''}
              >{l}</Link>
            </li>
          ))}
        </ul>
        <div className="navbar-right">
          <button
            className="theme-toggle"
            onClick={handleToggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
          </button>
        </div>
        <button className={`menu-toggle${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
          <span/><span/><span/>
        </button>
      </div>
    </nav>
  );
}
