import { Link, useNavigate } from 'react-router-dom'
import ScrollReveal from '../components/ScrollReveal'

const featureCards = [
  {
    title: 'AI Triage',
    copy: 'Gemini-assisted crisis classification turns raw distress reports into structured action plans in seconds.',
  },
  {
    title: 'Live Coordination',
    copy: 'Keep operations teams aligned with incident feeds, dispatch logs, location context, and responder routing.',
  },
  {
    title: 'Public Safety Alerts',
    copy: 'Prepare authority handoff payloads, nearby people notifications, and clear next-step instructions from one dashboard.',
  },
]

const workflowCards = [
  ['Capture', 'Receive voice or text distress input with live GPS context.'],
  ['Analyze', 'Convert the report into strict JSON with severity, risks, actions, and responders.'],
  ['Coordinate', 'Route the incident to the right authority desks and keep the live command view updated.'],
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <main className="landing-shell">
      <ScrollReveal as="header" className="landing-nav" delay={30}>
        <div>
          <p className="landing-brand">CrisisSync AI</p>
          <p className="landing-subbrand">Smart Emergency Coordination Platform</p>
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="ghost-button">Login</Link>
          <Link to="/signup" className="ghost-button">Sign up</Link>
        </div>
      </ScrollReveal>

      <section className="landing-hero-grid">
        <ScrollReveal as="section" className="landing-hero" delay={80}>
          <p className="landing-kicker">AI-powered decision and coordination</p>
          <h1>Detect crises faster, route the right responders, and guide people with confidence.</h1>
          <p className="landing-copy">
            CrisisSync combines AI triage, real-time location context, live coordination dashboards, and authority
            dispatch workflows so emergencies move from raw reports to structured action without delay.
          </p>
          <div className="landing-cta-row">
            <button type="button" className="landing-primary-cta" onClick={() => navigate('/login')}>
              Let&apos;s Get Started
            </button>
            <Link to="/signup" className="landing-secondary-link">
              Create an account
            </Link>
          </div>
          <div className="landing-stat-row">
            <article>
              <strong>AI Triage</strong>
              <span>Structured JSON from text and voice reports</span>
            </article>
            <article>
              <strong>Geo-aware</strong>
              <span>Map-ready incident coordinates and authority handoff</span>
            </article>
            <article>
              <strong>Command View</strong>
              <span>Realtime dispatch logs and response orchestration</span>
            </article>
          </div>
        </ScrollReveal>

        <ScrollReveal as="section" className="landing-preview-card" delay={140}>
          <div className="landing-preview-badge">Live ops preview</div>
          <div className="landing-preview-window">
            <div className="landing-preview-header">
              <span>Incident routed</span>
              <span>Critical</span>
            </div>
            <div className="landing-preview-body">
              <div className="landing-preview-pill-row">
                <span className="status-pill critical">Fire</span>
                <span className="status-pill neutral">Authority handoff</span>
                <span className="status-pill neutral">Nearby alert</span>
              </div>
              <h2>Apartment smoke escalation with one resident trapped inside.</h2>
              <p>
                AI identifies a high-risk fire event, routes the report to Fire Control and Police, and prepares nearby
                SMS notifications with location context.
              </p>
              <div className="landing-mini-grid">
                <article>
                  <span>Responders</span>
                  <strong>Fire, Police</strong>
                </article>
                <article>
                  <span>Dispatch mode</span>
                  <strong>Immediate multi-channel</strong>
                </article>
                <article>
                  <span>Location</span>
                  <strong>Lat 17.43993, Lng 78.49827</strong>
                </article>
                <article>
                  <span>Nearby people</span>
                  <strong>24 public alerts</strong>
                </article>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="landing-section">
        <ScrollReveal as="div" className="landing-section-heading" delay={70}>
          <p className="landing-kicker">Why it matters</p>
          <h2>Built for emergency coordination, not just incident reporting.</h2>
        </ScrollReveal>

        <div className="landing-feature-grid">
          {featureCards.map((card, index) => (
            <ScrollReveal key={card.title} className="landing-feature-card" delay={90 + index * 60}>
              <p className="landing-card-index">0{index + 1}</p>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <ScrollReveal as="div" className="landing-section-heading" delay={70}>
          <p className="landing-kicker">Workflow</p>
          <h2>One clean path from distress intake to coordinated response.</h2>
        </ScrollReveal>

        <div className="landing-workflow-grid">
          {workflowCards.map(([title, copy], index) => (
            <ScrollReveal key={title} className="landing-workflow-card" delay={100 + index * 70}>
              <div className="landing-step-badge">{index + 1}</div>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <ScrollReveal as="section" className="landing-final-cta" delay={90}>
        <p className="landing-kicker">Ready to launch</p>
        <h2>Start the CrisisSync flow and move from chaos to clarity.</h2>
        <p>
          Sign in to access the command dashboard, analyze incidents, and route emergency intelligence to the right
          people.
        </p>
        <button type="button" className="landing-primary-cta" onClick={() => navigate('/login')}>
          Let&apos;s Get Started
        </button>
      </ScrollReveal>
    </main>
  )
}
