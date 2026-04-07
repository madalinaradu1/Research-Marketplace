import React from 'react';

const linkStyle = {
  color: 'rgba(255,255,255,0.72)',
  textDecoration: 'none',
  fontSize: '0.78rem',
  whiteSpace: 'nowrap',
  transition: 'color 0.15s',
};

const socialLinks = [
  {
    href: 'https://www.facebook.com/GrandCanyonU/',
    label: 'Facebook',
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    href: 'https://x.com/gcu',
    label: 'X',
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: 'https://www.linkedin.com/school/grand-canyon-university/',
    label: 'LinkedIn',
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    href: 'https://www.instagram.com/gcu/',
    label: 'Instagram',
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    href: 'https://www.youtube.com/user/gcu',
    label: 'YouTube',
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#050505" />
      </svg>
    ),
  },
];

const navLinks = [
  { href: 'https://www.gcu.edu/privacy-policy', label: 'Privacy Policy' },
  { href: 'https://www.gcu.edu/about/contact', label: 'Contact' },
  { href: 'https://www.gcu.edu/academics/academic-policies/title-ix.php', label: 'Title IX' },
  { href: 'https://www.gcu.edu/academics/calendar', label: 'Academic Calendar' },
  { href: 'https://students.gcu.edu/', label: 'Current Students' },
  { href: 'https://ssc.gcu.edu/#', label: 'Student Success Center' },
  { href: 'https://library.gcu.edu/', label: 'Library' },
  { href: 'https://students.gcu.edu/student-resources.php', label: 'Student Resources' },
];

const Footer = () => (
  <footer style={{ backgroundColor: '#050505', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap',
      minHeight: '56px',
    }}>
      {/* Left: logo + copyright */}
<div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
  <img src="/GCU_WHITE.png" alt="GCU Logo" style={{ height: '28px', objectFit: 'contain' }} />
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
      © 2026 Grand Canyon University
    </span>
    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
      3300 W Camelback Rd, Phoenix, AZ 85017
    </span>
  </div>
</div>


      {/* Center: nav links */}
      <nav aria-label="Footer navigation" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {navLinks.map(({ href, label }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.72)'}
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Right: social icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexShrink: 0 }}>
        {socialLinks.map(({ href, label, svg }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer"
            aria-label={label}
            style={{ color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
          >
            {svg}
          </a>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
