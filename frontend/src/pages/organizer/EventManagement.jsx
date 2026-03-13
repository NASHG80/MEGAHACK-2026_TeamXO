import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import OrganizerSidebar from '../../components/OrganizerSidebar';

/* ═══════════════════════ TIMELINE & PHASES ═══════════════════════ */
const PHASES = ['Check-In', 'Hacking', 'Lunch', 'Judging', 'Dinner', 'Results'];

// Timeline with 24h minutes for auto-advance
const TIMELINE_DEF = [
  { id: 1, startMin: 9*60,    time: '09:00 AM', label: 'Registration & Check-In Opens' },
  { id: 2, startMin: 10*60,   time: '10:00 AM', label: 'Hacking Begins' },
  { id: 3, startMin: 13*60,   time: '01:00 PM', label: 'Lunch Distribution' },
  { id: 4, startMin: 16*60,   time: '04:00 PM', label: 'Submission Deadline' },
  { id: 5, startMin: 17*60,   time: '05:00 PM', label: 'Judging Panel Begins' },
  { id: 6, startMin: 19*60,   time: '07:00 PM', label: 'Dinner Distribution' },
  { id: 7, startMin: 20*60,   time: '08:00 PM', label: 'Results & Prize Distribution' },
];

/* ── Derive timeline statuses from current time ── */
function computeTimeline(nowMin) {
  return TIMELINE_DEF.map((t, i) => {
    const nextStart = TIMELINE_DEF[i + 1]?.startMin ?? Infinity;
    let status = 'upcoming';
    if (nowMin >= nextStart) status = 'done';
    else if (nowMin >= t.startMin) status = 'active';
    return { ...t, status };
  });
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/* ═══════════════════════ ATOMS ═══════════════════════ */
function Toast({ t }) {
  if (!t) return null;
  return (
    <div style={{ position: 'fixed', bottom: '90px', right: '24px', zIndex: 9999, background: '#0f172a', color: '#fff', padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', animation: 'toastIn .3s ease' }}>
      <CheckCircle2 size={16} style={{ color: '#4ade80', flexShrink: 0 }} />{t}
    </div>
  );
}

/* ═══════════════════════ EVENT HEADER  ═══════════════════════ */
function EventHeader({ hackId, hackathon, timeline }) {
  const activePhase = 1; // for phase stepper (static)

  return (
    <div style={{ background: 'linear-gradient(160deg,#f8fafc 0%,#ffffff 100%)', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', padding: '28px 32px', marginBottom: '24px' }}>

      {/* ── Row 1: Title + meta ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '20px', padding: '3px 12px', fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              LIVE
            </span>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>ID: {hackId}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, color: '#0A1628', margin: '0 0 10px 0', letterSpacing: '-0.3px' }}>{hackathon ? hackathon.title : 'No Active Event'}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0', alignItems: 'center' }}>
            {[hackathon?.deadline || 'TBD', hackathon ? 'Event Ongoing' : 'No details'].map((v, i, arr) => (
              <span key={v} style={{ fontSize: '13px', color: '#64748b' }}>
                {v}{i < arr.length - 1 && <span style={{ margin: '0 10px', color: '#cbd5e1' }}>|</span>}
              </span>
            ))}
          </div>
        </div>
        {/* Phase stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto', maxWidth: '520px' }}>
          {PHASES.map((p, i) => {
            const done = i < activePhase, act = i === activePhase;
            return (
              <div key={p} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ padding: '0 10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: act ? 700 : done ? 600 : 400, color: act ? '#1E64FF' : done ? '#94a3b8' : '#94a3b8', textDecoration: done ? 'line-through' : 'none', paddingBottom: '4px', borderBottom: act ? '2px solid #1E64FF' : '2px solid transparent', whiteSpace: 'nowrap', display: 'block', transition: 'all .2s' }}>
                    {done ? `✓ ${p}` : p}
                  </span>
                </div>
                {i < PHASES.length - 1 && <span style={{ color: '#e2e8f0', fontSize: '13px' }}>›</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Row 2: Timeline strip (horizontal, real-time) ── */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '18px', marginBottom: '18px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '14px' }}>Event Timeline</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', overflowX: 'auto', paddingBottom: '4px' }}>
          {timeline.map((t, i) => {
            const done = t.status === 'done', act = t.status === 'active';
            const dotColor = done ? '#22c55e' : act ? '#1E64FF' : '#cbd5e1';
            const labelColor = done ? '#22c55e' : act ? '#1E64FF' : '#94a3b8';
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px', maxWidth: '130px', padding: '0 6px' }}>
                  {/* Dot + connector */}
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '8px' }}>
                    {i > 0 && <div style={{ flex: 1, height: '2px', background: done ? '#22c55e' : '#e2e8f0', transition: 'background .5s' }} />}
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: dotColor, flexShrink: 0, boxShadow: act ? '0 0 0 4px rgba(30,100,255,0.15)' : undefined, animation: act ? 'pulse 2s infinite' : undefined, transition: 'background .5s' }} />
                    {i < timeline.length - 1 && <div style={{ flex: 1, height: '2px', background: act || done ? (done ? '#22c55e' : '#e2e8f0') : '#e2e8f0', transition: 'background .5s' }} />}
                  </div>
                  {/* Label + time */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: act || done ? 700 : 500, color: labelColor, lineHeight: 1.3, marginBottom: '3px', whiteSpace: 'nowrap' }}>{t.label}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.time}</div>
                    {act && <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '10px', fontWeight: 700, color: '#1E64FF', background: 'rgba(30,100,255,0.08)', padding: '2px 8px', borderRadius: '20px' }}>Now</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ SECTION 1 — WORKSPACE ASSIGNMENT ═══════════════════════ */
function WorkspaceSection({ workspaces, setWorkspaces, teams, showToast, hackId }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAdd, setShowAdd]           = useState(false);
  const [assigningId, setAssigningId]   = useState(null);
  const [assignForm, setAssignForm]     = useState({});
  const [newWS, setNewWS]               = useState({ floor: '', type: 'Lab', number: '', capacity: '', note: '' });
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [autoPreview, setAutoPreview]     = useState([]);   // [{team, wsId, wsNumber, slots[]}]

  /* ---- helpers ---- */
  const assignedTeamIds = workspaces.flatMap(w => w.assignedTeams.map(t => t.teamId));
  const unassignedTeams = teams.filter(t => !assignedTeamIds.includes(t.teamId));

  const wsStatus = (ws) => {
    const used = ws.assignedTeams.reduce((s, t) => s + t.slots.length, 0);
    if (used === 0) return 'available';
    if (used >= ws.workstations) return 'full';
    return 'partial';
  };

  const occupiedSlots = (ws) => {
    const s = new Set();
    ws.assignedTeams.forEach(t => t.slots.forEach(idx => s.add(idx)));
    return s;
  };

  const filtered = workspaces.filter(w => {
    if (statusFilter === 'All') return true;
    return wsStatus(w) === statusFilter.toLowerCase();
  });

  /* ---- add workspace ---- */
  const handleAdd = async () => {
    if (!newWS.floor || !newWS.number || !newWS.capacity) {
      showToast('Please fill in Floor, Number, and Workstations');
      return;
    }
    const token = localStorage.getItem('hf_token');
    try {
      const res = await fetch(`http://localhost:5000/api/organizer/events/${hackId}/workspaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newWS)
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(p => [...p, data.workspace]);
        showToast(`${newWS.type} ${newWS.number} added`);
        setNewWS({ floor: '', type: 'Lab', number: '', capacity: '', note: '' });
        setShowAdd(false);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || `Error: ${res.status}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error adding workspace');
    }
  };

  /* ---- AUTO ASSIGN logic ---- */
  const computeAutoAssign = () => {
    if (unassignedTeams.length === 0) return [];

    const wsPool = workspaces
      .map(w => {
        const taken = occupiedSlots(w);
        const free  = Array.from({ length: w.workstations }, (_, i) => i).filter(i => !taken.has(i));
        return { id: w.id, number: w.number, floor: w.floor, freeSlots: free };
      })
      .filter(w => w.freeSlots.length > 0)
      .sort((a, b) => b.freeSlots.length - a.freeSlots.length);

    const assignments = [];

    for (const team of unassignedTeams) {
      // Each team gets exactly 1 workstation
      for (let i = 0; i < wsPool.length; i++) {
        if (wsPool[i].freeSlots.length > 0) {
          const slot = wsPool[i].freeSlots.shift(); // take just 1 slot
          assignments.push({ team, wsId: wsPool[i].id, wsNumber: wsPool[i].number, wsFloor: wsPool[i].floor, slots: [slot] });
          break;
        }
      }
    }
    return assignments;
  };

  const openAutoModal = () => {
    const preview = computeAutoAssign();
    setAutoPreview(preview);
    setShowAutoModal(true);
  };

  const handleAutoConfirm = async () => {
    if (autoPreview.length === 0) return;
    const token = localStorage.getItem('hf_token');
    
    // Map to the format expected by the backend assign API
    const assignments = autoPreview.map(a => ({
      wsId: a.wsId,
      teamId: a.team.teamId,
      teamName: a.team.name,
      college: a.team.college,
      slots: a.slots
    }));

    try {
      const res = await fetch(`http://localhost:5000/api/organizer/events/${hackId}/workspaces/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ assignments })
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces);
        const teamCount = new Set(autoPreview.map(a => a.team.teamId)).size;
        showToast(`${teamCount} team${teamCount !== 1 ? 's' : ''} auto-assigned successfully`);
        setShowAutoModal(false);
        setAutoPreview([]);
      }
    } catch (err) {
      console.error(err);
      showToast('Error auto-assigning teams');
    }
  };

  /* ---- open assign form ---- */
  const openAssignForm = (wsId) => {
    setAssigningId(wsId);
    const def = unassignedTeams[0];
    setAssignForm({ teamId: def?.teamId || '', selectedSlots: new Set() });
  };

  /* ---- toggle a WS chip (radio — only 1 per assignment) ---- */
  const toggleSlot = (idx, ws) => {
    if (!assigningId || assigningId !== ws.workspaceId) return;
    const occupied = occupiedSlots(ws);
    if (occupied.has(idx)) return;
    setAssignForm(f => {
      // If already selected, deselect; otherwise select only this one (radio)
      const already = f.selectedSlots?.has(idx);
      return { ...f, selectedSlots: already ? new Set() : new Set([idx]) };
    });
  };

  /* ---- assign ---- */
  const handleAssign = async (wsId) => {
    const { teamId, selectedSlots } = assignForm;
    if (!teamId || selectedSlots.size === 0) return;
    const team = teams.find(t => t.teamId === teamId);
    const ws   = workspaces.find(w => w.workspaceId === wsId);
    const slots = [...selectedSlots].sort((a, b) => a - b);
    
    const token = localStorage.getItem('hf_token');
    
    try {
      const res = await fetch(`http://localhost:5000/api/organizer/events/${hackId}/workspaces/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          assignments: [{
            wsId,
            teamId: team.teamId,
            teamName: team.name,
            college: team.college,
            slots
          }] 
        })
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces);
        showToast(`${team.name} assigned to ${ws.number}`);
        setAssigningId(null);
        setAssignForm({});
      }
    } catch (err) {
      console.error(err);
      showToast('Error assigning team');
    }
  };

  /* ---- remove team ---- */
  const removeTeam = async (wsId, teamId) => {
    const token = localStorage.getItem('hf_token');
    try {
      const res = await fetch(`http://localhost:5000/api/organizer/events/${hackId}/workspaces/${wsId}/teams/${teamId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces);
        showToast(`Team removed`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error removing team');
    }
  };

  /* ---- status colors ---- */
  const DOT    = { available: '#22c55e', partial: '#f59e0b', full: '#ef4444' };
  const BG     = { available: '#f0fdf4', partial: 'rgba(245,158,11,0.04)', full: 'rgba(239,68,68,0.04)' };
  const BORDER = { available: '#dcfce7', partial: 'rgba(245,158,11,0.15)',  full: 'rgba(239,68,68,0.12)' };
  const LBORDER= { available: '#22c55e', partial: '#f59e0b',                full: '#ef4444' };

  /* ---- summary counts ---- */
  const statCounts  = workspaces.reduce((acc, w) => { const s = wsStatus(w); acc[s] = (acc[s]||0)+1; return acc; }, {});
  const totalWS     = workspaces.reduce((s, w) => s + w.workstations, 0);
  const allocatedWS = workspaces.reduce((s, w) => s + w.assignedTeams.reduce((a, t) => a + t.slots.length, 0), 0);

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: '20px' }}>

      {/* ══════ AUTO ASSIGN MODAL ══════ */}
      {showAutoModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,22,40,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => e.target === e.currentTarget && setShowAutoModal(false)}>
          <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 24px 80px rgba(0,0,0,0.18)', width: '100%', maxWidth: '620px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', animation: 'slideDown .25s ease' }}>

            {/* Modal header */}
            <div style={{ padding: '22px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0A1628', marginBottom: '4px' }}>Auto Assign Preview</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {autoPreview.length > 0
                    ? `${new Set(autoPreview.map(a => a.team.id)).size} teams will be assigned across ${new Set(autoPreview.map(a => a.wsId)).size} workspace${new Set(autoPreview.map(a => a.wsId)).size !== 1 ? 's' : ''}`
                    : 'No unassigned teams or no free workstations available'}
                </div>
              </div>
              <button onClick={() => setShowAutoModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '16px', cursor: 'pointer', color: '#64748b', lineHeight: 1 }}>×</button>
            </div>

            {/* Modal body */}
            <div style={{ overflowY: 'auto', padding: '20px 28px', flex: 1 }}>
              {autoPreview.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <CheckCircle2 size={32} style={{ marginBottom: '10px', color: '#22c55e' }} />
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>All teams are already assigned</div>
                </div>
              ) : (
                // Group by workspace
                Object.values(
                  autoPreview.reduce((acc, a) => {
                    if (!acc[a.wsId]) acc[a.wsId] = { wsNumber: a.wsNumber, wsFloor: a.wsFloor, items: [] };
                    acc[a.wsId].items.push(a);
                    return acc;
                  }, {})
                ).map((group, gi) => (
                  <div key={gi} style={{ marginBottom: '16px' }}>
                    {/* Workspace label */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0A1628' }}>{group.wsNumber}</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{group.wsFloor}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 700, color: '#1E64FF', background: 'rgba(30,100,255,0.08)', padding: '2px 10px', borderRadius: '20px' }}>
                        {group.items.reduce((s, a) => s + a.slots.length, 0)} WS used
                      </span>
                    </div>
                    {/* Teams in this workspace */}
                    {group.items.map((a, ti) => (
                      <div key={ti} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', marginBottom: '6px', border: '1px solid #f1f5f9' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A1628' }}>{a.team.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{a.team.college} · {a.team.members} members</div>
                        </div>
                        {/* Slot badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end' }}>
                          {a.slots.map(s => (
                            <span key={s} style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(30,100,255,0.12)', color: '#1E64FF', border: '1px solid rgba(30,100,255,0.2)' }}>
                              WS-{String(s + 1).padStart(2, '0')}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Modal footer */}
            <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAutoModal(false)}
                style={{ padding: '10px 22px', borderRadius: '10px', background: '#f1f5f9', color: '#64748b', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAutoConfirm} disabled={autoPreview.length === 0}
                style={{ padding: '10px 26px', borderRadius: '10px', background: autoPreview.length > 0 ? 'linear-gradient(135deg,#1E64FF,#4D8EFF)' : '#e2e8f0', color: autoPreview.length > 0 ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: '14px', border: 'none', cursor: autoPreview.length > 0 ? 'pointer' : 'not-allowed' }}>
                Confirm & Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ padding: '20px 26px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#0A1628' }}>Workspace Assignment</div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>Assign teams manually or auto-assign all at once · click chips to pick individual workstations</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {unassignedTeams.length > 0 && (
            <button onClick={openAutoModal} className="btn-hover"
              style={{ padding: '9px 18px', borderRadius: '10px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ fontSize: '16px', lineHeight: 1 }}>⚡</span> Auto Assign
            </button>
          )}
          <button onClick={() => setShowAdd(v => !v)} className="btn-hover" style={{ padding: '9px 18px', borderRadius: '10px', background: 'linear-gradient(135deg,#1E64FF,#4D8EFF)', color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
            + Add Workspace
          </button>
        </div>
      </div>

      {/* ── Summary bar ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
        {[
          ['Available', statCounts.available || 0, '#22c55e'],
          ['Partial',   statCounts.partial   || 0, '#f59e0b'],
          ['Full',      statCounts.full      || 0, '#ef4444'],
        ].map(([label, count, color]) => (
          <div key={label} style={{ padding: '11px 22px', display: 'flex', alignItems: 'center', gap: '7px', borderRight: '1px solid #f1f5f9' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block' }} />
            <span style={{ fontSize: '13px', color: '#64748b' }}>{label}:</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{count}</span>
          </div>
        ))}
        <div style={{ padding: '11px 22px', display: 'flex', alignItems: 'center', gap: '7px', borderRight: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Total Workstations:</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{totalWS}</span>
        </div>
        <div style={{ padding: '11px 22px', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Allocated:</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E64FF' }}>{allocatedWS}</span>
        </div>
      </div>

      {/* ── Add workspace form ── */}
      {showAdd && (
        <div style={{ padding: '20px 26px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', animation: 'slideDown .25s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px', marginBottom: '12px' }}>
            {[['Floor', 'floor', 'text', 'e.g. Ground Floor'], ['Number', 'number', 'text', 'e.g. Lab 1'], ['Workstations', 'capacity', 'number', '30'], ['Note (optional)', 'note', 'text', 'e.g. Has projector']].map(([label, key, type, ph]) => (
              <div key={key}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
                <input type={type} placeholder={ph} value={newWS[key]} onChange={e => setNewWS(p => ({ ...p, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 13px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' }}
                  onFocus={e => e.target.style.borderColor = '#1E64FF'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</label>
              <select value={newWS.type} onChange={e => setNewWS(p => ({ ...p, type: e.target.value }))}
                style={{ width: '100%', padding: '9px 13px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff', cursor: 'pointer' }}>
                {['Lab', 'Room', 'CR', 'Hall', 'Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleAdd} className="btn-hover" style={{ padding: '9px 22px', borderRadius: '10px', background: 'linear-gradient(135deg,#1E64FF,#4D8EFF)', color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}>Add Workspace</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: '9px 18px', borderRadius: '10px', background: '#f1f5f9', color: '#64748b', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', padding: '0 14px' }}>
        {['All', 'Available', 'Partial', 'Full'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: '12px 16px', fontSize: '13px', fontWeight: statusFilter === s ? 700 : 500, color: statusFilter === s ? '#1E64FF' : '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: statusFilter === s ? '2px solid #1E64FF' : '2px solid transparent', whiteSpace: 'nowrap', transition: 'all .15s' }}>
            {s}
          </button>
        ))}
      </div>

      {/* ── Workspace cards ── */}
      <div style={{ padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px', maxHeight: '600px', overflowY: 'auto' }}>
        {filtered.map(ws => {
          const st       = wsStatus(ws);
          const occupied = occupiedSlots(ws);
          const usedCount= occupied.size;
          const avail    = ws.workstations - usedCount;
          const pct      = ws.workstations > 0 ? Math.round((usedCount / ws.workstations) * 100) : 0;
          const isAssigning = assigningId === ws.workspaceId;
          const pickable    = unassignedTeams;

          return (
            <div key={ws.workspaceId} className="ws-card"
              style={{ background: BG[st], border: `1px solid ${BORDER[st]}`, borderLeft: `4px solid ${LBORDER[st]}`, borderRadius: '14px', padding: '18px', transition: 'all .2s', display: 'flex', flexDirection: 'column' }}>

              {/* ── Card header ── */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: DOT[st], display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#0A1628' }}>{ws.number}</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: DOT[st], background: `${DOT[st]}18`, borderRadius: '20px', padding: '3px 11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{st}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: ws.note ? '4px' : '12px' }}>{ws.floor} · {ws.workstations} workstations</div>
              {ws.note && <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', fontStyle: 'italic' }}>{ws.note}</div>}

              <div style={{ height: '1px', background: '#f1f5f9', marginBottom: '12px' }} />

              {/* ── Stats ── */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Available: <b style={{ color: '#22c55e' }}>{avail}</b></span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Used: <b style={{ color: '#1E64FF' }}>{usedCount}</b></span>
              </div>
              <div style={{ height: '7px', borderRadius: '4px', background: '#e2e8f0', marginBottom: '12px', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg,#1E64FF,#4D8EFF)', width: `${pct}%`, transition: 'width .5s ease' }} />
              </div>

              <div style={{ height: '1px', background: '#f1f5f9', marginBottom: '12px' }} />

              {/* ── Assigned teams ── */}
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Teams</div>
              {ws.assignedTeams.length === 0 && (
                <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px', fontStyle: 'italic' }}>No teams assigned yet</div>
              )}
              {ws.assignedTeams.map(t => (
                <div key={t.teamId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(30,100,255,0.06)', border: '1px solid rgba(30,100,255,0.12)', borderRadius: '9px', padding: '8px 12px', marginBottom: '6px', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E64FF', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.teamName} <span style={{ fontWeight: 400, color: '#64748b' }}>· {t.college} · {t.slots.length} WS</span>
                  </span>
                  <button onClick={() => removeTeam(ws.workspaceId, t.teamId)}
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 700, padding: '3px 8px', flexShrink: 0 }}>×</button>
                </div>
              ))}

              <div style={{ height: '1px', background: '#f1f5f9', marginBottom: '12px' }} />

              {/* ── Workstation chips ── */}
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Workstations {isAssigning && <span style={{ color: '#1E64FF', textTransform: 'none', fontWeight: 500 }}>— click one to select</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
                {Array.from({ length: ws.workstations }, (_, i) => {
                  const isOccupied  = occupied.has(i);
                  const isSelected  = isAssigning && assignForm.selectedSlots?.has(i);
                  const isClickable = isAssigning && !isOccupied;

                  let bg, color, border;
                  if (isOccupied)       { bg = 'rgba(30,100,255,0.12)'; color = '#1E64FF'; border = 'rgba(30,100,255,0.2)'; }
                  else if (isSelected)  { bg = 'rgba(34,197,94,0.15)';  color = '#16a34a'; border = 'rgba(34,197,94,0.3)'; }
                  else                  { bg = '#f1f5f9';               color = '#94a3b8'; border = '#e2e8f0'; }

                  return (
                    <span key={i}
                      onClick={() => isClickable && toggleSlot(i, ws)}
                      title={isOccupied ? 'Allocated' : isSelected ? 'Selected (click to deselect)' : isAssigning ? 'Click to select' : 'Free'}
                      style={{ fontSize: '10px', fontWeight: 600, padding: '3px 6px', borderRadius: '5px', background: bg, color, border: `1px solid ${border}`, letterSpacing: '0.3px', cursor: isClickable ? 'pointer' : 'default', userSelect: 'none', transition: 'all .15s', outline: isSelected ? '2px solid #22c55e' : 'none' }}>
                      {`WS-${String(i + 1).padStart(2, '0')}`}
                    </span>
                  );
                })}
              </div>

              <div style={{ height: '1px', background: '#f1f5f9', marginBottom: '12px' }} />

              {/* ── Inline assign form ── */}
              {isAssigning ? (
                <div style={{ animation: 'slideDown .2s ease' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Select Team</label>
                    <select value={assignForm.teamId || ''}
                      onChange={e => setAssignForm(f => ({ ...f, teamId: e.target.value, selectedSlots: new Set() }))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                      <option value="">Select team...</option>
                      {pickable.map(t => <option key={t.teamId} value={t.teamId}>{t.name} · {t.college}</option>)}
                    </select>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                    {assignForm.selectedSlots?.size > 0
                      ? <span style={{ color: '#16a34a', fontWeight: 700 }}>{assignForm.selectedSlots.size} workstation{assignForm.selectedSlots.size !== 1 ? 's' : ''} selected</span>
                      : <span style={{ color: '#f59e0b' }}>Click chips above to select workstations</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleAssign(ws.workspaceId)}
                      disabled={!assignForm.teamId || !assignForm.selectedSlots?.size}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '9px', background: assignForm.teamId && assignForm.selectedSlots?.size ? 'linear-gradient(135deg,#1E64FF,#4D8EFF)' : '#e2e8f0', color: assignForm.teamId && assignForm.selectedSlots?.size ? '#fff' : '#94a3b8', border: 'none', fontSize: '13px', fontWeight: 700, cursor: assignForm.teamId && assignForm.selectedSlots?.size ? 'pointer' : 'not-allowed' }}>Assign</button>
                    <button onClick={() => { setAssigningId(null); setAssignForm({}); }}
                      style={{ padding: '8px 12px', borderRadius: '9px', background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {pickable.length > 0 && avail > 0 && (
                    <button onClick={() => openAssignForm(ws.workspaceId)}
                      style={{ flex: 1, padding: '9px 12px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E64FF,#4D8EFF)', color: '#fff', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Assign Team</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════ SECTION 2a — TEAM ENTRY PANEL ═══════════════════════ */
function TeamEntryPanel({ teams, setTeams, showToast, hackId }) {
  const [expandedTeam, setExpandedTeam] = useState(null);

  const enteredTeams = teams.filter(t => t.entered);
  const absentTeams  = teams.filter(t => !t.entered);

  const toggleMember = async (teamId, member, currentStatus) => {
    const newStatus = currentStatus === 'absent' ? 'present' : 'absent';
    const token = localStorage.getItem('hf_token');
    
    try {
      const res = await fetch(`http://localhost:5000/api/organizer/events/${hackId}/teams/${teamId}/member`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ memberName: member, status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        // Update local team state
        setTeams(prev => prev.map(t => t.teamId === teamId ? data.team : t));
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating status');
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 26px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: '17px', fontWeight: 700, color: '#0A1628' }}>Team Entry Tracker</div>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>Live check-in status for all registered teams</div>
      </div>

      <div style={{ padding: '22px 26px', flex: 1 }}>
        {/* Progress bar */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A1628' }}>{enteredTeams.length} / {teams.length} Teams Entered</div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E64FF' }}>{Math.round((enteredTeams.length / teams.length) * 100)}%</span>
          </div>
          <div style={{ height: '7px', borderRadius: '4px', background: '#f1f5f9' }}>
            <div style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg,#1E64FF,#4D8EFF)', width: `${(enteredTeams.length / teams.length) * 100}%`, transition: 'width .8s ease' }} />
          </div>
        </div>

        {absentTeams.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#22c55e' }}>
            <CheckCircle2 size={28} style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '14px', fontWeight: 700 }}>All teams have entered</div>
          </div>
        )}

        {/* Entered */}
        {enteredTeams.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '9px' }}>Entered ({enteredTeams.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
              {enteredTeams.map(team => (
                <div key={team.teamId}>
                  <div onClick={() => setExpandedTeam(expandedTeam === team.teamId ? null : team.teamId)} className="team-card"
                    style={{ borderLeft: '3px solid #22c55e', background: expandedTeam === team.teamId ? 'rgba(34,197,94,0.06)' : 'rgba(34,197,94,0.03)', borderRadius: '0 10px 10px 0', padding: '11px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all .15s' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A1628' }}>{team.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{team.college}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#22c55e' }}>{team.entryTime}</span>
                      <ChevronDown size={14} style={{ color: '#94a3b8', transform: expandedTeam === team.teamId ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }} />
                    </div>
                  </div>
                  {expandedTeam === team.teamId && (
                    <div style={{ background: '#fafafa', borderRadius: '0 0 10px 10px', padding: '10px 14px', animation: 'slideDown .2s ease' }}>
                      {team.memberNames.map(member => {
                        const st  = team.memberStatus?.[member] || 'absent';
                        return (
                          <div key={member} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ fontSize: '13px', color: '#334155' }}>{member}</span>
                            <button onClick={() => toggleMember(team.teamId, member, st)} style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', background: st === 'present' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: st === 'present' ? '#16a34a' : '#dc2626' }}>
                              {st === 'present' ? 'Present' : 'Absent'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Absent */}
        {absentTeams.length > 0 && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '9px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <AlertTriangle size={12} /> Absent ({absentTeams.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
              {absentTeams.map(team => (
                <div key={team.teamId} style={{ borderLeft: '3px solid #ef4444', background: 'rgba(239,68,68,0.04)', borderRadius: '0 10px 10px 0', padding: '11px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A1628' }}>{team.name}</div>
                    <div style={{ fontSize: '12px', color: '#ef4444' }}>{team.college} · Not yet checked in</div>
                  </div>
                  <button onClick={() => showToast(`Reminder sent to ${team.name} coordinator`)} style={{ padding: '6px 12px', borderRadius: '8px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Send Reminder
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════ SECTION 2b — SOS PANEL ═══════════════════════ */
function SOSPanel({ sosRequests, setSosRequests, showToast, hackId }) {
  const resolveSOS = async (sosId) => {
    const token = localStorage.getItem('hf_token');
    try {
      const res = await fetch(`http://localhost:5000/api/organizer/events/${hackId}/sos/${sosId}/resolve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSosRequests(p => p.filter(r => r.sosId !== sosId));
        showToast('SOS request resolved');
      }
    } catch (err) {
      console.error(err);
      showToast('Error resolving SOS');
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 26px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#0A1628', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} style={{ color: sosRequests.length > 0 ? '#ef4444' : '#94a3b8' }} />
            SOS Help Requests
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>Real-time help requests from participants</div>
        </div>
        {sosRequests.length > 0 && (
          <span style={{ background: '#ef4444', color: '#fff', borderRadius: '20px', padding: '3px 12px', fontSize: '13px', fontWeight: 800, flexShrink: 0 }}>{sosRequests.length}</span>
        )}
      </div>

      <div style={{ padding: '22px 26px', flex: 1 }}>
        {sosRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <CheckCircle2 size={32} style={{ marginBottom: '10px', color: '#22c55e' }} />
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#22c55e' }}>All clear</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>No active SOS requests</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sosRequests.map(r => (
              <div key={r.sosId} style={{ borderLeft: '4px solid #ef4444', background: 'rgba(239,68,68,0.04)', borderRadius: '0 14px 14px 0', padding: '14px 16px', border: '1px solid rgba(239,68,68,0.1)', borderLeft: '4px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A1628', marginBottom: '3px' }}>
                      {r.name} <span style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8' }}>· {r.workspace}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#ef4444', fontStyle: 'italic', marginBottom: '4px' }}>"{r.message}"</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{r.time}</div>
                  </div>
                  <button onClick={() => resolveSOS(r.sosId)}
                    style={{ padding: '7px 15px', borderRadius: '9px', background: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN ═══════════════════════ */
export default function EventManagement() {
  const { id: hackathonIdParam } = useParams();
  const hackathonId = hackathonIdParam || 'HF-001';
  
  const [sbOpen, setSbOpen]             = useState(true);
  const [workspaces, setWorkspaces]     = useState([]);
  const [teams, setTeams]               = useState([]);
  const [sosRequests, setSosRequests]   = useState([]);
  const [hackathon, setHackathon]       = useState(null);
  const [toast, setToast]               = useState(null);
  // Real-time timeline — recompute every 30 seconds
  const [timeline, setTimeline]         = useState(() => computeTimeline(nowMinutes()));

  useEffect(() => {
    setTimeline(computeTimeline(nowMinutes()));
    const iv = setInterval(() => setTimeline(computeTimeline(nowMinutes())), 30_000);
    return () => clearInterval(iv);
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('hf_token');
    try {
      const res = await fetch(`http://localhost:5000/api/organizer/events/${hackathonId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces || []);
        setTeams(data.teams || []);
        setSosRequests(data.sosRequests || []);
      }
      
      const hackRes = await fetch(`http://localhost:5000/api/hackathons/${hackathonId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (hackRes.ok) {
        const hData = await hackRes.json();
        setHackathon(hData.hackathon || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 15s for live updates
    const iv = setInterval(fetchData, 15_000);
    return () => clearInterval(iv);
  }, [hackathonId]);

  const handleSeed = async () => {
    const token = localStorage.getItem('hf_token');
    try {
      const res = await fetch(`http://localhost:5000/api/organizer/events/${hackathonId}/seed`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        showToast('Database seeded successfully!');
      }
    } catch (err) {
      console.error(err);
      showToast('Error seeding database');
    }
  };

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.2)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
        .btn-hover:hover{opacity:0.88;transform:translateY(-1px);}
        .ws-card:hover{transform:translateY(-2px);box-shadow:0 4px 20px rgba(30,100,255,0.1)!important;}
        .team-card:hover{transform:translateX(3px);}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px;}
      `}</style>

      <OrganizerSidebar open={sbOpen} onToggle={() => setSbOpen(o => !o)} />
      <Toast t={toast} />

      <div style={{ transition: 'padding-left .3s', paddingLeft: sbOpen ? '240px' : '64px' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '24px 22px 100px' }}>
          
          <EventHeader hackId={hackathonId || 'HF-001'} hackathon={hackathon} timeline={timeline} />
          <WorkspaceSection workspaces={workspaces} setWorkspaces={setWorkspaces} teams={teams} showToast={showToast} hackId={hackathonId} />
          {/* Team Entry + SOS side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>
            <TeamEntryPanel teams={teams} setTeams={setTeams} showToast={showToast} hackId={hackathonId} />
            <SOSPanel sosRequests={sosRequests} setSosRequests={setSosRequests} showToast={showToast} hackId={hackathonId} />
          </div>
        </div>
      </div>
    </div>
  );
}