import { useState } from 'react';
import toast from 'react-hot-toast';

export default function EmailCapture() {
  const [email, setEmail] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success('5 easy dinners coming your way!');
    setEmail('');
  }

  return (
    <section className="mmm-section mmm-container">
      <div className="mmm-email-card">
        <h3 className="mmm-section-title" style={{ fontSize: '22px' }}>Get 5 easy dinners this week</h3>
        <p className="mmm-section-sub">Quick recipes and kitchen tips, straight to your inbox.</p>
        <form className="mmm-email-form" onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="mmm-email-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button type="submit" className="mmm-btn mmm-btn-primary">Send Me the Dinners</button>
        </form>
      </div>
    </section>
  );
}
