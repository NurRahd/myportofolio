import { useEffect, useState } from 'react';
import './Footer.css';
import { Mail } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { api, imageUrl } from '../lib/api';

function resolveIconImg(filename) {
  if (!filename) return null;
  const url = imageUrl(filename);
  return url || new URL(`../assets/${filename}`, import.meta.url).href;
}

export default function Footer() {
  const [links, setLinks] = useState([]);
  const [copy, setCopy] = useState('© 2026 Rahd. All rights reserved.');

  useEffect(() => {
    api.getSocialLinks().then(setLinks).catch(console.error);
    api.getProfile().then((p) => { if (p.footer_copy) setCopy(p.footer_copy); }).catch(console.error);
  }, []);

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-links">
          {links.map((item) => {
            const LucideIcon = item.iconType === 'lucide' && item.iconName
              ? (LucideIcons[item.iconName] || Mail)
              : null;
            return (
              <div className="footer-item" key={item.id || item.platform}>
                {LucideIcon
                  ? <LucideIcon size={18} />
                  : item.iconImage
                    ? <img src={resolveIconImg(item.iconImage)} alt={item.label} className="footer-item-img" />
                    : <Mail size={18} />
                }
                <div>
                  <strong>{item.label}</strong>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer">{item.value}</a>
                  ) : (
                    <span>{item.value}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="footer-copy">{copy}</p>
      </div>
    </footer>
  );
}
