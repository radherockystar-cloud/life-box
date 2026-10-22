import React, { useState } from 'react';
import { ArrowLeft, Crown, Check, Sparkles } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useMeTheme } from '../meTheme';
import { useMeText } from '../meTexts';
import { useBackHandler } from '../../../utils/useBackHandler';
import { ADS_ENABLED, visiblePlans } from '../../../config/plans';
import { bt } from '../../../utils/billingTexts';
import { useEntitlements, purchasePlan, restorePurchases, manageSubscriptions, testGrant, testClear } from '../../../utils/billing';

// Subscription page. Poori screen par khulta hai (neeche ke 4 tab nahi dikhte).
// Plans / prices badalne ho to: src/config/plans.js
export default function SubscriptionScreen({ onBack }) {
  const { c, currentLang } = useApp();
  const b = (k, v) => bt(k, v, currentLang);
  const th = useMeTheme();
  const tx = useMeText();
  const ent = useEntitlements();
  const [msg, setMsg] = useState({ text: '', good: false });

  useBackHandler(true, onBack);

  const plans = visiblePlans(); // Ad-free wale plan ads aane tak chhupe (src/config/plans.js me ADS_ENABLED)
  const hasAny = ent.pro || ent.adFree;
  const dark = c.isDark;
  const ink = dark ? c.text : '#4a0d22';
  const sub = dark ? c.textSub : '#9d4466';

  const owns = (plan) => (plan.grants.pro ? ent.pro : true) && (plan.grants.adFree ? ent.adFree : true);
  // Bundle tab nahi khulta jab koi ek plan chal raha ho (dobara paisa na kate)
  const blocked = (plan) => plan.id === 'bundle' && hasAny && !owns(plan);

  const priceOf = (plan) => ent.products[plan.productId]?.price || `₹${plan.price}`;

  const buy = async (plan) => {
    setMsg({ text: '', good: false });
    const r = await purchasePlan(plan.id);
    if (r.ok) setMsg({ text: b('thankYou'), good: true });
    else if (r.error) setMsg({ text: r.error, good: false });
  };

  const restore = async () => {
    setMsg({ text: '', good: false });
    const r = await restorePurchases();
    if (r.ok) setMsg({ text: r.active ? b('restoredOk') : b('restoredNone'), good: Boolean(r.active) });
    else setMsg({ text: r.error || '', good: false });
  };

  const activeNames = [ent.pro && 'Pro', ent.adFree && b('Ad-free')].filter(Boolean).join(' + ');

  const card = {
    borderRadius: '24px',
    padding: '18px',
    background: dark ? c.surface : 'linear-gradient(160deg, #ffffff 0%, rgba(255,240,246,0.95) 100%)',
    border: '1px solid rgba(251,113,133,0.3)',
    boxShadow: dark ? '0 14px 28px -14px rgba(0,0,0,0.6)' : 'inset 0 2px 0 #ffffff, 0 14px 28px -14px rgba(244,63,94,0.4)',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '28rem',
        zIndex: 2000,
        overflowY: 'auto',
        background: c.pageBg,
        color: ink,
        padding: '16px 16px calc(28px + env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <button type="button" onClick={onBack} style={th.iconBtn} aria-label={b('back')} className="me-press">
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: 900, color: th.ink }}>{tx('meSubTitle')}</h2>
      </div>

      {/* Status */}
      <div
        style={{ ...card, textAlign: 'center', marginBottom: '14px', background: dark ? c.surface : 'linear-gradient(160deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid rgba(245,158,11,0.45)' }}
      >
        <div style={{ width: '60px', height: '60px', borderRadius: '20px', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #fde68a 0%, #fbbf24 55%, #d97706 100%)', border: '1px solid rgba(255,255,255,0.6)', color: '#5a2d00', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.7), 0 10px 22px -6px rgba(245,158,11,0.6)' }}>
          <Crown size={28} />
        </div>
        {hasAny ? (
          <>
            <h3 style={{ fontSize: '17px', fontWeight: 900, color: dark ? c.text : '#92400e' }}>{b('youAre', { n: activeNames })}</h3>
            <p style={{ fontSize: '12px', fontWeight: 700, marginTop: '4px', color: dark ? c.textSub : '#92400e' }}>{b('thanks')}</p>
            <button type="button" onClick={manageSubscriptions} style={{ marginTop: '12px', padding: '10px 18px', borderRadius: '14px', border: '1px solid rgba(217,119,6,0.5)', background: 'transparent', color: dark ? c.text : '#92400e', fontWeight: 900, fontSize: '12.5px', cursor: 'pointer' }}>
              {b('manageCancel')}
            </button>
          </>
        ) : (
          <>
            <h3 style={{ fontSize: '17px', fontWeight: 900, color: dark ? c.text : '#92400e' }}>{b('unlock')}</h3>
            <p style={{ fontSize: '12px', fontWeight: 700, marginTop: '4px', lineHeight: 1.55, color: dark ? c.textSub : '#92400e' }}>
              {ent.aiLeft > 0 ? b('left', { a: ent.aiLeft, b: ent.aiLimit }) : b('finished')} {b('pitch')}
            </p>
          </>
        )}
      </div>

      {/* Plans */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {plans.map((plan) => {
          const own = owns(plan);
          const blk = blocked(plan);
          const soon = plan.needsAds && !ADS_ENABLED; // ads abhi nahi hain, to ye plan abhi bechna sahi nahi
          const disabled = soon || own || blk || ent.busy || !ent.canBuy;
          let label = b('subscribe');
          if (soon) label = b('soon');
          else if (own) label = b('active');
          else if (blk) label = b('cancelFirst');
          else if (ent.busy) label = b('wait');
          else if (!ent.canBuy) label = b('inApp');
          return (
            <div key={plan.id} style={{ ...card, position: 'relative', border: plan.badge ? '1.5px solid #e11d48' : card.border, opacity: soon ? 0.8 : 1 }}>
              {plan.badge && (
                <div style={{ position: 'absolute', top: '-10px', right: '16px', padding: '3px 10px', borderRadius: '10px', background: 'linear-gradient(160deg, #fb7185, #be123c)', color: '#fff', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={11} /> {b(plan.badge)}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: ink }}>{b(plan.title)}</div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: sub }}>{b(plan.tagline)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#be123c' }}>{priceOf(plan)}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: sub }}> {b('perMonth')}</span>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '12.5px', fontWeight: 700, color: ink }}>
                    <Check size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#059669' }} />
                    {b(f)}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={disabled}
                onClick={() => buy(plan)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '15px',
                  border: '1px solid rgba(255,255,255,0.6)',
                  cursor: disabled ? 'default' : 'pointer',
                  fontSize: '13.5px',
                  fontWeight: 900,
                  color: disabled ? (dark ? c.textSub : '#9d4466') : '#ffffff',
                  background: disabled ? (dark ? c.surfaceAlt : '#ffe4ec') : 'linear-gradient(160deg, #fb7185 0%, #e11d48 55%, #be123c 100%)',
                  boxShadow: disabled ? 'none' : 'inset 0 1.5px 0 rgba(255,255,255,0.65), 0 8px 18px -4px rgba(225,29,72,0.6)',
                }}
              >
                {label}
              </button>
            </div>
          );
        })}
      </div>

      {msg.text && (
        <p role="status" style={{ marginTop: '14px', textAlign: 'center', fontSize: '12.5px', fontWeight: 800, color: msg.good ? '#059669' : '#be123c' }}>
          {msg.text}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
        <button type="button" onClick={restore} style={{ padding: '9px 16px', borderRadius: '14px', border: '1px solid rgba(251,113,133,0.4)', background: 'transparent', color: ink, fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
          {b('restore')}
        </button>
        <button type="button" onClick={manageSubscriptions} style={{ padding: '9px 16px', borderRadius: '14px', border: '1px solid rgba(251,113,133,0.4)', background: 'transparent', color: ink, fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
          {b('manageGP')}
        </button>
      </div>

      <p style={{ marginTop: '16px', fontSize: '10.5px', fontWeight: 600, lineHeight: 1.6, textAlign: 'center', color: sub }}>
        {b('fine')}
      </p>

      {ent.testMode && (
        <div style={{ marginTop: '16px', padding: '12px', borderRadius: '16px', border: '1.5px dashed #f59e0b', background: dark ? c.surfaceAlt : '#fffbeb' }}>
          <div style={{ fontSize: '11px', fontWeight: 900, color: '#b45309', marginBottom: '8px' }}>TEST MODE (not in the release build)</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {plans.map((p) => (
              <button key={p.id} type="button" onClick={() => testGrant(p.id)} style={{ padding: '7px 12px', borderRadius: '12px', border: '1px solid #f59e0b', background: '#fff', color: '#92400e', fontWeight: 800, fontSize: '11.5px', cursor: 'pointer' }}>
                Grant {p.title}
              </button>
            ))}
            <button type="button" onClick={testClear} style={{ padding: '7px 12px', borderRadius: '12px', border: '1px solid #dc2626', background: '#fff', color: '#b91c1c', fontWeight: 800, fontSize: '11.5px', cursor: 'pointer' }}>
              Reset all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
