const { useState, useEffect, useMemo } = React;
const html = htm.bind(React.createElement);
function getContactApiBaseUrl() {
  if (window.CONTACT_API_BASE_URL) {
    return window.CONTACT_API_BASE_URL;
  }

  if (window.location.protocol === 'file:') {
    return 'http://localhost:5000';
  }

  return window.location.origin;
}

const CONTACT_API_BASE_URL = getContactApiBaseUrl();

const sectionThemes = {
  hero: {
    name: 'theme-hero',
    background: 'radial-gradient(circle at 20% 20%, rgba(255, 132, 105, 0.34), transparent 34%), radial-gradient(circle at 80% 20%, rgba(255, 214, 102, 0.28), transparent 30%), linear-gradient(135deg, #120c1c 0%, #1c1333 45%, #0e1626 100%)',
    glow: '#ffb36b',
    accent: '#ff7a59'
  },
  about: {
    name: 'theme-about',
    background: 'radial-gradient(circle at 18% 30%, rgba(117, 255, 214, 0.24), transparent 36%), radial-gradient(circle at 82% 25%, rgba(90, 140, 255, 0.24), transparent 30%), linear-gradient(135deg, #071b23 0%, #102436 50%, #09111b 100%)',
    glow: '#73f5d2',
    accent: '#62d0ff'
  },
  skills: {
    name: 'theme-skills',
    background: 'radial-gradient(circle at 20% 20%, rgba(97, 218, 251, 0.26), transparent 36%), radial-gradient(circle at 78% 24%, rgba(0, 255, 163, 0.18), transparent 28%), linear-gradient(135deg, #071420 0%, #0d2233 50%, #09111b 100%)',
    glow: '#61dafb',
    accent: '#1de9b6'
  },
  projects: {
    name: 'theme-projects',
    background: 'radial-gradient(circle at 22% 20%, rgba(255, 107, 138, 0.26), transparent 34%), radial-gradient(circle at 80% 20%, rgba(255, 180, 92, 0.22), transparent 28%), linear-gradient(135deg, #190d17 0%, #281225 50%, #120d1d 100%)',
    glow: '#ff8da1',
    accent: '#ffb45c'
  },
  contact: {
    name: 'theme-contact',
    background: 'radial-gradient(circle at 18% 22%, rgba(173, 129, 255, 0.28), transparent 34%), radial-gradient(circle at 80% 20%, rgba(102, 224, 255, 0.2), transparent 30%), linear-gradient(135deg, #120f26 0%, #1e1638 45%, #0d1523 100%)',
    glow: '#b794ff',
    accent: '#66e0ff'
  }
};

function revealElements() {
  const elements = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  elements.forEach((element, index) => {
    element.style.setProperty('--reveal-delay', `${Math.min(index * 0.06, 0.45)}s`);
    observer.observe(element);
  });

  return observer;
}

function useInteractiveEffects() {
  useEffect(() => {
    const body = document.body;
    const themeNames = Object.values(sectionThemes).map((theme) => theme.name);

    const applyTheme = (key) => {
      const theme = sectionThemes[key] || sectionThemes.hero;
      themeNames.forEach((name) => body.classList.remove(name));
      body.classList.add(theme.name);
      body.style.setProperty('--page-background', theme.background);
      body.style.setProperty('--glow-color', theme.glow);
      body.style.setProperty('--accent-highlight', theme.accent);
    };

    applyTheme('hero');

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          applyTheme(entry.target.id);
        }
      });
    }, { threshold: 0.45 });

    Object.keys(sectionThemes).forEach((id) => {
      const sectionEl = document.getElementById(id);
      if (sectionEl) {
        sectionObserver.observe(sectionEl);
      }
    });

    const handleScroll = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
      body.style.setProperty('--scroll-progress', progress.toFixed(4));
      body.style.setProperty('--bg-shift', `${progress * 360}deg`);
      body.style.setProperty('--orb-shift', `${progress * 120}px`);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    const revealObserver = revealElements();

    return () => {
      sectionObserver.disconnect();
      revealObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const links = [
    ['hero', 'Home'],
    ['about', 'About'],
    ['skills', 'Skills'],
    ['projects', 'Projects'],
    ['contact', 'Contact']
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return html`
    <nav>
      <div className="nav-container">
        <button className="logo" onClick=${() => scrollToSection('hero')} aria-label="Go to home section">SND</button>
        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded=${isMenuOpen}
          onClick=${() => setIsMenuOpen((value) => !value)}
        >
          <i className=${`fas ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
        <ul className=${isMenuOpen ? 'nav-links open' : 'nav-links'}>
          ${links.map(([id, label]) => html`
            <li key=${id}>
              <button className="nav-link" onClick=${() => scrollToSection(id)}>${label}</button>
            </li>
          `)}
        </ul>
      </div>
    </nav>
  `;
}

function Hero() {
  const downloadResume = () => {
    const link = document.createElement('a');
    link.href = new URL('../Satya_Narayan_Dhar_Resume.pdf', window.location.href).href;
    link.download = 'Satya_Narayan_Dhar_Resume.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return html`
    <section className="hero section-shell" id="hero">
      <div className="hero-grid"></div>
      <div className="hero-orb hero-orb-one"></div>
      <div className="hero-orb hero-orb-two"></div>
      <div className="hero-content" data-reveal>
        <p className="eyebrow">Full Stack Developer - MERN Specialist - Problem Solver</p>
        <h1>
          <span className="title-line title-line-top">Building bold,</span>
          <span className="title-line title-line-bottom">animated web experiences.</span>
        </h1>
        <p className="hero-lead">
          I design and build polished products with smooth interactions, clean structure, and a strong focus on user experience.
        </p>
        <div className="hero-metrics">
          <div className="metric-pill" data-reveal>
            <strong>2+</strong>
            <span>Years building full-stack apps</span>
          </div>
          <div className="metric-pill" data-reveal>
            <strong>10+</strong>
            <span>Projects explored and shipped</span>
          </div>
        </div>
        <div className="cta-buttons" data-reveal>
          <button className="btn btn-primary" onClick=${downloadResume}>
            <i className="fas fa-download"></i> Download Resume
          </button>
          <button className="btn btn-secondary" onClick=${() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>
            <i className="fas fa-folder-open"></i> View My Work
          </button>
        </div>
      </div>
    </section>
  `;
}

function About() {
  return html`
    <section className="about section-shell" id="about">
      <div className="section-heading" data-reveal>
        <p className="section-kicker">About</p>
        <h2 className="section-title">Design-driven development with a builder mindset</h2>
      </div>
      <div className="about-content">
        <div className="about-text glass-panel" data-reveal>
          <h3>Passionate developer and curious technologist</h3>
          <p>I am a full-stack developer with hands-on experience building responsive, scalable web applications that feel intuitive from the first interaction.</p>
          <p>My core stack includes JavaScript, React, Node.js, Express, and MongoDB, and I enjoy turning ideas into interfaces that are both clean and lively.</p>
          <p>Outside of coding, I keep exploring new tools, refining product ideas, and learning how motion and design can make software feel more memorable.</p>
        </div>
        <div className="about-image-wrap" data-reveal>
          <div className="about-image-frame">
            <img src="./WhatsApp Image 2025-07-07 at 12.07.03 PM.jpeg" alt="Satya Narayan Dhar" />
          </div>
        </div>
      </div>
    </section>
  `;
}

function Skills() {
  const skillCategories = [
    { title: 'Frontend', icon: 'fa-code', skills: ['React.js', 'HTML5', 'CSS3', 'JavaScript ES6+', 'Responsive Design', 'Tailwind CSS'] },
    { title: 'Backend', icon: 'fa-server', skills: ['Node.js', 'Express.js', 'REST APIs', 'Authentication', 'Server Optimization'] },
    { title: 'Database', icon: 'fa-database', skills: ['MongoDB', 'MySQL', 'Firebase', 'Data Modeling', 'Query Optimization'] },
    { title: 'Tools & Platforms', icon: 'fa-screwdriver-wrench', skills: ['Git & GitHub', 'Deployment', 'VS Code', 'npm', 'Docker Basics'] }
  ];

  return html`
    <section className="skills section-shell" id="skills">
      <div className="skills-container">
        <div className="section-heading" data-reveal>
          <p className="section-kicker">Skills</p>
          <h2 className="section-title">The stack I use to build strong digital products</h2>
        </div>
        <div className="skills-grid">
          ${skillCategories.map((category, index) => html`
            <div key=${index} className="skill-card glass-panel" data-reveal>
              <h3><i className=${`fas ${category.icon}`}></i> ${category.title}</h3>
              <ul>
                ${category.skills.map((skill, idx) => html`<li key=${idx}>${skill}</li>`)}
              </ul>
            </div>
          `)}
        </div>
      </div>
    </section>
  `;
}

function Projects() {
  const projects = [
    { id: 1, title: 'E-Commerce Platform', description: 'A full-stack shopping platform with smooth product browsing, cart flow, and secure checkout experiences.', icon: 'fa-bag-shopping', tags: ['React', 'Node.js', 'MongoDB', 'Stripe'], github: '#', live: '#' },
    { id: 2, title: 'Social Media App', description: 'A real-time social space with profiles, conversations, notifications, and responsive community features.', icon: 'fa-comments', tags: ['React', 'Firebase', 'Tailwind CSS'], github: '#', live: '#' },
    { id: 3, title: 'Task Management Tool', description: 'A collaborative productivity app with shared workflows, live task updates, and team-focused organization.', icon: 'fa-list-check', tags: ['MERN', 'Socket.io', 'JWT Auth'], github: '#', live: '#' },
    { id: 4, title: 'Weather Dashboard', description: 'An interactive weather experience powered by live API data, location-aware updates, and visual summaries.', icon: 'fa-cloud-sun-rain', tags: ['React', 'Weather API', 'Charts'], github: '#', live: '#' },
    { id: 5, title: 'Blog Platform', description: 'A publishing platform for writing, managing, and analyzing content with a modern editorial workflow.', icon: 'fa-pen-nib', tags: ['Next.js', 'GraphQL', 'PostgreSQL'], github: '#', live: '#' },
    { id: 6, title: 'AI Chat Bot', description: 'An AI-driven assistant for support and automation with natural conversations and useful response flows.', icon: 'fa-robot', tags: ['Python', 'NLP', 'React', 'OpenAI API'], github: '#', live: '#' }
  ];

  return html`
    <section className="projects section-shell" id="projects">
      <div className="section-heading" data-reveal>
        <p className="section-kicker">Projects</p>
        <h2 className="section-title">A few builds that show how I think and ship</h2>
      </div>
      <div className="projects-grid">
        ${projects.map((project) => html`
          <div key=${project.id} className="project-card glass-panel" data-reveal>
            <div className="project-image">
              <i className=${`fas ${project.icon}`}></i>
            </div>
            <div className="project-content">
              <h3>${project.title}</h3>
              <p>${project.description}</p>
              <div className="project-tags">
                ${project.tags.map((tag, idx) => html`<span key=${idx} className="tag">${tag}</span>`)}
              </div>
              <div className="project-links">
                <a href=${project.github} target="_blank" rel="noopener noreferrer"><i className="fab fa-github"></i> Code</a>
                <a href=${project.live} target="_blank" rel="noopener noreferrer"><i className="fas fa-arrow-up-right-from-square"></i> Live</a>
              </div>
            </div>
          </div>
        `)}
      </div>
    </section>
  `;
}

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${CONTACT_API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json().catch(() => ({ message: 'Unexpected server response.' }));

      if (!response.ok) {
        throw new Error(result.message || 'Unable to send message.');
      }

      const successMessage = result.storedLocally
        ? 'Your message was saved locally because email is not configured yet.'
        : (result.message || 'Message sent successfully.');

      setStatus({ type: 'success', message: successMessage });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact form submission error:', error);
      const networkErrorMessage = error instanceof TypeError
        ? 'Contact service is unavailable right now. Start the backend server and open the site from that server, usually at http://localhost:5000.'
        : (error.message || 'Something went wrong sending the message.');

      setStatus({
        type: 'error',
        message: networkErrorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return html`
    <section className="contact section-shell" id="contact">
      <div className="contact-container glass-panel" data-reveal>
        <div className="section-heading">
          <p className="section-kicker">Contact</p>
          <h2 className="section-title">Let's build something thoughtful together</h2>
        </div>
        <p className="contact-copy">I would love to hear about opportunities, collaborations, or ideas you want to bring to life.</p>

        ${status.type ? html`
          <div className=${status.type === 'success' ? 'success-banner' : 'error-banner'}>
            <i className=${status.type === 'success' ? 'fas fa-circle-check' : 'fas fa-circle-exclamation'}></i>
            <span>${status.message}</span>
          </div>
        ` : null}

        <form className="contact-form" onSubmit=${handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input type="text" id="name" name="name" value=${formData.name} onChange=${handleChange} required placeholder="Enter your full name" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Your Email</label>
            <input type="email" id="email" name="email" value=${formData.email} onChange=${handleChange} required placeholder="Enter your email address" />
          </div>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input type="text" id="subject" name="subject" value=${formData.subject} onChange=${handleChange} required placeholder="What is this about?" />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" value=${formData.message} onChange=${handleChange} required placeholder="Enter your message..."></textarea>
          </div>
          <button type="submit" className="submit-btn" disabled=${isSubmitting}>
            <i className="fas fa-paper-plane"></i> ${isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <div className="contact-info">
          <div className="contact-item"><i className="fas fa-envelope"></i><a href="mailto:satyadhar1208@gmail.com">satyadhar1208@gmail.com</a></div>
          <div className="contact-item"><i className="fas fa-phone"></i><a href="tel:+918984285241">+91 8984 285 241</a></div>
          <div className="contact-item"><i className="fas fa-location-dot"></i><span>Bhubaneswar, India</span></div>
        </div>
      </div>
    </section>
  `;
}

function Footer() {
  const socialLinks = useMemo(() => ([
    ['GitHub', 'fab fa-github', 'https://github.com/SatyaNDhar1229'],
    ['LinkedIn', 'fab fa-linkedin-in', 'https://www.linkedin.com/in/satya-narayan-dhar-27429636a/'],
    ['Twitter', 'fab fa-x-twitter', 'https://twitter.com'],
    ['Instagram', 'fab fa-instagram', 'https://www.instagram.com/satya_29m/']
  ]), []);

  return html`
    <footer>
      <div className="social-links" data-reveal>
        ${socialLinks.map(([label, icon, url]) => html`<a key=${label} href=${url} target="_blank" rel="noopener noreferrer" title=${label}><i className=${icon}></i></a>`)}
      </div>
      <p>(c) 2024 Satya Narayan Dhar. Designed and built with motion in mind.</p>
    </footer>
  `;
}

function App() {
  useInteractiveEffects();

  return html`
    <div className="page-shell">
      <div className="background-wash"></div>
      <div className="background-grid"></div>
      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>
      <${Navbar} />
      <${Hero} />
      <${About} />
      <${Skills} />
      <${Projects} />
      <${Contact} />
      <${Footer} />
    </div>
  `;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(html`<${App} />`);

const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = window.innerWidth / 2;
let my = window.innerHeight / 2;
let rx = mx;
let ry = my;

const burstColors = ['rgba(255, 122, 89, 0.9)', 'rgba(255, 196, 107, 0.9)', 'rgba(98, 208, 255, 0.85)', 'rgba(183, 148, 255, 0.8)'];

const updateCursorPosition = (event) => {
  mx = event.clientX;
  my = event.clientY;
  if (cursor) {
    cursor.style.transform = `translate(${mx - 5}px, ${my - 5}px)`;
  }
};

document.addEventListener('mousemove', updateCursorPosition);

document.addEventListener('mouseleave', () => {
  if (cursor) cursor.style.opacity = '0';
  if (ring) ring.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
  if (cursor) cursor.style.opacity = '1';
  if (ring) ring.style.opacity = '1';
});

function animateRing() {
  if (!ring) return;
  rx += (mx - rx) * 0.14;
  ry += (my - ry) * 0.14;
  ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
  requestAnimationFrame(animateRing);
}

if (ring) {
  animateRing();
}

function createCursorBurst(x, y, count = 12) {
  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement('div');
    particle.className = 'burst-particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.background = burstColors[Math.floor(Math.random() * burstColors.length)];
    const dx = (Math.random() - 0.5) * 90;
    const dy = (Math.random() - 0.5) * 90;
    particle.style.setProperty('--dx', `${dx}px`);
    particle.style.setProperty('--dy', `${dy}px`);
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 700);
  }
}

function bindInteractiveCursor() {
  if (!ring) return;
  const interactiveNodes = document.querySelectorAll('a, button, input, textarea, .skill-card, .project-card');
  interactiveNodes.forEach((node) => {
    node.addEventListener('mouseenter', () => {
      ring.style.width = '58px';
      ring.style.height = '58px';
      ring.style.borderColor = 'rgba(255,255,255,0.92)';
      ring.style.boxShadow = '0 0 28px rgba(255,255,255,0.18)';
      createCursorBurst(mx, my, 10);
    });

    node.addEventListener('mouseleave', () => {
      ring.style.width = '36px';
      ring.style.height = '36px';
      ring.style.borderColor = 'rgba(255,255,255,0.45)';
      ring.style.boxShadow = 'none';
    });
  });
}

setTimeout(bindInteractiveCursor, 250);

let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (Math.abs(scrollTop - lastScrollTop) > 18) {
    createCursorBurst(mx, my, 6);
  }
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, { passive: true });






