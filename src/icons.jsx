import React from 'react';

// SVG wrapper defaults: fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
// Fill-based icons override with fill="currentColor" stroke="none"

const ICON_SET = {
  // — Time & Energy —
  moon:
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" stroke="none"/>,

  clock:
    <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>,

  sun:
    <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,

  bolt:
    <path d="M13 2L4.5 13.5H11L9.5 22 19.5 10.5H13z" fill="currentColor" stroke="none"/>,

  zzz:
    <path d="M5 8h14L7.5 16H21M3 16v2h14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,

  // — Exercise —
  run:
    <><circle cx="15" cy="4.5" r="2" fill="currentColor" stroke="none"/><path d="M13 8.5l2.5 2.5-3.5 3M8 21l3.5-5.5 3 2 3-5"/></>,

  lift:
    <><rect x="1.5" y="9" width="4" height="6" rx="1"/><rect x="18.5" y="9" width="4" height="6" rx="1"/><rect x="9" y="10.5" width="6" height="3" rx="0.5" fill="currentColor" stroke="none"/><path d="M5.5 12h3.5M15 12h3.5"/></>,

  yoga:
    <><circle cx="12" cy="4" r="2" fill="currentColor" stroke="none"/><path d="M12 7v5M7 17a5 5 0 0 1 10 0M7 17l-2.5 2M17 17l2.5 2"/></>,

  swim:
    <path d="M2 10c1.5 0 2-2 3.5-2S8 10 9.5 10s2-2 3.5-2S16 10 17.5 10 20 8 22 8M2 16c1.5 0 2-2 3.5-2S8 16 9.5 16s2-2 3.5-2S16 16 17.5 16 20 14 22 14"/>,

  walk:
    <><circle cx="14" cy="4.5" r="2" fill="currentColor" stroke="none"/><path d="M12 8l2 3.5-3 3M12.5 11.5l1.5 5M9.5 21l3.5-4.5 2.5 1.5 2-3.5"/></>,

  // — Food & Drink —
  coffee:
    <><path d="M6 9h12l-1.5 10H7.5z"/><path d="M18 11.5h2a2.5 2.5 0 0 1 0 5H18"/><path d="M9 7c0-2 1.5-2.5 1.5-2.5S10.5 6.5 10.5 8M13 6.5c0-1.5 1.5-2 1.5-2S14.5 6 14.5 7"/></>,

  drop:
    <path d="M12 3C9.5 6.5 7 9.5 7 12.5a5 5 0 0 0 10 0C17 9.5 14.5 6.5 12 3z" fill="currentColor" stroke="none"/>,

  leaf:
    <><path d="M5 19C5 19 5 11 15 7c0 0-3 9-10 12z" fill="currentColor" stroke="none"/><path d="M5 19C9.5 14 12.5 9.5 15 7"/></>,

  fork:
    <><path d="M8 2v5a3 3 0 0 0 6 0V2"/><path d="M11 7v13"/><path d="M8 2v3M11 2v3M14 2v3"/></>,

  apple:
    <><path d="M12 6C9.5 6 7.5 9 7.5 12S9 18 12 18s4.5-3 4.5-6S14.5 6 12 6z"/><path d="M14 4c-1-1.5.5-3 1-3s.5 2-1 3"/></>,

  // — Health —
  heart:
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" stroke="none"/>,

  pill:
    <><rect x="3" y="9.5" width="18" height="5" rx="2.5"/><line x1="12" y1="9.5" x2="12" y2="14.5"/></>,

  tooth:
    <path d="M9 3C7 3 5.5 5 5.5 7c0 3.5 2 7 3 11 .5 2 2 1 2-1 0-1 .5-1.5 1.5-1.5s1.5.5 1.5 1.5c0 2 1.5 3 2 1 1-4 3-7.5 3-11C18.5 5 17 3 15 3c-1.5 0-2.5 1-3 1.5L12 5l-.5-.5C11 4 10.5 3 9 3z"/>,

  therm:
    <><path d="M12 14V5a2 2 0 0 0-4 0v9a4 4 0 1 0 4 0z"/><line x1="10" y1="8" x2="8.5" y2="8"/><line x1="10" y1="11" x2="8.5" y2="11"/></>,

  // — Mind —
  book:
    <><rect x="4" y="3" width="16" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M7 8h4M7 12h4"/></>,

  pen:
    <><path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/><path d="M15 5l4 4"/></>,

  target:
    <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></>,

  music:
    <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,

  brain:
    <><path d="M12 5C9 5 7 7 7 9.5c0 1.5 1 2.5 2.5 3C8 14 7 15.5 7 17.5A3.5 3.5 0 0 0 10.5 21"/><path d="M12 5c3 0 5 2 5 4.5 0 1.5-1 2.5-2.5 3C16 14 17 15.5 17 17.5A3.5 3.5 0 0 1 13.5 21"/><line x1="12" y1="5" x2="12" y2="21"/></>,

  // — Work & Life —
  laptop:
    <><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M1 21h22"/></>,

  coin:
    <><circle cx="12" cy="12" r="9"/><path d="M12 7v10"/><path d="M9.5 9.5a2.5 2.5 0 0 1 5 0v5a2.5 2.5 0 0 1-5 0"/></>,

  chart:
    <><path d="M3 21V13l4-4 4 4 5-8"/><line x1="3" y1="21" x2="21" y2="21"/></>,

  check:
    <><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5.5"/></>,

  house:
    <><path d="M3 12L12 3l9 9"/><path d="M5 10.5V19h5v-5h4v5h5v-8.5"/></>,

  plane:
    <path d="M22 3L3 10.5l7.5 2.5 1 7 3-4.5 5.5 2.5z" fill="currentColor" stroke="none"/>,

  star:
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" fill="currentColor" stroke="none"/>,

  fire:
    <path d="M12 2c-2 4.5-5 5.5-5 10a5 5 0 0 0 10 0c0-2.5-1.5-4-1.5-4s.5 2.5-1.5 2.5c0-3.5-1-6-2-8.5z" fill="currentColor" stroke="none"/>,

  phone:
    <><rect x="7" y="2" width="10" height="20" rx="2"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/></>,

  paw:
    <><circle cx="7.5" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="16.5" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="4.5" cy="11" r="1.5" fill="currentColor" stroke="none"/><circle cx="19.5" cy="11" r="1.5" fill="currentColor" stroke="none"/><path d="M8.5 13.5c0-2.5 7-2.5 7 0l-1.5 5c-.5 1.5-4 1.5-4.5 0z" fill="currentColor" stroke="none"/></>,

  plant:
    <><path d="M12 22v-8"/><path d="M12 14C12 14 7.5 13 7.5 9.5S12 4 12 4s4.5 1.5 4.5 5.5S12 14 12 14"/><path d="M12 20c0 0-4-1.5-4-3.5"/></>,

  person:
    <><circle cx="12" cy="7" r="4" fill="currentColor" stroke="none"/><path d="M5.5 22c0-4 3-6.5 6.5-6.5s6.5 2.5 6.5 6.5" fill="currentColor" stroke="none"/></>,

  eye:
    <><path d="M3 12C5 7.5 8.5 5.5 12 5.5s7 2 9 6.5c-2 4.5-5.5 6.5-9 6.5S5 16.5 3 12z"/><circle cx="12" cy="12" r="3"/></>,

  scale:
    <><rect x="2" y="7" width="20" height="13" rx="4"/><rect x="7" y="11" width="10" height="5" rx="1.5"/></>,
};

export const ICON_KEYS = Object.keys(ICON_SET);

export function Icon({ id, size = 16, style }) {
  const content = ICON_SET[id];
  if (!content) return null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      {content}
    </svg>
  );
}
