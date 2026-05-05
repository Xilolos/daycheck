import { useState } from 'react';
import { supabase } from '../supabase';
import { btnPrimary, btnSecondary, linkBtn } from '../styles';
import { pad2 } from '../utils';

export default function Onboarding({ theme, fontStack, fontMono }) {
  const [step, setStep] = useState('auth');
  const [mode, setMode] = useState('signin');

  if (step === 'auth') return <AuthScreen theme={theme} fontStack={fontStack} mode={mode} setMode={setMode} onContinueEmail={() => setStep('email')} />;
  return <EmailScreen theme={theme} fontStack={fontStack} mode={mode} onBack={() => setStep('auth')} />;
}

function AuthScreen({ theme, fontStack, mode, setMode, onContinueEmail }) {
  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: fontStack, boxSizing: 'border-box' }}>
      <div style={{ flex: 1, padding: '48px 28px 8px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 40 }}>
          <div style={{ fontFamily: `'Fraunces', 'Times New Roman', serif`, fontSize: 30, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1 }}>DayCheck</div>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', color: theme.dim }}>·  A LEDGER</div>
        </div>
        <h2 style={{ margin: 0, fontFamily: `'Fraunces', 'Times New Roman', serif`, fontSize: 28, fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.015em' }}>
          {mode === 'signin' ? 'Pick up where you left off.' : 'Start your ledger.'}
        </h2>
        <p style={{ marginTop: 14, marginBottom: 28, fontSize: 13, lineHeight: 1.5, color: theme.dim }}>
          {mode === 'signin' ? 'Sign in to keep your pages in sync across devices.' : 'Create an account to save your trackers and history.'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ProviderBtn theme={theme} onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} icon={<GoogleGlyph />} label="Continue with Google" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0' }}>
            <div style={{ flex: 1, height: 1, background: theme.rule }} />
            <div style={{ fontSize: 10, letterSpacing: '0.18em', color: theme.dim }}>OR</div>
            <div style={{ flex: 1, height: 1, background: theme.rule }} />
          </div>
          <ProviderBtn theme={theme} onClick={onContinueEmail} icon={<MailGlyph />} label={mode === 'signin' ? 'Continue with email' : 'Sign up with email'} />
        </div>
      </div>
      <div style={{ padding: '14px 22px 36px', borderTop: `1px solid ${theme.rule}`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, fontSize: 12, color: theme.dim }}>
        {mode === 'signin' ? (
          <><span>New here?</span><button onClick={() => setMode('register')} style={linkBtn(theme)}>Create an account</button></>
        ) : (
          <><span>Already have one?</span><button onClick={() => setMode('signin')} style={linkBtn(theme)}>Sign in</button></>
        )}
      </div>
    </div>
  );
}

function EmailScreen({ theme, fontStack, mode, onBack }) {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const valid = email.trim().length > 3 && pwd.length >= 6;

  const submit = async () => {
    if (!valid) return;
    setError('');
    setLoading(true);
    const fn = mode === 'signin'
      ? supabase.auth.signInWithPassword({ email: email.trim(), password: pwd })
      : supabase.auth.signUp({ email: email.trim(), password: pwd });
    const { error: err } = await fn;
    setLoading(false);
    if (err) { setError(err.message); return; }
    if (mode === 'register') setError('Check your email to confirm your account.');
    // On sign-in success, onAuthStateChange in App fires and takes over
  };

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: fontStack, boxSizing: 'border-box' }}>
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={onBack} aria-label="Back" style={{ width: 32, height: 32, border: `1px solid ${theme.rule}`, background: 'transparent', color: theme.text, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{ fontSize: 10, letterSpacing: '0.18em', color: theme.dim }}>{mode === 'signin' ? 'SIGN IN' : 'REGISTER'} · EMAIL</div>
      </div>
      <div style={{ flex: 1, padding: '20px 28px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <h2 style={{ margin: 0, fontFamily: `'Fraunces', 'Times New Roman', serif`, fontSize: 26, fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.015em' }}>{mode === 'signin' ? 'Welcome back.' : 'A few details.'}</h2>
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <EmailField theme={theme} label="EMAIL" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
          <EmailField theme={theme} label="PASSWORD" value={pwd} onChange={setPwd} type="password" placeholder={mode === 'register' ? '6+ characters' : '••••••••'} />
        </div>
        {error && (
          <div style={{ marginTop: 14, fontSize: 12, color: error.startsWith('Check') ? theme.dim : '#c0392b', lineHeight: 1.4 }}>{error}</div>
        )}
      </div>
      <div style={{ padding: '12px 22px 36px', borderTop: `1px solid ${theme.rule}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, fontSize: 11, color: theme.dim }}>{mode === 'register' ? 'By continuing, you agree to the terms.' : ''}</div>
        <button onClick={submit} disabled={!valid || loading} style={{ ...btnPrimary(theme), opacity: valid && !loading ? 1 : 0.4, cursor: valid && !loading ? 'pointer' : 'default' }}>
          {loading ? '...' : mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
        </button>
      </div>
    </div>
  );
}

function EmailField({ theme, label, value, onChange, type = 'text', placeholder }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 10, letterSpacing: '0.18em', color: theme.dim }}>{label}</span>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ border: 'none', borderBottom: `1px solid ${theme.rule}`, background: 'transparent', color: theme.text, padding: '8px 0', fontFamily: 'inherit', fontSize: 15, outline: 'none' }}
      />
    </label>
  );
}

function ProviderBtn({ theme, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={{ height: 46, padding: '0 16px', borderRadius: 10, border: `1px solid ${theme.rule}`, background: theme.bg, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
      <span style={{ width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      {label}
    </button>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path fill="#4285F4" d="M15.6 8.2c0-.5 0-1-.1-1.4H8v2.8h4.3c-.2 1-.7 1.8-1.6 2.4v2h2.6c1.5-1.4 2.3-3.4 2.3-5.8z"/>
      <path fill="#34A853" d="M8 16c2.2 0 4-.7 5.3-2l-2.6-2c-.7.5-1.6.8-2.7.8-2.1 0-3.8-1.4-4.5-3.3H1v2C2.3 14.2 4.9 16 8 16z"/>
      <path fill="#FBBC05" d="M3.5 9.5C3.3 9 3.2 8.5 3.2 8s.1-1 .3-1.5v-2H1C.4 5.6 0 6.8 0 8s.4 2.4 1 3.5l2.5-2z"/>
      <path fill="#EA4335" d="M8 3.2c1.2 0 2.3.4 3.1 1.2L13.4 2C12 .7 10.2 0 8 0 4.9 0 2.3 1.8 1 4.5l2.5 2C4.2 4.6 5.9 3.2 8 3.2z"/>
    </svg>
  );
}

function MailGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="3" width="13" height="10" rx="1.5"/>
      <path d="M2 4l6 5 6-5"/>
    </svg>
  );
}
