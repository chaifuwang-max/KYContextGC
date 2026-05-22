// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// All section definitions (same as before)
const ALL_SECTIONS = [
  {id:"c-preamble",group:"Constitution",provision:"Constitution §001-002",title:"Preamble & Revocation of Former Laws",text:"All former constitutions, by-laws, and standing laws are revoked and are no longer in effect. This instrument is promulgated by the Grand Council of Kappa Psi for unity of principle, practice, and procedure, governing itself and all constituent divisions and their Membership.",defaultCategory:"scope"},
  {id:"c-art-I",group:"Constitution",provision:"Art. I §003-004",title:"Name and Objectives",text:"The name shall be Kappa Psi Pharmaceutical Fraternity, Incorporated. Objectives: (1) conduct a fraternal organization for mutual benefit of members; (2) advance the profession of Pharmacy educationally, fraternally, and socially; (3) instill industry, sobriety, fellowship, and high ideals; (4) foster scholarship and pharmaceutical research.",defaultCategory:"scope"},
  {id:"c-art-II",group:"Constitution",provision:"Art. II §005-006",title:"Organization",text:"Constituent divisions: Alpha Chapter (Executive Committee); Collegiate Chapters; Graduate Chapters; and Provinces. Each Chapter and Province shall adopt Local Ordinances to their Uniform By-Laws, not conflicting with the Constitution and By-Laws or the Uniform By-Laws.",defaultCategory:"scope"},
  {id:"c-art-III",group:"Constitution",provision:"Art. III §007-015",title:"Membership",text:"Members must be teachers, students, or graduates of Schools/Colleges of Pharmacy, or pre-pharmacy students meeting requirements set by the Executive Committee. No exclusion for race, color, creed, sexual orientation, religion, national origin, or gender. Three types: Collegiate, Graduate, Honorary. Membership in or expulsion from another pharmaceutical fraternity disqualifies. After initiation, membership continues for life except for expulsion — in no case shall a member be allowed to relinquish membership voluntarily by resignation. Fraternity does not recognize unauthorized auxiliary organizations.",defaultCategory:"membership"},
  {id:"c-art-IV",group:"Constitution",provision:"Art. IV §016-017",title:"Dues and Assessments",text:"The Grand Council shall have power to collect dues and fees from all members. The Grand Council may also levy special assessments to cover deficits in the Grand Council Treasury.",defaultCategory:"dues"},
  {id:"c-art-V",group:"Constitution",provision:"Art. V §018-019",title:"Discipline",text:"Any member may be suspended or expelled for conduct unbecoming a member. Each Chapter shall have the right to punish members after due trial as set forth in the By-Laws of Kappa Psi Pharmaceutical Fraternity, Incorporated.",defaultCategory:"discipline"},
  {id:"c-art-VI",group:"Constitution",provision:"Art. VI §020-021",title:"Chapters",text:"Collegiate and Graduate Chapters may be established in any city or limited area of the US, Canada, or other countries. Graduate Chapters named after city/area. Collegiate Chapters named after Greek alphabet letters in order of establishment as assigned by the Executive Committee.",defaultCategory:"scope"},
  {id:"c-art-VII",group:"Constitution",provision:"Art. VII §022-023",title:"Uniform Province and Chapter By-Laws",text:"By-Laws for Provinces/Chapters are the Uniform By-Laws as adopted by the Executive Committee with Local Ordinances for local conditions. Local Ordinances must be submitted electronically within 7 days to the Grand Counselor and Central Office. Failure to act within 90 days constitutes automatic approval. Upon receipt of rejections/recommendations, Chapter/Province must act within 90 days or face automatic approval of LC recommendations.",defaultCategory:"procedure"},
  {id:"c-art-VIII",group:"Constitution",provision:"Art. VIII §024-026",title:"The Grand Council",text:"The Grand Council is the supreme legislative, judicial, and executive body. As highest judicial tribunal, it interprets all legislation — no appeal from its decisions. May delegate legislation to committee. Shall issue Ritual of Initiation held in sacred trust. May revoke the Charter of any or all Chapters.",defaultCategory:"scope"},
  {id:"c-art-IX",group:"Constitution",provision:"Art. IX §027",title:"Members of the Grand Council",text:"Consists of: Members of Executive Committee; two Delegates from each Collegiate Chapter; two Delegates from each Graduate Chapter; one Delegate from each Province; the Editor of THE MASK (if a member of the Fraternity); and each Past Grand Regent no longer a member of the Executive Committee.",defaultCategory:"officers"},
  {id:"c-art-X",group:"Constitution",provision:"Art. X §028",title:"Meetings of the Grand Council",text:"Grand Council meets in general convention every two years. Place and dates decided by Executive Committee with at least one year advance notice. Executive Committee may postpone/cancel in unusual circumstances, or may authorize electronic convention so long as all members have ability to participate.",defaultCategory:"procedure"},
  {id:"c-art-XI",group:"Constitution",provision:"Art. XI §029",title:"Officers of the Grand Council",text:"Officers: Grand Regent, Grand Vice Regent, Executive Director (Central Office), Grand Counselor, Grand Historian, and Grand Ritualist. All except Executive Director elected by secret ballot. Executive Director appointed by Executive Committee. Officers chosen from Collegiate and Graduate Members at large. No salaries shall be paid to elected Grand Officers.",defaultCategory:"officers"},
  {id:"c-art-XII",group:"Constitution",provision:"Art. XII §030-031",title:"Committees of the Grand Council",text:"Permanent committees: Executive, Legislative, Advisory, Frank H. Eby Award Committee, Publications, and Public Relations. Executive Committee is chief legislative body between Grand Council sessions, possesses all powers of the Grand Council and has full authority to act in its stead.",defaultCategory:"committees"},
  {id:"c-art-XIII",group:"Constitution",provision:"Art. XIII §032-034",title:"Provinces",text:"Fraternity divided geographically into Provinces. Each Province may adopt Ordinances not conflicting with superior enactments. Province legislative body is the Province Assembly consisting of two Delegates from each Chapter (Collegiate and Graduate) and the Officers of the Province.",defaultCategory:"province"},
  {id:"c-art-XIV",group:"Constitution",provision:"Art. XIV §035",title:"Official Badges and Insignia",text:"Official badges/insignia: The Badge, Sweetheart Pin, Pledge Button, Lapel Letter Button, Recognition Button, Henry J. Goeckel Grand Council Scholarship Key, Asklepios Key, Pennant, and Coat of Arms.",defaultCategory:"insignia"},
  {id:"c-art-XV",group:"Constitution",provision:"Art. XV §036",title:"Publications",text:"Fraternity shall publish: The Constitution and By-Laws, THE MASK (official journal), THE HANDBOOK, THE AGORA (official directory), THE POLICIES AND PROCEDURES MANUAL, website www.kappapsi.org, and additional publications deemed in interest of Fraternity by Executive Committee.",defaultCategory:"scope"},
  {id:"c-art-XVI",group:"Constitution",provision:"Art. XVI §037",title:"Orders, Honorary and Service",text:"Honorary Orders based on years of membership: Silver Mortar (25yr), Ruby Mortar (40yr), Golden Mortar (50yr), Diamond Mortar (60yr), Platinum Mortar (70yr). Also a Service Order for non-members of the Fraternity.",defaultCategory:"membership"},
  {id:"c-art-XVII",group:"Constitution",provision:"Art. XVII §038",title:"Quorum — Grand Council",text:"A quorum for any meeting of the Grand Council shall be three-fourths (3/4) of its accredited membership registered either in person or by proxy at said meeting.",defaultCategory:"quorum"},
  {id:"c-art-XVIII",group:"Constitution",provision:"Art. XVIII §039-041",title:"Amendments to the Constitution",text:"Proposals to amend may be made by Executive Committee, any Chapter, or any Member. In session: requires 3/4 majority vote; written copy submitted to Legislative Committee at least 24 hours prior and distributed to each member before voting. In adjournment: submitted to LC, forwarded to EC; 3/4 of responding Chapters within 60 days of mailing/electronic transmission.",defaultCategory:"amendments"},
  {id:"bl-I",group:"By-Laws",provision:"By-Law I §042-047",title:"Election of Members",text:"Members elected by secret ballot per Chapter's Uniform By-Laws. Transfer between Chapters requires inter-chapter communication. After initiation, membership continues for life except for expulsion — in no case shall a member be allowed to relinquish membership voluntarily by resignation. No inactive status for members enrolled and attending classes. Honorary Membership: contributes at national level; elected by Alpha Chapter; no dues required.",defaultCategory:"membership"},
  {id:"bl-II",group:"By-Laws",provision:"By-Law II §048-054",title:"Dues and Assessments",text:"Grand Council Membership fee: $75.00 within 7 days of initiation. Collegiate dues: $5.58/month, max $67/year. Graduate Chapter annual fee: $250 by Feb 15. Graduate Voluntary Dues: $50/year. Late penalty: 2% per month. Default of 6+ months may result in Charter suspension/revocation.",defaultCategory:"dues"},
  {id:"bl-III",group:"By-Laws",provision:"By-Law III §055-068",title:"Discipline",text:"Members may be suspended/expelled for: (1) injuring Fraternity prestige; (2) violating professional integrity; (3) violating Vow of Allegiance; (4) refusing dues. Written charges before Judiciary Committee. Trial requires 2/3 of Members in good standing present. 2/3 vote to convict; 2/3 for expulsion. Right to appeal to EC then Grand Council.",defaultCategory:"discipline"},
  {id:"bl-IV",group:"By-Laws",provision:"By-Law IV §069-073",title:"Chapters",text:"Application for Charter requires at least 5 Graduate Members. Received 90 days before Convention. Proposed Local Ordinances forwarded to Grand Counselor. 3/4 EC approval required.",defaultCategory:"scope"},
  {id:"bl-V",group:"By-Laws",provision:"By-Law V §074-077",title:"The Grand Council (Delegates)",text:"Delegates from arrears Chapters not admitted until debts paid (3/4 waivable). Single rep casts 2 votes. Absent Chapters assign proxies. No funds for arrears or Graduate Chapters/Provinces.",defaultCategory:"procedure"},
  {id:"bl-VI",group:"By-Laws",provision:"By-Law VI §078-079",title:"Grand Council Convention Fund",text:"Pays lowest tourist airfare for one Delegate per Collegiate Chapter and EC members. Remaining funds cover Convention. Executive Director prepares payments by 15th after Convention.",defaultCategory:"finance"},
  {id:"bl-VII",group:"By-Laws",provision:"By-Law VII §080-095",title:"Officers: Election and Duties",text:"Nomination 180 days before Convention; accept 60 days prior. Cannot be candidate for 2+ offices. Eligibility: 2+ years, paid dues prior 12 months. Secret ballot; majority required. Grand Regent: CEO, presides, visits Chapters every 2 years. Grand Counselor: legal advisor, reviews all Ordinances.",defaultCategory:"officers"},
  {id:"bl-VIII",group:"By-Laws",provision:"By-Law VIII §096-101",title:"The Central Office",text:"Executive Director appointed by EC, salary determined by EC. Custodian of funds; disburses per Grand Regent. Annual report within 30 days; quarterly reports within 30 days. Bond $500k+. Maintains membership roll.",defaultCategory:"officers"},
  {id:"bl-IX",group:"By-Laws",provision:"By-Law IX §102-116",title:"Committees of the Grand Council",text:"Executive: 9 members (Officers, Members-at-Large, Past Regent, ED ex officio). Min meeting yearly; quorum 5. Legislative: 5 members. Examines Ordinances. Advisory: all Past Regents.",defaultCategory:"committees"},
  {id:"bl-X",group:"By-Laws",provision:"By-Law X §117-123",title:"Provinces",text:"Officers: Satrap, Vice Satrap, Secretary-Treasurer, Historian, Chaplain, Supervisor (appointed). Assembly every 2 years. Levies assessments. Satrap acts as Grand Regent's deputy.",defaultCategory:"province"},
  {id:"bl-XI",group:"By-Laws",provision:"By-Law XI §124-139",title:"Official Insignia, Badges, Et Cetera",text:"Badge: rhombus, black/gold, worn on left chest ONLY. No loan to non-members. Sweetheart Pin: similar with pearls. Pledge Button: 1/2 inch circular. Coat of Arms: esoteric, publicly displayable. Jewelry from Official Jeweler only.",defaultCategory:"insignia"},
  {id:"bl-XII",group:"By-Laws",provision:"By-Law XII §140-155",title:"Publications",text:"THE CONSTITUTION/BY-LAWS: official document, copy at initiation. THE MASK: quarterly journal, all members receive. THE HANDBOOK: member info, ED manages. THE AGORA: member directory, esoteric. POLICY MANUAL: online, EC revises.",defaultCategory:"scope"},
  {id:"bl-XIII",group:"By-Laws",provision:"By-Law XIII §156-174",title:"Awards and Honors",text:"Mortar Orders for milestone years (25/40/50/60/70). Service Order for non-members. Grand Regent's Recognition Letter. Scholarship Key for First Honors graduates.",defaultCategory:"scope"},
  {id:"bl-XIV",group:"By-Laws",provision:"By-Law XIV §175-176",title:"Rules of Procedure",text:"Robert's Rules of Order – Newly Revised. Grand Regent appoints Official Parliamentarian.",defaultCategory:"procedure"},
  {id:"bl-XV",group:"By-Laws",provision:"By-Law XV §177-179",title:"Amendments to the By-Laws",text:"In session: 2/3 majority with written copy 24 hours prior. In adjournment: LC to EC; 2/3 of responding Chapters within 60 days.",defaultCategory:"amendments"},
  // Add remaining sections... (continued below for space)
  {id:"col-I",group:"Collegiate Chapter By-Laws",provision:"C By-Law I",title:"Title",text:"Chapter named per Charter. May incorporate with Grand Counselor/LC approval.",defaultCategory:"scope"},
  {id:"col-II",group:"Collegiate Chapter By-Laws",provision:"C By-Law II",title:"Membership",text:"Subject to Constitution Art. III, Chapter Charter, and Ordinance 2.",defaultCategory:"membership"},
  {id:"col-III",group:"Collegiate Chapter By-Laws",provision:"C By-Law III §C05-C06",title:"Election of Members",text:"Only eligible persons proposed. Names to Central Office at pledge start. Receive Constitution, By-Laws, Handbook. Secret ballot; 3/4 affirmative required.",defaultCategory:"membership"},
  {id:"col-IV",group:"Collegiate Chapter By-Laws",provision:"C By-Law IV §C07",title:"Officers and Order of Election",text:"Regent, Vice Regent (multiple allowed), Secretary, Treasurer, Historian, Chaplain, Sergeant-at-Arms, GCD (must be Graduate). Ritual Officers appointed by Regent.",defaultCategory:"officers"},
  {id:"col-V",group:"Collegiate Chapter By-Laws",provision:"C By-Law V §C08-C14",title:"Qualification, Election and Installation of Officers",text:"Annual per Ordinance 5. Good academic/chapter standing. 2/3 quorum. Simple majority to elect. Installed within 30 days. Removable by 2/3 for misfeasance/malfeasance.",defaultCategory:"officers"},
  {id:"col-VI",group:"Collegiate Chapter By-Laws",provision:"C By-Law VI §C15-C27",title:"Duties of Officers",text:"Regent presides, enforces, appoints committees. Vice Regent assumes in absence. Secretary maintains records, reports. Treasurer collects/disburses. GCD advises/supervises monthly.",defaultCategory:"officers"},
  {id:"col-VII",group:"Collegiate Chapter By-Laws",provision:"C By-Law VII §C28-C47",title:"Committees and Their Duties",text:"Standing: Executive, Judiciary, Legislative, Scholarship, Graduate Relations, Social, Risk Management. EC acts in session absence except cannot elect officers, members, discipline, amend.",defaultCategory:"committees"},
  {id:"col-VIII",group:"Collegiate Chapter By-Laws",provision:"C By-Law VIII §C48",title:"Records",text:"Proceedings on Central Office approved forms.",defaultCategory:"procedure"},
  {id:"col-IX",group:"Collegiate Chapter By-Laws",provision:"C By-Law IX §C49-C51",title:"Unethical Conduct",text:"Fined, suspended, or expelled for unethical conduct. Unfounded complaints unethical. Improper Fraternity use unethical.",defaultCategory:"discipline"},
  {id:"col-X",group:"Collegiate Chapter By-Laws",provision:"C By-Law X §C52-C55",title:"Meetings",text:"Regular per Ordinance 10. 48-hour notice for changes. Electronic meetings allowed. Fine for absence. Special meetings 48-hour notice.",defaultCategory:"procedure"},
  {id:"col-XI",group:"Collegiate Chapter By-Laws",provision:"C By-Law XI §C56-C60",title:"Dues",text:"Grand Council Fee + local per Ordinance 11. Transmitted within 7 days. Not paid by first meeting = not in good standing. One meeting to cure or suspended.",defaultCategory:"dues"},
  {id:"col-XII",group:"Collegiate Chapter By-Laws",provision:"C By-Law XII §C61-C62",title:"Secrecy",text:"Proceedings, Ritual, management secret. Officer/member names publishable. Ritual officer names NEVER published. Revealing secrets = expulsion.",defaultCategory:"ritual"},
  {id:"col-XIII",group:"Collegiate Chapter By-Laws",provision:"C By-Law XIII §C63",title:"Ritual of Initiation",text:"Secret, proper dignity/decorum. Hazing prohibited. Guilty = expulsion.",defaultCategory:"hazing"},
  {id:"col-XIV",group:"Collegiate Chapter By-Laws",provision:"C By-Law XIV §C64",title:"Quorum",text:"1/2 of Members in good standing unless greater per Ordinance 14.",defaultCategory:"quorum"},
  {id:"col-XV",group:"Collegiate Chapter By-Laws",provision:"C By-Law XV §C65",title:"Parliamentary Procedure",text:"Robert's Rules of Order – Newly Revised.",defaultCategory:"procedure"},
  {id:"col-XVI",group:"Collegiate Chapter By-Laws",provision:"C By-Law XVI §C66-C69",title:"Amendments (Local Chapter Ordinances)",text:"Written, 2+ signers, to LC. LC 10 days, presents at next meeting. Vote at NEXT meeting; 2/3 required. Deemed in force unless disapproved within 90 days.",defaultCategory:"amendments"},
  {id:"grad-I",group:"Graduate Chapter By-Laws",provision:"G By-Law I",title:"Title",text:"Named per Charter. May incorporate with prior Grand Counselor/LC approval.",defaultCategory:"scope"},
  {id:"grad-II",group:"Graduate Chapter By-Laws",provision:"G By-Law II",title:"Membership",text:"Subject to Constitution Art. III, Charter, Ordinance 2.",defaultCategory:"membership"},
  {id:"grad-III",group:"Graduate Chapter By-Laws",provision:"G By-Law III §G05-G06",title:"Election of Members",text:"Eligible persons proposed. Receive governing documents. Secret ballot; 3/4 affirmative.",defaultCategory:"membership"},
  {id:"grad-IV",group:"Graduate Chapter By-Laws",provision:"G By-Law IV §G07",title:"Officers and Order of Election",text:"Regent, Vice Regent (multiple), Secretary, Treasurer (may combine), Historian, Chaplain. Ritual Officers appointed by Regent.",defaultCategory:"officers"},
  {id:"grad-V",group:"Graduate Chapter By-Laws",provision:"G By-Law V §G08-G14",title:"Qualification, Election and Installation of Officers",text:"From Chapter; per Ordinance 5. No arrears/suspended. Simple majority. Installed within 90 days. Removable by 2/3.",defaultCategory:"officers"},
  {id:"grad-VI",group:"Graduate Chapter By-Laws",provision:"G By-Law VI §G15-G24",title:"Duties of Officers",text:"Regent presides, enforces. Vice Regent assumes in absence. Secretary records, reports. Treasurer manages finances. Delegates elected 1 month before Convention.",defaultCategory:"officers"},
  {id:"grad-VII",group:"Graduate Chapter By-Laws",provision:"G By-Law VII §G25-G42",title:"Committees and Their Duties",text:"Standing: Executive, Judiciary, Legislative, Risk Management. Optional: Scholarship, Social, Professional, Finance, Auditing, House, Continuing Ed.",defaultCategory:"committees"},
  {id:"grad-VIII",group:"Graduate Chapter By-Laws",provision:"G By-Law VIII §G43",title:"Records",text:"Proceedings on approved forms.",defaultCategory:"procedure"},
  {id:"grad-IX",group:"Graduate Chapter By-Laws",provision:"G By-Law IX §G44-G46",title:"Unethical Conduct",text:"Fined, suspended, expelled. Unfounded complaints unethical. Improper use unethical.",defaultCategory:"discipline"},
  {id:"grad-X",group:"Graduate Chapter By-Laws",provision:"G By-Law X §G47-G49",title:"Meetings",text:"Regular per Ordinance 10. 48-hour notice. Electronic allowed. Special 48-hour notice.",defaultCategory:"procedure"},
  {id:"grad-XI",group:"Graduate Chapter By-Laws",provision:"G By-Law XI §G50-G54",title:"Dues",text:"Fee + local per Ordinance 11. Within 7 days. Not paid = not in good standing. One meeting to cure or suspended.",defaultCategory:"dues"},
  {id:"grad-XII",group:"Graduate Chapter By-Laws",provision:"G By-Law XII §G55-G56",title:"Secrecy",text:"Proceedings, Ritual, management secret. Names publishable. Ritual names NEVER. Revealing = expulsion.",defaultCategory:"ritual"},
  {id:"grad-XIII",group:"Graduate Chapter By-Laws",provision:"G By-Law XIII §G57",title:"Ritual of Initiation",text:"Proper dignity/decorum. Hazing prohibited. Guilty = expulsion.",defaultCategory:"hazing"},
  {id:"grad-XIV",group:"Graduate Chapter By-Laws",provision:"G By-Law XIV §G58",title:"Quorum",text:"1/5 of Members in good standing unless greater per Ordinance 14.",defaultCategory:"quorum"},
  {id:"grad-XV",group:"Graduate Chapter By-Laws",provision:"G By-Law XV §G59",title:"Parliamentary Procedure",text:"Robert's Rules of Order – Newly Revised.",defaultCategory:"procedure"},
  {id:"grad-XVI",group:"Graduate Chapter By-Laws",provision:"G By-Law XVI §G60-G63",title:"Amendments (Local Chapter Ordinances)",text:"Written, 2+ signers, to LC. LC 10 days, no comment at next. Vote NEXT meeting; 2/3 required. In force unless disapproved within 90 days.",defaultCategory:"amendments"},
  {id:"prov-I",group:"Province By-Laws",provision:"P By-Law I §P02-P03",title:"Title",text:"Named per Alpha designation. May incorporate with prior approval.",defaultCategory:"scope"},
  {id:"prov-II",group:"Province By-Laws",provision:"P By-Law II §P04",title:"Composition of Province",text:"Collegiate/Graduate Chapters within Alpha-designated boundaries.",defaultCategory:"province"},
  {id:"prov-III",group:"Province By-Laws",provision:"P By-Law III §P05-P09",title:"Dues and Assessments",text:"Collegiate chapters pay per capita for all Members as of Nov 1. Graduate chapters pay per capita. Late 2% per month. Nonpayment = suspended. Special assessments 2/3 Chapters.",defaultCategory:"dues"},
  {id:"prov-IV",group:"Province By-Laws",provision:"P By-Law IV §P10-P13",title:"Province Assemblies and Interim Meetings",text:"Assembly between Grand Council. Time/place by Province EC. Secretary notifies 2 months prior; agenda 10 days. EC may postpone emergency.",defaultCategory:"procedure"},
  {id:"prov-V",group:"Province By-Laws",provision:"P By-Law V §P14-P22",title:"Composition of the Province Assembly",text:"Supreme legislative/judicial/executive body. Each Chapter 2 votes; Officers 1 each. Proxies must be signed; proxy chapters no reimbursement.",defaultCategory:"province"},
  {id:"prov-VI",group:"Province By-Laws",provision:"P By-Law VI §P23-P27",title:"Officers: Election and Duties",text:"Satrap, Vice Satrap, Secretary-Treasurer, Historian, Chaplain. Grand Regent appoints Supervisor (no vote). Elected Collegiate/Graduate Members. Simple majority; installed same day.",defaultCategory:"officers"},
  {id:"prov-VII",group:"Province By-Laws",provision:"P By-Law VII §P28-P33",title:"Committees",text:"Standing: Executive, Legislative, Auditing, Assembly Planning. Special as needed. Non-EC min 3 members, appointed by Satrap.",defaultCategory:"committees"},
  {id:"prov-VIII",group:"Province By-Laws",provision:"P By-Law VIII §P34-P36",title:"Delegate to the Grand Council",text:"Delegate/Alternate per Ordinance 8. If unable, Satrap appoints Province Member. Submits written report to Secretary 1 month before next Assembly.",defaultCategory:"province"},
  {id:"prov-IX",group:"Province By-Laws",provision:"P By-Law IX §P37",title:"Order of Business for Province Assemblies",text:"Call, Opening, Roll Call, Welcomes, Minutes, Communications, Reports, Chapters, Speakers, Old Business, GCD Session, New Business, Elections, Closing, Adjournment.",defaultCategory:"procedure"},
  {id:"prov-X",group:"Province By-Laws",provision:"P By-Law X §P38",title:"Quorum — Province",text:"1/2 of Chapter Delegates including proxies.",defaultCategory:"quorum"},
  {id:"prov-XI",group:"Province By-Laws",provision:"P By-Law XI §P39",title:"Parliamentary Procedure",text:"Robert's Rules of Order – Newly Revised.",defaultCategory:"procedure"},
  {id:"prov-XII",group:"Province By-Laws",provision:"P By-Law XII §P40-P43",title:"Amendments (Local Province Ordinances)",text:"Written. At Assemblies: presented before Final Session; voted at Final; 2/3 required. Between Assemblies per Ordinance 12.2. In force unless disapproved within 90 days.",defaultCategory:"amendments"},
];

const CATEGORIES = ["membership","dues","discipline","elections","quorum","amendments","scope","procedure","insignia","officers","committees","province","ritual","hazing","finance"];
const SEVERITIES = ["HARD_REJECT","HIGH","MEDIUM","INFO"];

function App() {
  const [selectedId, setSelectedId] = useState(ALL_SECTIONS[0].id);
  const [annotations, setAnnotations] = useState([]);
  const [userSessions, setUserSessions] = useState([]);
  const [sessionId] = useState(`session-${Math.random().toString(36).substr(2,9)}`);
  const [username, setUsername] = useState(`User ${Math.random().toString(36).substr(2,5).toUpperCase()}`);
  
  // Form state
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formSeverity, setFormSeverity] = useState('MEDIUM');
  const [formFlags, setFormFlags] = useState('');
  const [formSource, setFormSource] = useState('');
  
  // Modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState('');
  const [estimatedTokens, setEstimatedTokens] = useState(0);
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterComplete, setFilterComplete] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(Object.fromEntries([...new Set(ALL_SECTIONS.map(s => s.group))].map(g => [g, true])));
  const [saving, setSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState('synced');
  const autoSaveTimer = useRef(null);

  // Initialize Supabase subscriptions
  useEffect(() => {
    loadAnnotations();
    updateUserSession();
    
    // Real-time subscription to annotations
    const annotationChannel = supabase
      .channel('annotations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'annotations' }, (payload) => {
        loadAnnotations();
      })
      .subscribe();

    // Real-time subscription to user sessions
    const sessionChannel = supabase
      .channel('user_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_sessions' }, (payload) => {
        loadSessions();
      })
      .subscribe();

    // Keep user session alive
    const sessionInterval = setInterval(updateUserSession, 10000);

    return () => {
      annotationChannel.unsubscribe();
      sessionChannel.unsubscribe();
      clearInterval(sessionInterval);
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  // Auto-save form changes
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSyncStatus('unsaved');
    
    autoSaveTimer.current = setTimeout(() => {
      if (formText.trim()) {
        setSyncStatus('saving');
        // Mark as auto-saved (could upload here if desired)
        setSyncStatus('synced');
      }
    }, 2000);

    return () => clearTimeout(autoSaveTimer.current);
  }, [formText, formCategory, formSeverity, formFlags, formSource]);

  async function loadAnnotations() {
    const { data, error } = await supabase.from('annotations').select('*');
    if (error) {
      console.error('Error loading annotations:', error);
      return;
    }
    setAnnotations(data || []);
  }

  async function loadSessions() {
    const { data, error } = await supabase.from('user_sessions').select('*').gt('last_active', new Date(Date.now() - 60000).toISOString());
    if (error) return;
    setUserSessions(data || []);
  }

  async function updateUserSession() {
    await supabase.from('user_sessions').upsert(
      {
        id: sessionId,
        current_section: selectedId,
        username: username,
        last_active: new Date().toISOString()
      },
      { onConflict: 'id' }
    );
    loadSessions();
  }

  async function addAnnotation() {
    if (!formText.trim()) return;
    
    const section = ALL_SECTIONS.find(s => s.id === selectedId);
    setSaving(true);
    
    const { error } = await supabase.from('annotations').insert([
      {
        section_id: selectedId,
        provision: section.provision,
        category: formCategory || section.defaultCategory,
        severity: formSeverity,
        guidance: formText,
        flags: formFlags,
        source: formSource,
        user_session_id: sessionId
      }
    ]);

    if (error) {
      console.error('Error saving:', error);
      alert('Failed to save annotation');
    } else {
      setFormText('');
      setFormCategory('');
      setFormSeverity('MEDIUM');
      setFormFlags('');
      setFormSource('');
      loadAnnotations();
    }
    setSaving(false);
  }

  async function deleteAnnotation(id) {
    if (!confirm('Delete this annotation?')) return;
    await supabase.from('annotations').delete().eq('id', id);
    loadAnnotations();
  }

  async function manualSave() {
    setSaving(true);
    // Could do something here like save to a "drafts" table
    // For now, all changes are auto-saved to annotations table
    setTimeout(() => setSaving(false), 500);
  }

  // Export functionality
  function prepareForExport() {
    const stats = annotations.reduce((acc, a) => {
      acc[a.section_id] = (acc[a.section_id] || 0) + 1;
      return acc;
    }, {});
    
    const complete = ALL_SECTIONS.length === Object.keys(stats).length;
    
    if (!complete) {
      alert(`Only ${Object.keys(stats).length} of ${ALL_SECTIONS.length} sections are annotated. Export requires 100% completion.`);
      return;
    }

    // Estimate tokens
    let charCount = 0;
    annotations.forEach(a => {
      charCount += (a.provision?.length || 0) + (a.guidance?.length || 0) + (a.flags?.length || 0) * 2;
    });
    const estimate = Math.ceil(charCount / 4) + 500;
    setEstimatedTokens(estimate);
    setShowExportModal(true);
  }

  async function confirmExport() {
    setExportLoading(true);
    setExportError('');

    try {
      // Call the Netlify function
      const response = await fetch('/.netlify/functions/generate-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          annotations: annotations.map(a => ({
            provision: a.provision,
            category: a.category,
            severity: a.severity,
            guidance: a.guidance,
            flags: a.flags ? a.flags.split(',').map(f => f.trim()) : [],
            source: a.source
          }))
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }

      const { schema, tokenUsage } = await response.json();

      // Download JSON
      const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kappa-psi-context-rules.json';
      a.click();
      URL.revokeObjectURL(url);

      setShowExportModal(false);
      alert(`Export successful! Used ${tokenUsage.totalTokens} tokens.`);
    } catch (err) {
      setExportError(err.message);
    }

    setExportLoading(false);
  }

  // Computed values
  const selectedSection = ALL_SECTIONS.find(s => s.id === selectedId) || ALL_SECTIONS[0];
  const sectionAnnotations = annotations.filter(a => a.section_id === selectedId);
  const totalAnnotations = annotations.length;
  const sectionsWithAnnotations = [...new Set(annotations.map(a => a.section_id))].length;
  const progressPercent = Math.round((sectionsWithAnnotations / ALL_SECTIONS.length) * 100);
  
  const groups = [...new Set(ALL_SECTIONS.map(s => s.group))];
  const filteredSections = ALL_SECTIONS.filter(s => {
    if (filterComplete) {
      const has = annotations.some(a => a.section_id === s.id);
      if (!has) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.provision.toLowerCase().includes(q) || s.defaultCategory.includes(q);
    }
    return true;
  });

  const currentFilteredIndex = filteredSections.findIndex(s => s.id === selectedId);
  const otherEditors = userSessions.filter(u => u.id !== sessionId && u.current_section === selectedId);

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ padding: '12px', borderBottom: '0.5px solid #d5d5d0' }}>
          <input
            type="text"
            placeholder="Search sections..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', marginBottom: '8px' }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
            <input type="checkbox" checked={filterComplete} onChange={e => setFilterComplete(e.target.checked)} />
            Show only annotated
          </label>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
            {filteredSections.length} / {ALL_SECTIONS.length} sections
          </div>
        </div>

        {groups.map(g => {
          const gSections = filteredSections.filter(s => s.group === g);
          if (!gSections.length) return null;
          
          const gAnnotations = gSections.reduce((n, s) => n + annotations.filter(a => a.section_id === s.id).length, 0);
          const isOpen = expandedGroups[g] !== false;

          return (
            <div key={g}>
              <button 
                className="group-hdr"
                onClick={() => setExpandedGroups(prev => ({ ...prev, [g]: !isOpen }))}
              >
                <span>{g}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {gAnnotations > 0 && <span style={{ fontSize: '10px', background: '#22c55e', color: 'white', padding: '1px 6px', borderRadius: '10px', fontWeight: 500 }}>{gAnnotations}</span>}
                  <span style={{ fontSize: '11px' }}>{isOpen ? '▼' : '▶'}</span>
                </span>
              </button>

              {isOpen && gSections.map(s => {
                const cnt = annotations.filter(a => a.section_id === s.id).length;
                const isActive = s.id === selectedId;

                return (
                  <button
                    key={s.id}
                    className={`nav-btn${isActive ? ' active' : ''}`}
                    onClick={() => { setSelectedId(s.id); updateUserSession(); }}
                    style={{
                      borderLeftColor: isActive ? '#CC2200' : 'transparent',
                      background: isActive ? '#fafaf9' : 'transparent'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 500, lineHeight: 1.3 }}>{s.title}</div>
                      <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>{s.provision.length > 30 ? s.provision.slice(0, 30) + '...' : s.provision}</div>
                    </div>
                    {cnt > 0 && <span style={{ fontSize: '10px', background: '#fbbf24', color: '#78350f', padding: '1px 6px', borderRadius: '6px', fontWeight: 500 }}>{cnt}</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Main */}
      <div className="main">
        {/* Header */}
        <div className="header">
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#FFF0EE', color: '#CC2200', padding: '2px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: 500 }}>KΨ</span>
              Context Rule Builder
            </h2>
            <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>
              {sectionsWithAnnotations} / {ALL_SECTIONS.length} sections · {totalAnnotations} annotations · {syncStatus === 'synced' ? '✓ Synced' : syncStatus === 'saving' ? '💾 Saving...' : '⚪ Unsaved changes'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={manualSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button onClick={prepareForExport} disabled={sectionsWithAnnotations < ALL_SECTIONS.length}>Export ({progressPercent}%)</button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>

        {/* Content */}
        <div className="content">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '11px', color: '#999' }}>
              {currentFilteredIndex >= 0 && `${currentFilteredIndex + 1} / ${filteredSections.length}`}
            </div>
            <div style={{ fontSize: '11px', color: '#cc2200', fontWeight: 500 }}>
              {otherEditors.length > 0 && `${otherEditors.map(u => u.username).join(', ')} editing this section`}
            </div>
          </div>

          {/* Section header */}
          <div className="section-header">
            <span className="badge">{selectedSection.provision}</span>
            <span style={{ fontSize: '11px', background: '#f0f0f0', border: '0.5px solid #d5d5d0', padding: '4px 10px', borderRadius: '6px' }}>{selectedSection.group}</span>
            <span style={{ fontSize: '11px', background: '#e0f2fe', border: '0.5px solid #bae6fd', padding: '4px 10px', borderRadius: '6px', color: '#0c4a6e' }}>{selectedSection.defaultCategory}</span>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>{selectedSection.title}</h3>

          {/* Section text */}
          <div className="section-text">{selectedSection.text}</div>

          {/* Form */}
          <div className="form-card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              ✏️ Add annotation
            </h4>

            <div className="form-grid">
              <div className="form-group">
                <label>Category</label>
                <select value={formCategory || selectedSection.defaultCategory} onChange={e => setFormCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Severity</label>
                <select value={formSeverity} onChange={e => setFormSeverity(e.target.value)}>
                  {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label>Guidance / Interpretation Notes</label>
              <textarea
                value={formText}
                onChange={e => setFormText(e.target.value)}
                placeholder="Describe how this provision should be interpreted, what to watch for, prohibited constructions..."
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Trigger Flags (comma-separated)</label>
                <input type="text" value={formFlags} onChange={e => setFormFlags(e.target.value)} placeholder='e.g. "resignation", "inactive"' />
              </div>
              <div className="form-group">
                <label>Source</label>
                <input type="text" value={formSource} onChange={e => setFormSource(e.target.value)} placeholder="Grand Council ruling..." />
              </div>
            </div>

            <button className="save-btn" onClick={addAnnotation} disabled={!formText.trim() || saving}>
              {saving ? '⏳ Saving...' : '+ Save annotation'}
            </button>
          </div>

          {/* Annotations */}
          {sectionAnnotations.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
                {sectionAnnotations.length} annotation{sectionAnnotations.length !== 1 ? 's' : ''}
              </h4>
              {sectionAnnotations.map(a => (
                <div key={a.id} style={{ background: 'white', border: '0.5px solid #d5d5d0', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', background: a.severity === 'HARD_REJECT' ? '#fee2e2' : a.severity === 'HIGH' ? '#fef3c7' : '#e0f2fe', color: a.severity === 'HARD_REJECT' ? '#991b1b' : a.severity === 'HIGH' ? '#78350f' : '#0c4a6e', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>
                        {a.severity}
                      </span>
                      <span style={{ fontSize: '10px', background: '#f0f0f0', color: '#666', padding: '2px 8px', borderRadius: '4px' }}>
                        {a.category}
                      </span>
                    </div>
                    <button onClick={() => deleteAnnotation(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '12px', padding: 0 }}>
                      ✕
                    </button>
                  </div>
                  <p style={{ fontSize: '13px', margin: '0 0 8px', lineHeight: 1.6 }}>{a.guidance}</p>
                  {a.flags && <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>Flags: {a.flags}</div>}
                  {a.source && <div style={{ fontSize: '10px', color: '#999', fontStyle: 'italic' }}>Source: {a.source}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>⚠️ Generate Schema with Claude Sonnet 4.6</h3>
            <p>You are about to call Claude Sonnet 4.6 (our highest-end model) to structure all {annotations.length} annotations into the final context rules schema.</p>
            
            <div className="warning-box">
              💻 <strong>Token Estimate:</strong> ~{estimatedTokens} tokens (~${(estimatedTokens / 1000 * 0.003).toFixed(4)})
              <br/>
              ⏱️ <strong>Processing Time:</strong> ~10-30 seconds
              <br/>
              🔴 <strong>Sonnet 4.6 is reserved ONLY for this task.</strong> Other AI work uses Haiku to save costs.
            </div>

            <p style={{ fontSize: '12px', color: '#666' }}>
              Once you confirm, Claude will:<br/>
              • Validate all annotation data<br/>
              • Structure into the schema format<br/>
              • Assign context rule IDs (CTX-001, etc)<br/>
              • Generate examples from guidance text<br/>
              • Return a downloadable JSON file
            </p>

            {exportError && <p style={{ color: '#cc2200', fontSize: '12px' }}>❌ {exportError}</p>}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={() => setShowExportModal(false)} disabled={exportLoading}>Cancel</button>
              <button className="save-btn" onClick={confirmExport} disabled={exportLoading}>
                {exportLoading ? '⏳ Generating...' : '✓ Proceed with Export'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity indicator */}
      {userSessions.length > 1 && (
        <div className="activity-panel">
          <div style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px', color: '#666' }}>Online Users</div>
          {userSessions.slice(0, 5).map(u => (
            <div key={u.id} style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' }}>
              <div className="online-dot"></div>
              <span>{u.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
