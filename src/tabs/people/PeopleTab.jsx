import React, { useState } from 'react';
import { Plus, KeyRound, History } from 'lucide-react';
import { useBackHandler } from '../../utils/useBackHandler';
import useTrips from './trips/useTrips';
import useActiveTrip from './trips/useActiveTrip';
import { getTripPhase } from './trips/tripModels';
import { SHOW_DEMO_BUTTON, getMode } from './trips/tripConfig';
import { SEA, glass, roundButton, primaryButton } from './trips/tripStyles';
import { clearActive, getSnapshot, startRecording, stopTracking } from './trips/tripRecorder';
import { addSkip, finishTrip } from './trips/tripStories';
import TripCard from './trips/TripCard';
import NewTripForm from './trips/NewTripForm';
import TripDetail from './trips/TripDetail';
import JoinByCode from './trips/JoinByCode';
import QuickStart from './trips/QuickStart';
import LiveTrip from './trips/LiveTrip';
import StoryBuilder from './trips/StoryBuilder';
import TripHistory from './trips/TripHistory';
import TripStory from './trips/TripStory';

function SectionTitle({ children }) {
  return (
    <h3 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', margin: '4px 4px 10px' }}>
      {children}
    </h3>
  );
}

function Note({ children }) {
  return (
    <p style={{ ...glass, borderRadius: '18px', padding: '10px 14px', marginBottom: '12px', fontSize: '11.5px', fontWeight: 700, lineHeight: 1.5 }}>
      {children}
    </p>
  );
}

// People tab = Trips: plan a trip, invite people, record the journey and get a story.
export default function PeopleTab({ onGoToLogin }) {
  const { trips, user, ready, displayName, cloudError, reloadLocal } = useTrips();
  const { active } = useActiveTrip();

  const [showForm, setShowForm] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const [showLive, setShowLive] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [story, setStory] = useState(null);
  const [building, setBuilding] = useState('');

  // Back button. (Every other sheet handles its own back button.)
  useBackHandler(showForm, () => setShowForm(false));

  // ----- Recording -----
  const begin = async (meta) => {
    const result = await startRecording(meta);
    if (!result.ok) {
      alert(result.message);
      return false;
    }
    setShowQuick(false);
    setShowLive(true);
    return true;
  };

  const startPlanned = (trip) => {
    setDetailId(null);
    const companions = trip.members
      ? Object.entries(trip.members)
          .filter(([uid, m]) => uid !== (user && user.uid) && (m.status === 'accepted' || m.status === 'owner'))
          .map(([, m]) => m.name)
      : [];
    begin({ tripId: trip.id, title: trip.title, mode: trip.mode, fromPlace: trip.fromPlace || null, toPlace: trip.toPlace || null, companions });
  };

  const skipPlanned = (trip) => {
    addSkip(trip.id);
    setDetailId(null);
  };

  const completeTrip = async () => {
    const snap = getSnapshot();
    setShowLive(false);
    setBuilding('Saving your route...');
    await stopTracking();
    try {
      const entry = await finishTrip({ active: snap.active, points: snap.points, onProgress: setBuilding });
      await clearActive();
      setBuilding('');
      if (entry) setStory(entry);
      else alert('No location was recorded, so there is no story to save.');
    } catch (error) {
      console.error(error);
      setBuilding('');
      alert('Could not build the story. Your route is still saved on this phone, so you can press Complete again.');
    }
  };

  const discardTrip = async () => {
    await clearActive();
    setShowLive(false);
  };

  // ----- Lists -----
  const live = trips.filter((t) => ['upcoming', 'now'].includes(getTripPhase(t)));
  const finished = trips.filter((t) => ['cancelled', 'earlier'].includes(getTripPhase(t))).sort((a, b) => b.startAt - a.startAt);
  const detailTrip = detailId ? trips.find((t) => t.id === detailId) : null;

  return (
    <div className="pb-28">
      <div style={{ position: 'relative', borderRadius: '34px', overflow: 'hidden', background: SEA, padding: '16px 14px 24px', color: '#ffffff', minHeight: '70vh' }}>
        {/* Soft colour blobs behind the glass */}
        <div style={{ position: 'absolute', top: '-60px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(56,189,248,0.55)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '140px', left: '-70px', width: '210px', height: '210px', borderRadius: '50%', background: 'rgba(251,113,133,0.5)', filter: 'blur(55px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-40px', width: '190px', height: '190px', borderRadius: '50%', background: 'rgba(253,224,71,0.4)', filter: 'blur(55px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '21px', fontWeight: 900, letterSpacing: '0.02em' }}>Trips</h2>
              <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.85)', marginTop: '1px' }}>Plan it. Share it. Remember it.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setShowHistory(true)} style={roundButton} aria-label="Trip stories" title="Trip stories">
                <History size={17} />
              </button>
              <button type="button" onClick={() => setShowJoin(true)} style={roundButton} aria-label="Join a trip with a code" title="Join a trip with a code">
                <KeyRound size={17} />
              </button>
              <button type="button" onClick={() => setShowForm(true)} style={{ ...roundButton, background: 'linear-gradient(145deg, #ffffff, #e0f2fe)', color: '#4338ca', border: '1px solid #fff' }} aria-label="New trip" title="New trip">
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* A trip is being recorded, or start one now */}
          {active ? (
            <button type="button" onClick={() => setShowLive(true)} style={{ ...glass, width: '100%', borderRadius: '24px', padding: '12px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', cursor: 'pointer', textAlign: 'left', background: 'linear-gradient(145deg, rgba(16,185,129,0.5), rgba(255,255,255,0.12))' }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: '#34d399', boxShadow: '0 0 12px #34d399', flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>Trip in progress</span>
                <span style={{ display: 'block', fontSize: '14.5px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getMode(active.mode).emoji} {active.title}</span>
              </span>
              <span style={{ fontSize: '11px', fontWeight: 900, padding: '6px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.25)' }}>Open</span>
            </button>
          ) : (
            <button type="button" onClick={() => setShowQuick(true)} className="active:scale-[0.98]" style={{ ...glass, width: '100%', borderRadius: '24px', padding: '14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s ease' }}>
              <span style={{ width: 42, height: 42, borderRadius: 15, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: 'linear-gradient(145deg, #ffffff, #e0f2fe)', color: '#4338ca', boxShadow: '0 6px 12px rgba(20,10,80,0.3)' }}>▶</span>
              <span>
                <span style={{ display: 'block', fontSize: '14.5px', fontWeight: 900 }}>Start a trip now</span>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Just a name. Your story builds itself.</span>
              </span>
            </button>
          )}

          {ready && !user && <Note>🔐 Log in from the Me tab to invite friends or join a friend's trip. Solo trips work without logging in.</Note>}
          {cloudError && <Note>⚠️ {cloudError}</Note>}

          {/* Empty state */}
          {trips.length === 0 && (
            <div style={{ ...glass, borderRadius: '30px', padding: '30px 20px', textAlign: 'center', marginTop: '10px' }}>
              <div style={{ fontSize: '54px', marginBottom: '8px', filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.3))' }}>🗺️</div>
              <p style={{ fontSize: '16px', fontWeight: 900, marginBottom: '6px' }}>No planned trips yet</p>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.88)', lineHeight: 1.6, marginBottom: '18px' }}>
                Plan a journey, invite your people with one link, and watch the countdown begin.
              </p>
              <button type="button" onClick={() => setShowForm(true)} style={primaryButton}>Plan your first trip</button>
            </div>
          )}

          {/* Upcoming */}
          {live.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <SectionTitle>Upcoming</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {live.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onOpen={(t) => setDetailId(t.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Earlier / cancelled */}
          {finished.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <SectionTitle>Earlier</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {finished.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onOpen={(t) => setDetailId(t.id)} />
                ))}
              </div>
            </div>
          )}

          {SHOW_DEMO_BUTTON && !active && (
            <button type="button" onClick={() => begin({ title: 'Demo trip: Delhi to Agra', mode: 'car', demo: true })} style={{ display: 'block', margin: '8px auto 0', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: '11.5px', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' }}>
              🧪 Try a demo trip (no travelling needed)
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <NewTripForm user={user} ready={ready} displayName={displayName} onClose={() => setShowForm(false)} onGoToLogin={onGoToLogin} onSaved={reloadLocal} />
      )}

      {detailId && (
        <TripDetail
          trip={detailTrip}
          user={user}
          displayName={displayName}
          onClose={() => setDetailId(null)}
          onSoloChanged={reloadLocal}
          onStart={startPlanned}
          onSkip={skipPlanned}
          recordingAny={!!active}
        />
      )}

      {showJoin && <JoinByCode onClose={() => setShowJoin(false)} />}
      {showQuick && <QuickStart onStart={begin} onClose={() => setShowQuick(false)} />}
      {showLive && active && <LiveTrip onHide={() => setShowLive(false)} onComplete={completeTrip} onDiscard={discardTrip} />}
      {showHistory && <TripHistory trips={trips} onClose={() => setShowHistory(false)} onOpenStory={(entry) => setStory(entry)} />}
      {story && <TripStory entry={story} onClose={() => setStory(null)} onDeleted={() => setStory(null)} />}
      {building && <StoryBuilder message={building} />}
    </div>
  );
}
