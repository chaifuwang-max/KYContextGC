// src/App.jsx
// ✓ Imports ALL_SECTIONS from ./ALL_SECTIONS.js (must be in same src/ folder)
// ✓ No other external dependencies beyond React and Supabase
// ✓ To update section text: edit ALL_SECTIONS.js only — do not touch this file

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import ALL_SECTIONS from './ALL_SECTIONS.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CATEGORIES = [
  'membership','dues','discipline','elections','quorum','amendments',
  'scope','procedure','insignia','officers','committees','province',
  'ritual','hazing','finance'
];
const SEVERITIES = ['HARD_REJECT','HIGH','MEDIUM','INFO'];

export default function App() {
  const [selectedId, setSelectedId]         = useState(ALL_SECTIONS[0].id);
  const [annotations, setAnnotations]       = useState([]);
  const [userSessions, setUserSessions]     = useState([]);
  const [sessionId]                         = useState(() => `s-${Math.random().toString(36).slice(2,9)}`);
  const [username]                          = useState(() => `User ${Math.random().toString(36).slice(2,7).toUpperCase()}`);

  const [formText,     setFormText]         = useState('');
  const [formCategory, setFormCategory]     = useState('');
  const [formSeverity, setFormSeverity]     = useState('MEDIUM');
  const [formFlags,    setFormFlags]        = useState('');
  const [formSource,   setFormSource]       = useState('');

  const [showExport,   setShowExport]       = useState(false);
  const [exportBusy,   setExportBusy]       = useState(false);
  const [exportError,  setExportError]      = useState('');
  const [tokenEst,     setTokenEst]         = useState(0);

  const [search,       setSearch]           = useState('');
  const [onlyDone,     setOnlyDone]         = useState(false);
  const [openGroups,   setOpenGroups]       = useState(
    () => Object.fromEntries([...new Set(ALL_SECTIONS.map(s => s.group))].map(g => [g, true]))
  );
  const [saving,       setSaving]           = useState(false);
  const debounce = useRef(null);

  // ── Supabase real-time ─────────────────────────────────────────────────────
  useEffect(() => {
    loadAnnotations();
    upsertSession();

    const aCh = supabase.channel('annotations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'annotations' }, loadAnnotations)
      .subscribe();
    const sCh = supabase.channel('user_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_sessions' }, loadSessions)
      .subscribe();
    const tick = setInterval(upsertSession, 10000);

    return () => { aCh.unsubscribe(); sCh.unsubscribe(); clearInterval(tick); };
  }, []);

  useEffect(() => { upsertSession(); }, [selectedId]);

  async function loadAnnotations() {
    const { data } = await supabase.from('annotations').select('*');
    setAnnotations(data ?? []);
  }
  async function loadSessions() {
    const since = new Date(Date.now() - 60000).toISOString();
    const { data } = await supabase.from('user_sessions').select('*').gt('last_active', since);
    setUserSessions(data ?? []);
  }
  async function upsertSession() {
    await supabase.from('user_sessions').upsert(
      { id: sessionId, current_section: selectedId, username, last_active: new Date().toISOString() },
      { onConflict: 'id' }
    );
    loadSessions();
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────
  async function saveAnnotation() {
    if (!formText.trim()) return;
    const sec = ALL_SECTIONS.find(s => s.id === selectedId);
    setSaving(true);
    const { error } = await supabase.from('annotations').insert([{
      section_id:      selectedId,
      provision:       sec.provision,
      category:        formCategory || sec.defaultCategory,
      severity:        formSeverity,
      guidance:        formText,
      flags:           formFlags,
      source:          formSource,
      user_session_id: sessionId,
    }]);
    if (error) { alert('Save failed — check Supabase connection.'); }
    else { setFormText(''); setFormCategory(''); setFormSeverity('MEDIUM'); setFormFlags(''); setFormSource(''); loadAnnotations(); }
    setSaving(false);
  }
  async function deleteAnnotation(id) {
    if (!confirm('Delete this annotation?')) return;
    await supabase.from('annotations').delete().eq('id', id);
    loadAnnotations();
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  function openExportModal() {
    const annotated = new Set(annotations.map(a => a.section_id)).size;
    if (annotated < ALL_SECTIONS.length) {
      alert(`${annotated} / ${ALL_SECTIONS.length} sections annotated.\nAll sections must be annotated before export.`);
      return;
    }
    const chars = annotations.reduce((n,a) => n + (a.provision?.length??0) + (a.guidance?.length??0) + (a.flags?.length??0)*2, 0);
    setTokenEst(Math.ceil(chars / 4) + 500);
    setExportError('');
    setShowExport(true);
  }
  async function runExport() {
    setExportBusy(true);
    setExportError('');
    try {
      const res = await fetch('/.netlify/functions/generate-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annotations: annotations.map(a => ({
          provision: a.provision, category: a.category, severity: a.severity,
          guidance: a.guidance, flags: a.flags ? a.flags.split(',').map(f=>f.trim()) : [], source: a.source
        }))}),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Export failed');
      const { schema, tokenUsage } = await res.json();
      const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'kappa-psi-context-rules.json'; a.click();
      URL.revokeObjectURL(url);
      setShowExport(false);
      alert(`Export complete — ${tokenUsage.totalTokens} tokens used.`);
    } catch (e) { setExportError(e.message); }
    setExportBusy(false);
  }

  // ── Derived state ──────────────────────────────────────────────────────────
  const sel          = ALL_SECTIONS.find(s => s.id === selectedId) ?? ALL_SECTIONS[0];
  const secAnn       = annotations.filter(a => a.section_id === selectedId);
  const annotatedCnt = new Set(annotations.map(a => a.section_id)).size;
  const progress     = Math.round((annotatedCnt / ALL_SECTIONS.length) * 100);
  const groups       = [...new Set(ALL_SECTIONS.map(s => s.group))];
  const visible      = ALL_SECTIONS.filter(s => {
    if (onlyDone && !annotations.some(a => a.section_id === s.id)) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.provision.toLowerCase().includes(q) || s.group.toLowerCase().includes(q);
    }
    return true;
  });
  const visIdx       = visible.findIndex(s => s.id === selectedId);
  const others       = userSessions.filter(u => u.id !== sessionId && u.current_section === selectedId);

  // ── Severity colours ───────────────────────────────────────────────────────
  const sevStyle = {
    HARD_REJECT: { bg:'#fee2e2', color:'#991b1b' },
    HIGH:        { bg:'#fef3c7', color:'#78350f' },
    MEDIUM:      { bg:'#e0f2fe', color:'#0c4a6e' },
    INFO:        { bg:'#f0fdf4', color:'#166534' },
  };

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif', fontSize:'14px', background:'#f9f9f7', color:'#1a1a1a' }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <div style={{ width:280, borderRight:'0.5px solid #d5d5d0', overflowY:'auto', background:'#fafaf9', flexShrink:0 }}>

        {/* Search + filter */}
        <div style={{ padding:'12px', borderBottom:'0.5px solid #d5d5d0' }}>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search sections…"
            style={{ width:'100%', padding:'7px 9px', border:'0.5px solid #d5d5d0', borderRadius:6, fontSize:12, marginBottom:8, boxSizing:'border-box' }}
          />
          <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, cursor:'pointer', userSelect:'none' }}>
            <input type="checkbox" checked={onlyDone} onChange={e=>setOnlyDone(e.target.checked)} />
            Show only annotated
          </label>
          <div style={{ fontSize:11, color:'#999', marginTop:6 }}>{visible.length} / {ALL_SECTIONS.length} sections</div>
        </div>

        {/* Group rows */}
        {groups.map(g => {
          const gRows = visible.filter(s => s.group === g);
          if (!gRows.length) return null;
          const gCount = gRows.reduce((n,s) => n + annotations.filter(a=>a.section_id===s.id).length, 0);
          const open   = openGroups[g] !== false;
          return (
            <div key={g}>
              <button
                onClick={() => setOpenGroups(p => ({ ...p, [g]: !open }))}
                style={{ width:'100%', textAlign:'left', padding:'7px 10px', background:'transparent', border:'none', borderBottom:'0.5px solid #d5d5d0', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:10, fontWeight:600, color:'#666', textTransform:'uppercase', letterSpacing:'.07em' }}
              >
                <span>{g}</span>
                <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                  {gCount > 0 && <span style={{ fontSize:10, background:'#22c55e', color:'#fff', padding:'1px 6px', borderRadius:10, fontWeight:600 }}>{gCount}</span>}
                  <span style={{ fontSize:10 }}>{open ? '▼' : '▶'}</span>
                </span>
              </button>
              {open && gRows.map(s => {
                const cnt    = annotations.filter(a=>a.section_id===s.id).length;
                const active = s.id === selectedId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    style={{ width:'100%', textAlign:'left', padding:'6px 10px 6px 18px', background: active ? '#fff' : 'transparent', border:'none', borderBottom:'0.5px solid #d5d5d0', borderLeft: active ? '3px solid #CC2200' : '3px solid transparent', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:6 }}
                  >
                    <div>
                      <div style={{ fontSize:11, fontWeight:500, lineHeight:1.3, color: active ? '#000' : '#555' }}>{s.title}</div>
                      <div style={{ fontSize:10, color:'#aaa', marginTop:1 }}>{s.provision.length > 34 ? s.provision.slice(0,34)+'…' : s.provision}</div>
                    </div>
                    {cnt > 0 && <span style={{ fontSize:10, background:'#fbbf24', color:'#78350f', padding:'1px 6px', borderRadius:6, fontWeight:600, marginTop:1, flexShrink:0 }}>{cnt}</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ── MAIN PANEL ──────────────────────────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'14px 18px', borderBottom:'0.5px solid #d5d5d0', background:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
          <div>
            <h1 style={{ fontSize:15, fontWeight:500, margin:'0 0 3px', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ background:'#FFF0EE', color:'#CC2200', padding:'2px 9px', borderRadius:6, fontSize:13, fontWeight:600 }}>KΨ</span>
              Context Rule Builder
            </h1>
            <p style={{ fontSize:11, color:'#aaa', margin:0 }}>
              {annotatedCnt} / {ALL_SECTIONS.length} sections annotated · {annotations.length} total annotations
            </p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button
              onClick={openExportModal}
              disabled={annotatedCnt < ALL_SECTIONS.length}
              style={{ padding:'8px 16px', border:'0.5px solid #d5d5d0', borderRadius:8, cursor: annotatedCnt < ALL_SECTIONS.length ? 'not-allowed' : 'pointer', opacity: annotatedCnt < ALL_SECTIONS.length ? .45 : 1, background:'#fff', fontSize:13 }}
            >
              Export ({progress}%)
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height:3, background:'#e5e5e0' }}>
          <div style={{ height:'100%', width:`${progress}%`, background:'#CC2200', transition:'width .3s' }} />
        </div>

        {/* Section content */}
        <div style={{ flex:1, overflowY:'auto', padding:22 }}>

          {/* Nav info */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <span style={{ fontSize:11, color:'#bbb' }}>{visIdx >= 0 ? `${visIdx+1} / ${visible.length}` : ''}</span>
            {others.length > 0 && (
              <span style={{ fontSize:11, color:'#CC2200', fontWeight:500 }}>
                {others.map(u=>u.username).join(', ')} {others.length===1?'is':'are'} also viewing this section
              </span>
            )}
          </div>

          {/* Section badges */}
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:14 }}>
            <span style={{ fontSize:11, fontWeight:500, padding:'4px 10px', borderRadius:6, background:'#FFF0EE', color:'#CC2200', border:'0.5px solid #F5C4B3' }}>{sel.provision}</span>
            <span style={{ fontSize:11, padding:'4px 10px', borderRadius:6, background:'#f3f3f0', border:'0.5px solid #d5d5d0', color:'#555' }}>{sel.group}</span>
            <span style={{ fontSize:11, padding:'4px 10px', borderRadius:6, background:'#e0f2fe', border:'0.5px solid #bae6fd', color:'#0c4a6e' }}>{sel.defaultCategory}</span>
          </div>

          <h2 style={{ fontSize:19, fontWeight:500, marginBottom:16 }}>{sel.title}</h2>

          {/* Section text — verbatim from source */}
          <div style={{ background:'#fff', border:'0.5px solid #d5d5d0', borderRadius:8, padding:'14px 16px', marginBottom:20, whiteSpace:'pre-wrap', fontFamily:'"Courier New",Courier,monospace', fontSize:12.5, lineHeight:1.75, color:'#444' }}>
            {sel.text}
          </div>

          {/* Annotation form */}
          <div style={{ background:'#fff', border:'0.5px solid #d5d5d0', borderRadius:8, padding:16, marginBottom:20 }}>
            <h3 style={{ fontSize:13, fontWeight:500, marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>✏️ Add annotation</h3>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <span style={{ fontSize:11, fontWeight:500, color:'#777', textTransform:'uppercase', letterSpacing:'.05em' }}>Category</span>
                <select value={formCategory || sel.defaultCategory} onChange={e=>setFormCategory(e.target.value)}
                  style={{ padding:'7px 8px', border:'0.5px solid #d5d5d0', borderRadius:6, fontSize:13, background:'#fff' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <span style={{ fontSize:11, fontWeight:500, color:'#777', textTransform:'uppercase', letterSpacing:'.05em' }}>Severity</span>
                <select value={formSeverity} onChange={e=>setFormSeverity(e.target.value)}
                  style={{ padding:'7px 8px', border:'0.5px solid #d5d5d0', borderRadius:6, fontSize:13, background:'#fff' }}>
                  {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>

            <label style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:10 }}>
              <span style={{ fontSize:11, fontWeight:500, color:'#777', textTransform:'uppercase', letterSpacing:'.05em' }}>Guidance / Interpretation Notes</span>
              <textarea
                value={formText} onChange={e=>setFormText(e.target.value)}
                placeholder="How should this provision be interpreted? What patterns trigger this rule? What is prohibited or required?"
                style={{ padding:'8px', border:'0.5px solid #d5d5d0', borderRadius:6, fontSize:13, minHeight:100, resize:'vertical', lineHeight:1.6 }}
              />
            </label>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <span style={{ fontSize:11, fontWeight:500, color:'#777', textTransform:'uppercase', letterSpacing:'.05em' }}>Trigger Flags (comma-separated)</span>
                <input value={formFlags} onChange={e=>setFormFlags(e.target.value)}
                  placeholder='e.g. resignation, inactive, hazing'
                  style={{ padding:'7px 8px', border:'0.5px solid #d5d5d0', borderRadius:6, fontSize:13 }} />
              </label>
              <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <span style={{ fontSize:11, fontWeight:500, color:'#777', textTransform:'uppercase', letterSpacing:'.05em' }}>Source</span>
                <input value={formSource} onChange={e=>setFormSource(e.target.value)}
                  placeholder='e.g. Grand Council ruling 2019'
                  style={{ padding:'7px 8px', border:'0.5px solid #d5d5d0', borderRadius:6, fontSize:13 }} />
              </label>
            </div>

            <button
              onClick={saveAnnotation} disabled={!formText.trim() || saving}
              style={{ padding:'9px 20px', background: formText.trim() ? '#CC2200' : '#ccc', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:500, cursor: formText.trim() ? 'pointer' : 'not-allowed' }}
            >
              {saving ? '⏳ Saving…' : '+ Save annotation'}
            </button>
          </div>

          {/* Saved annotations */}
          {secAnn.length > 0 && (
            <div>
              <h3 style={{ fontSize:13, fontWeight:500, marginBottom:10 }}>
                {secAnn.length} annotation{secAnn.length !== 1 ? 's' : ''}
              </h3>
              {secAnn.map(a => {
                const sc = sevStyle[a.severity] ?? sevStyle.INFO;
                return (
                  <div key={a.id} style={{ background:'#fff', border:'0.5px solid #d5d5d0', borderRadius:8, padding:12, marginBottom:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        <span style={{ fontSize:10, padding:'2px 8px', borderRadius:4, fontWeight:600, background:sc.bg, color:sc.color }}>{a.severity}</span>
                        <span style={{ fontSize:10, padding:'2px 8px', borderRadius:4, background:'#f3f3f0', color:'#555' }}>{a.category}</span>
                      </div>
                      <button onClick={()=>deleteAnnotation(a.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#bbb', fontSize:13, padding:0, lineHeight:1 }}>✕</button>
                    </div>
                    <p style={{ fontSize:13, margin:'0 0 7px', lineHeight:1.65 }}>{a.guidance}</p>
                    {a.flags  && <div style={{ fontSize:11, color:'#777', marginBottom:3 }}>Flags: {a.flags}</div>}
                    {a.source && <div style={{ fontSize:11, color:'#aaa', fontStyle:'italic' }}>Source: {a.source}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── EXPORT MODAL ────────────────────────────────────────────────────── */}
      {showExport && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#fff', borderRadius:12, padding:26, maxWidth:480, width:'90%', boxShadow:'0 12px 40px rgba(0,0,0,.2)' }}>
            <h2 style={{ fontSize:17, fontWeight:500, marginBottom:10 }}>⚠️ Generate Schema with Claude Sonnet 4.6</h2>
            <p style={{ fontSize:13, color:'#555', marginBottom:12, lineHeight:1.6 }}>
              This will call Claude Sonnet 4.6 to convert all {annotations.length} annotations into the final CTX context-rule schema.
            </p>
            <div style={{ background:'#FFF0EE', border:'0.5px solid #F5C4B3', borderRadius:7, padding:12, marginBottom:14, fontSize:12, color:'#CC2200', lineHeight:1.7 }}>
              <strong>Token estimate:</strong> ~{tokenEst.toLocaleString()} (~${(tokenEst/1000*0.003).toFixed(4)})<br/>
              <strong>Processing time:</strong> ~10–30 seconds<br/>
              <strong>Note:</strong> Sonnet 4.6 is reserved only for this final export step.
            </div>
            <p style={{ fontSize:12, color:'#777', marginBottom:16, lineHeight:1.6 }}>
              Claude will validate all annotations, assign CTX-### IDs, generate examples, and return a downloadable JSON file.
            </p>
            {exportError && <p style={{ color:'#CC2200', fontSize:12, marginBottom:10 }}>❌ {exportError}</p>}
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button onClick={()=>setShowExport(false)} disabled={exportBusy} style={{ padding:'8px 16px', border:'0.5px solid #d5d5d0', borderRadius:8, background:'#fff', fontSize:13, cursor:'pointer' }}>Cancel</button>
              <button onClick={runExport} disabled={exportBusy} style={{ padding:'8px 18px', background:'#CC2200', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:500, cursor: exportBusy ? 'not-allowed' : 'pointer', opacity: exportBusy ? .6 : 1 }}>
                {exportBusy ? '⏳ Generating…' : '✓ Confirm Export'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ONLINE USERS PILL ───────────────────────────────────────────────── */}
      {userSessions.length > 1 && (
        <div style={{ position:'fixed', bottom:16, right:16, background:'#fff', border:'0.5px solid #d5d5d0', borderRadius:8, padding:'10px 14px', fontSize:11, boxShadow:'0 2px 10px rgba(0,0,0,.08)', zIndex:100 }}>
          <div style={{ fontWeight:600, color:'#777', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em', fontSize:10 }}>Online</div>
          {userSessions.slice(0,6).map(u => (
            <div key={u.id} style={{ display:'flex', alignItems:'center', gap:6, padding:'3px 0' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e' }} />
              <span>{u.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
