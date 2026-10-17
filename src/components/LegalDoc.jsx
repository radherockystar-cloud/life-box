import React from 'react';

// Privacy / Terms / Legal / About: sabke liye ek jaisa professional document layout.
// Sections ka data har View file mein hai, yahan sirf dikhane ka design hai.
export default function LegalDoc({ dark, icon: Icon, iconBg, iconColor, title, badgeIcon: BadgeIcon, badge, badgeColor, updated, intro, sections = [], numbered = true, footer }) {
  const ink = dark ? '#f9fafb' : '#111827';
  const body = dark ? '#d1d5db' : '#4b5563';
  const muted = dark ? '#9ca3af' : '#6b7280';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ padding: '10px', borderRadius: '14px', background: iconBg, color: iconColor }}>
          <Icon size={20} />
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: '900', color: ink }}>{title}</h3>
      </div>

      <div style={{ padding: '20px', borderRadius: '20px', background: dark ? '#1e293b' : '#fafafa', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {badge && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: badgeColor, fontSize: '12px', fontWeight: '900' }}>
            {BadgeIcon && <BadgeIcon size={16} />} {badge}
          </div>
        )}
        {updated && <div style={{ fontSize: '11px', fontWeight: '700', color: muted }}>Last updated: {updated}</div>}
        {intro && <p style={{ fontSize: '12.5px', color: body, lineHeight: '1.75', fontWeight: '600' }}>{intro}</p>}

        {sections.map((s, i) => (
          <div key={s.h}>
            <h4 style={{ fontSize: '13px', fontWeight: '900', color: ink, marginBottom: '6px' }}>
              {numbered ? `${i + 1}. ` : ''}
              {s.h}
            </h4>
            {(s.p || []).map((para) => (
              <p key={para} style={{ fontSize: '12.5px', color: body, lineHeight: '1.75', fontWeight: '600', marginBottom: '6px' }}>
                {para}
              </p>
            ))}
            {s.list && (
              <ul style={{ margin: '4px 0 0', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {s.list.map((item) => (
                  <li key={item} style={{ fontSize: '12.5px', color: body, lineHeight: '1.7', fontWeight: '600' }}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {footer}
      </div>
    </div>
  );
}
