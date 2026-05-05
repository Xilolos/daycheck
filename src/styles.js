export function btnPrimary(theme) {
  return {
    height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
    background: theme.text, color: theme.bg,
    fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.18em',
    fontWeight: 600, cursor: 'pointer',
  };
}

export function btnSecondary(theme) {
  return {
    height: 36, padding: '0 14px', borderRadius: 8,
    border: `1px solid ${theme.rule}`,
    background: theme.bg, color: theme.text,
    fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.16em',
    cursor: 'pointer',
  };
}

export function linkBtn(theme) {
  return {
    background: 'transparent', border: 'none',
    color: theme.text, fontFamily: 'inherit', fontSize: 12,
    cursor: 'pointer', padding: 0, textDecoration: 'underline',
    textUnderlineOffset: 3,
  };
}

export function inputStyle(theme) {
  return {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
    background: theme.bg, color: theme.text,
    border: `1px solid ${theme.rule}`, borderRadius: 6,
    fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.02em', outline: 'none',
  };
}
