import { Link } from 'react-router-dom'

const CATEGORIES = [
  { label: 'Communities', bg: 'linear-gradient(120deg,#7fc97f 0%,#e8a0c8 45%,#bde06a 100%)' },
  { label: 'Design Agencies', bg: 'linear-gradient(160deg,#3a4a6b 0%,#b8c4d8 50%,#5a6a8b 100%)' },
  { label: 'Real Estate', bg: 'linear-gradient(140deg,#1a2a4a 0%,#e8e0d8 55%,#2a3a5a 100%)' },
  { label: 'Travel', bg: 'linear-gradient(170deg,#8898b8 0%,#e8d8e0 60%,#6878a8 100%)' },
]

const FLOATERS: Array<[string, React.CSSProperties]> = [
  ['🥞', { left: '7%', top: '18%', transform: 'rotate(-8deg)' }],
  ['👟', { left: '13%', top: '36%', transform: 'rotate(6deg)' }],
  ['🧁', { left: '9%', top: '62%', transform: 'rotate(-4deg)' }],
  ['🎃', { left: '3%', top: '44%', transform: 'rotate(3deg)' }],
  ['✈️', { left: '1%', top: '24%', transform: 'rotate(-12deg)' }],
  ['🍔', { right: '8%', top: '20%', transform: 'rotate(7deg)' }],
  ['🎃', { right: '3%', top: '38%', transform: 'rotate(-5deg)' }],
  ['🥞', { right: '12%', top: '56%', transform: 'rotate(4deg)' }],
  ['👟', { right: '5%', top: '70%', transform: 'rotate(-7deg)' }],
  ['✈️', { right: '1%', top: '12%', transform: 'rotate(10deg)' }],
]

function Nav() {
  return (
    <header className="landing-nav">
      <Link to="/" className="logo-pill">PAM</Link>
      <nav>
        <a href="#pricing">Pricing</a>
        <a href="#travelers">For travelers</a>
        <a href="#business">For business</a>
        <a href="#ask">Ask Pam</a>
        <Link to="/app">
          <button className="btn-google">
            <svg width="15" height="15" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.4C29.3 34.9 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4 5.6l6.3 5.4C37.2 39.4 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
            </svg>
            Sign in with Google
          </button>
        </Link>
      </nav>
    </header>
  )
}

export default function Landing() {
  return (
    <div className="landing">
      <Nav />

      <section className="hero">
        <h1>The easiest way<br />to make maps.</h1>
        <p>PamPam is the new AI map maker to make custom interactive maps for the web.</p>
        <Link to="/app"><button className="btn-primary">Make a map for free</button></Link>
      </section>

      <div className="category-row">
        {CATEGORIES.map(c => (
          <div className="category-card" key={c.label} style={{ background: c.bg }}>
            <span className="label">{c.label}</span>
            <span className="chev">›</span>
          </div>
        ))}
      </div>

      <section className="sticker-section">
        {FLOATERS.map(([emoji, style], i) => (
          <span className="float-sticker" style={style} key={i}>{emoji}</span>
        ))}
        <h2>Put your world<br />on the map.</h2>
        <div className="actions">
          <Link to="/app"><button className="btn-primary">Try it for free</button></Link>
          <button className="btn-secondary">See templates</button>
        </div>
      </section>

      <section className="sticker-section" style={{ paddingTop: 40 }}>
        <h2>Plan your dream trip.</h2>
        <p>Get suggestions from our AI trip planner, add your own spots with our map maker.</p>
        <div className="actions">
          <button className="btn-secondary">🧑‍🤝‍🧑 Plan trips</button>
          <button className="btn-secondary">📍 Share guides</button>
        </div>
      </section>

      <section className="contact-section">
        <h2>Get in touch</h2>
        <p>If you have a question about using PamPam, or you'd like to collaborate or partner with us – just reach out.</p>
        <button className="btn-primary">Contact us</button>
      </section>

      <footer className="landing-footer">
        <div className="footer-grid">
          <span className="logo-pill">PAM</span>
          <div className="footer-col">
            <h4>Tools</h4>
            <a href="#">AI Trip Planner</a>
            <a href="#">Map Templates</a>
            <a href="#">Itinerary Templates</a>
            <a href="#">Embed a map</a>
            <a href="#">Spreadsheet to map</a>
          </div>
          <div className="footer-col">
            <h4>Use Cases</h4>
            <a href="#">Communities</a>
            <a href="#">DMOs</a>
            <a href="#">Weddings</a>
            <a href="#">Real Estate</a>
            <a href="#">Writers & Media</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">Pricing</a>
            <a href="#">Roadmap</a>
            <a href="#">About</a>
            <a href="#">Help & Docs</a>
            <a href="#">Terms & Privacy</a>
          </div>
          <div className="footer-col">
            <h4>Community</h4>
            <a href="#">On a Walk</a>
            <a href="#">Gift Shop</a>
            <a href="#">Instagram</a>
            <a href="#">YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
