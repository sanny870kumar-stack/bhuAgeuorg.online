import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// CONSTANTS & DATA
// ═══════════════════════════════════════════════════════════════
const ADMIN_EMAIL        = "admin@bhu.ac.in";
const ADMIN_PASS_DEFAULT = "admin2025";

const RAZORPAY_KEY = "razorpay.me/@bhuageuorg";

const PLANS = {
  monthly: { id:"monthly", label:"Monthly",  price:19,  period:"month", desc:"₹19 / month — Cancel anytime", badge:"" },
  yearly:  { id:"yearly",  label:"Yearly",   price:199, period:"year",  desc:"₹199 / year — Save ₹29!",      badge:"Best Value" },
};

const SUBJECTS = [
  { id:"s1", name:"Agronomy",                 icon:"🌾", cat:"core",    badge:"Popular", desc:"Crop production and soil management for optimal yield and sustainability.",   topics:["Crop Production","Weed Management","Irrigation Systems","Tillage Systems"],          tags:["crops","soil","yield"]          },
  { id:"s2", name:"Horticulture",             icon:"🍎", cat:"applied", badge:"New",     desc:"Cultivating fruits, vegetables, flowers and ornamental plants.",              topics:["Fruit Science","Vegetable Production","Floriculture","Post-harvest Tech"],          tags:["fruits","flowers","vegetables"] },
  { id:"s3", name:"Soil Science",             icon:"🪨", cat:"science", badge:"",        desc:"Physical, chemical and biological properties of soils.",                     topics:["Soil Chemistry","Soil Fertility","Soil Physics","Soil Microbiology"],               tags:["soil","nutrients","pH"]         },
  { id:"s4", name:"Plant Physiology",         icon:"🌿", cat:"science", badge:"",        desc:"Plant growth, development, metabolism and physiological processes.",          topics:["Photosynthesis","Respiration","Transpiration","Hormonal Regulation"],              tags:["growth","metabolism","physiology"]},
  { id:"s5", name:"Genetics & Plant Breeding",icon:"🧬", cat:"science", badge:"Popular", desc:"Heredity, variation and genetic improvement of crop plants.",                topics:["Mendelian Genetics","Hybridization","Mutation Breeding","Molecular Markers"],     tags:["genetics","DNA","heredity"]     },
  { id:"s6", name:"Plant Pathology",          icon:"🔬", cat:"applied", badge:"",        desc:"Plant diseases, causative agents and integrated disease management.",         topics:["Fungal Diseases","Bacterial Diseases","Virus Diseases","IDM Strategies"],        tags:["disease","fungi","pathogen"]    },
  { id:"s7", name:"Entomology",               icon:"🐛", cat:"applied", badge:"",        desc:"Insects affecting agriculture and integrated pest management.",               topics:["Insect Pests","IPM","Beneficial Insects","Pesticide Management"],                 tags:["insects","IPM","biocontrol"]    },
  { id:"s8", name:"Agricultural Meteorology", icon:"🌦️",cat:"science", badge:"",        desc:"Weather and climate effects on crop production and yield.",                  topics:["Weather Forecasting","Climate Change","Rainfall Analysis","Evapotranspiration"], tags:["weather","climate","forecast"]  },
  { id:"s9", name:"Agricultural Economics",   icon:"📊", cat:"applied", badge:"",        desc:"Economic principles applied to farming, marketing and rural policy.",         topics:["Farm Finance","Ag Marketing","Demand & Supply","Agribusiness"],                  tags:["economics","market","policy"]   },
];

const QUIZ_BANK = {
  "Agronomy": [
    {q:"Which nutrient is primarily responsible for vegetative growth?",            opts:["Phosphorus","Nitrogen","Potassium","Calcium"],                   ans:1, exp:"Nitrogen promotes leafy growth and is essential for chlorophyll formation.", premium:false},
    {q:"Critical period of weed competition in crops is:",                         opts:["At harvest time","First 20-45 days after sowing","After 60 days","At flowering stage"], ans:1, exp:"Crops are most vulnerable to weed competition in the first 20–45 days after sowing.", premium:false},
    {q:"Which irrigation method has the highest water-use efficiency?",            opts:["Flood irrigation","Furrow irrigation","Sprinkler irrigation","Drip irrigation"], ans:3, exp:"Drip irrigation delivers water directly to the root zone, minimising losses.", premium:true},
    {q:"NPK stands for:",                                                          opts:["Nitrogen Phosphorus Potassium","Nitrogen Potash Kalium","Nutrients Phosphorus Kalium","None of the above"], ans:0, exp:"N = Nitrogen, P = Phosphorus, K = Potassium (Kalium in Latin).", premium:true},
    {q:"Kharif crops are sown in:",                                                opts:["March–April","October–November","June–July","January–February"], ans:2, exp:"Kharif crops are sown at the start of the rainy season (June–July) and harvested in autumn.", premium:true},
  ],
  "Soil Science": [
    {q:"Ideal soil pH range for most crops:",                                      opts:["4.0–5.0","5.5–7.5","8.0–9.0","3.0–4.0"],                       ans:1, exp:"Most crops grow optimally at pH 5.5–7.5, which ensures maximum nutrient availability.", premium:false},
    {q:"Which soil type has the highest water holding capacity?",                  opts:["Sandy soil","Clay soil","Loamy soil","Silty soil"],               ans:1, exp:"Clay has very fine particles with large surface area, holding more water.", premium:false},
    {q:"Humus is formed from:",                                                    opts:["Minerals","Decomposed organic matter","Rock particles","Chemical fertilizers"], ans:1, exp:"Humus is stable organic matter resulting from decomposition of plant and animal material.", premium:true},
    {q:"Rhizobium bacteria fix atmospheric nitrogen in:",                          opts:["Wheat","Maize","Legumes","Rice"],                                 ans:2, exp:"Rhizobium fixes N₂ in root nodules of leguminous plants (pulses, beans, etc.).", premium:true},
    {q:"Soil salinity is primarily caused by:",                                    opts:["Natural leaching","Waterlogging alone","Excess irrigation without drainage","Wind erosion"], ans:2, exp:"Salts accumulate when irrigation water is applied without adequate drainage.", premium:true},
  ],
  "Plant Pathology": [
    {q:"Bordeaux mixture is primarily used to control:",                           opts:["Insect pests","Fungal diseases","Bacterial diseases","Nematodes"],ans:1, exp:"Bordeaux mixture (CuSO₄ + lime) is a classic protectant copper fungicide.", premium:false},
    {q:"Late blight of potato is caused by:",                                      opts:["Fusarium sp.","Phytophthora infestans","Alternaria solani","Pythium sp."], ans:1, exp:"Phytophthora infestans caused the Irish Potato Famine of the 1840s.", premium:false},
    {q:"Wheat rust is also known as:",                                             opts:["Cancer of wheat","Loose smut of wheat","Karnal bunt","Powdery mildew"], ans:0, exp:"Rust is called the 'cancer of wheat' due to its devastating impact on crop yields.", premium:true},
    {q:"Biological control of plant diseases uses:",                               opts:["Synthetic chemicals","Beneficial microorganisms","Heavy irrigation","None of these"], ans:1, exp:"Trichoderma and other beneficial organisms naturally suppress plant pathogens.", premium:true},
    {q:"Systemic fungicides work by:",                                             opts:["Coating only the leaf surface","Treating seeds only","Moving through vascular tissue","Remaining only in soil"], ans:2, exp:"Systemic fungicides are absorbed and translocate inside plant tissues.", premium:true},
  ],
  "Genetics & Plant Breeding": [
    {q:"Who is known as the Father of Genetics?",                                  opts:["Charles Darwin","Gregor Mendel","Hugo de Vries","Thomas Hunt Morgan"], ans:1, exp:"Gregor Mendel discovered fundamental laws of heredity through pea plant experiments.", premium:false},
    {q:"Heterosis refers to:",                                                     opts:["Inbreeding depression","Hybrid vigour","Induced mutation","Polyploidy"], ans:1, exp:"Heterosis is superior performance of hybrids compared to their inbred parent lines.", premium:false},
    {q:"Chromosome number (2n) of bread wheat (Triticum aestivum):",              opts:["14","28","42","56"],                                              ans:2, exp:"T. aestivum is hexaploid: 2n = 6x = 42 chromosomes.", premium:true},
    {q:"IR-8 is a semi-dwarf variety of:",                                         opts:["Wheat","Maize","Rice","Sorghum"],                                 ans:2, exp:"IR-8 was the first semi-dwarf high-yielding rice released during the Green Revolution.", premium:true},
    {q:"DNA double helix structure was proposed by:",                              opts:["Mendel and Morgan","Watson and Crick","Avery and MacLeod","Beadle and Tatum"], ans:1, exp:"James Watson and Francis Crick published the double helix model of DNA in 1953.", premium:true},
  ],
  "Entomology": [
    {q:"Malaria is transmitted by which mosquito?",                                opts:["Culex mosquito","Aedes mosquito","Anopheles mosquito","Housefly"],  ans:2, exp:"Female Anopheles mosquitoes transmit Plasmodium, the malaria parasite.", premium:false},
    {q:"IPM stands for:",                                                          opts:["Integrated Pest Management","International Pest Method","Insect Pest Mode","Integrated Plant Management"], ans:0, exp:"IPM combines biological, cultural, physical, and chemical tools for sustainable pest control.", premium:false},
    {q:"Which is a natural biological enemy of aphids?",                           opts:["Locust","Ladybird beetle","Whitefly","Mealybug"],                  ans:1, exp:"Ladybird beetles (Coccinellidae) are voracious predators that feed on aphids.", premium:true},
    {q:"Butterflies undergo which type of metamorphosis?",                         opts:["Incomplete metamorphosis","Complete metamorphosis","Hemimetabolism","No metamorphosis"], ans:1, exp:"Complete (holometabolous) metamorphosis: egg → larva → pupa → adult.", premium:true},
    {q:"Bacillus thuringiensis (Bt) is used as:",                                 opts:["Chemical fertilizer","Bioinsecticide","Antifungal agent","Herbicide"], ans:1, exp:"Bt produces proteins toxic to certain insect larvae, acting as an effective bioinsecticide.", premium:true},
  ],
};

// ═══════════════════════════════════════════════════════════════
// STORAGE HELPERS (localStorage fallback if window.storage unavailable)
// ═══════════════════════════════════════════════════════════════
const useLocalStorage = !window.storage;

async function sGet(key, shared = false) {
  try {
    if (useLocalStorage) {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    }
    const r = await window.storage.get(key, shared);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}

async function sSet(key, val, shared = false) {
  try {
    const s = JSON.stringify(val);
    if (useLocalStorage) { localStorage.setItem(key, s); return; }
    await window.storage.set(key, s, shared);
  } catch (e) { console.warn("Storage:", e); }
}

async function sDel(key, shared = false) {
  try {
    if (useLocalStorage) { localStorage.removeItem(key); return; }
    await window.storage.delete(key, shared);
  } catch {}
}

function b64Download(data, filename) {
  const a = document.createElement("a");
  a.href = data; a.download = filename || "file"; a.click();
}

// ═══════════════════════════════════════════════════════════════
// RAZORPAY LOADER
// ═══════════════════════════════════════════════════════════════
function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ═══════════════════════════════════════════════════════════════
// SUBSCRIPTION HELPERS
// ═══════════════════════════════════════════════════════════════
function isSubscriptionActive(user) {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (!user.subExpiry) return false;
  return new Date(user.subExpiry) > new Date();
}

function getExpiryDate(plan) {
  const d = new Date();
  if (plan === "monthly") d.setMonth(d.getMonth() + 1);
  else d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════
function injectStyles() {
  if (document.getElementById("bhu-portal-styles")) return;
  const s = document.createElement("style");
  s.id = "bhu-portal-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html,body,#root{height:100%;}
    body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
    ::-webkit-scrollbar{width:5px;height:5px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:#a0c8b0;border-radius:3px;}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.25;}}
    @keyframes slideRight{from{transform:translateX(110%);opacity:0;}to{transform:translateX(0);opacity:1;}}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
    .fade-up{animation:fadeUp .35s ease both;}
    .fade-in{animation:fadeIn .25s ease both;}
    .slide-right{animation:slideRight .35s cubic-bezier(.17,.67,.35,1) both;}
    .spin{animation:spin .7s linear infinite;display:inline-block;}
    .live-dot{display:inline-flex;align-items:center;gap:5px;}
    .live-dot::before{content:'';width:7px;height:7px;border-radius:50%;background:#4ade80;animation:pulse 1.6s infinite;}
    .hover-lift{transition:transform .2s,box-shadow .2s;}
    .hover-lift:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,.12);}
    .btn-t{transition:opacity .15s,transform .15s;}
    .btn-t:hover{opacity:.88;transform:translateY(-1px);}
    .nav-btn{transition:color .2s,border-color .2s,background .2s;}
    .premium-shimmer{background:linear-gradient(90deg,#c9690a,#f59e0b,#c9690a);background-size:200% 100%;animation:shimmer 2s infinite;}
    input:focus,select:focus,textarea:focus{outline:2px solid #25a865;outline-offset:1px;}
    @media(max-width:640px){
      .hero-h{font-size:24px!important;line-height:1.3!important;}
      .hdr-title{font-size:14px!important;}
      .hdr-row{padding:10px 14px!important;}
      .nav-bar{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
      .nav-bar::-webkit-scrollbar{display:none;}
      .main-pad{padding:0 12px 80px!important;}
      .stats-row>div{gap:24px!important;}
    }
    @media(max-width:480px){
      .hero-h{font-size:20px!important;}
      .plan-grid{grid-template-columns:1fr!important;}
    }
  `;
  document.head.appendChild(s);
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function BHUPortal() {
  const [loading, setLoading]       = useState(true);
  const [notes, setNotes]           = useState([]);
  const [pending, setPending]       = useState([]);
  const [usersDB, setUsersDB]       = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [adminPass, setAdminPass]   = useState(ADMIN_PASS_DEFAULT);

  const [dark, setDark]             = useState(false);
  const [section, setSection]       = useState("home");
  const [showLogin, setShowLogin]   = useState(false);
  const [loginTab, setLoginTab]     = useState("login");
  const [subSearch, setSubSearch]   = useState("");
  const [catFilter, setCatFilter]   = useState("");
  const [viewer, setViewer]         = useState(null);
  const [adminTab, setAdminTab]     = useState("pending");
  const [rejectItem, setRejectItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast]           = useState(null);
  const [resSearch, setResSearch]   = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");

  // auth state
  const [authEmail, setAuthEmail]   = useState("");
  const [authPass, setAuthPass]     = useState("");
  const [regName, setRegName]       = useState("");
  const [regRoll, setRegRoll]       = useState("");
  const [regYear, setRegYear]       = useState("B.Sc. Ag. Year 1");
  const [regEmail, setRegEmail]     = useState("");
  const [regPass, setRegPass]       = useState("");
  const [authErr, setAuthErr]       = useState("");
  const [regErr, setRegErr]         = useState("");
  const [authBusy, setAuthBusy]     = useState(false);

  // upload state
  const [uTitle, setUTitle]         = useState("");
  const [uSubject, setUSubject]     = useState("");
  const [uType, setUType]           = useState("PDF");
  const [uLink, setULink]           = useState("");
  const [uDesc, setUDesc]           = useState("");
  const [uFile, setUFile]           = useState(null);
  const [uFileData, setUFileData]   = useState("");
  const [uPremium, setUPremium]     = useState(false);
  const [uploading, setUploading]   = useState(false);

  // quiz state
  const [quizSubj, setQuizSubj]     = useState("");
  const [quizQs, setQuizQs]         = useState([]);
  const [quizAns, setQuizAns]       = useState([]);
  const [quizIdx, setQuizIdx]       = useState(0);
  const [quizDone, setQuizDone]     = useState(false);

  // premium / payment
  const [showPricing, setShowPricing] = useState(false);
  const [payBusy, setPayBusy]       = useState(false);

  const syncTimer = useRef(null);
  const fileRef   = useRef(null);

  // ── INIT ────────────────────────────────────────────────────
  useEffect(() => {
    injectStyles();
    (async () => {
      const [n, p, u, sess, ap, theme] = await Promise.all([
        sGet("bhu:notes", true), sGet("bhu:pending", true), sGet("bhu:users", true),
        sGet("bhu:session", false), sGet("bhu:adminpass", false), sGet("bhu:theme", false),
      ]);
      if (n)  setNotes(n);
      if (p)  setPending(p);
      if (u)  setUsersDB(u);
      if (ap) setAdminPass(ap);
      if (theme === "dark") setDark(true);
      if (sess) setCurrentUser(sess);
      setLoading(false);

      // live sync every 18s
      syncTimer.current = setInterval(async () => {
        const [nn, np, nu] = await Promise.all([
          sGet("bhu:notes", true), sGet("bhu:pending", true), sGet("bhu:users", true),
        ]);
        if (nn) setNotes(nn);
        if (np) setPending(np);
        if (nu) setUsersDB(nu);
      }, 18000);
    })();
    return () => clearInterval(syncTimer.current);
  }, []);

  useEffect(() => { sSet("bhu:theme", dark ? "dark" : "light", false); }, [dark]);

  const toast$ = (msg, t = "s") => {
    setToast({ msg, t }); setTimeout(() => setToast(null), 3600);
  };

  const saveN = async v => { setNotes(v);   await sSet("bhu:notes",   v, true); };
  const saveP = async v => { setPending(v); await sSet("bhu:pending", v, true); };
  const saveU = async v => { setUsersDB(v); await sSet("bhu:users",   v, true); };

  // ── AUTH ────────────────────────────────────────────────────
  async function doLogin() {
    if (!authEmail.trim() || !authPass.trim()) { setAuthErr("Please enter email and password."); return; }
    setAuthBusy(true); setAuthErr("");
    const em = authEmail.trim().toLowerCase();
    if (em === ADMIN_EMAIL.toLowerCase()) {
      if (authPass !== adminPass) { setAuthErr("Invalid admin password."); setAuthBusy(false); return; }
      const u = { email: em, name: "Admin", isAdmin: true, year: "Administrator", roll: "" };
      setCurrentUser(u); await sSet("bhu:session", u, false);
      setShowLogin(false); setAuthEmail(""); setAuthPass(""); toast$("Welcome, Admin! 🛡️");
    } else {
      const found = usersDB.find(u => u.email.toLowerCase() === em);
      if (!found) { setAuthErr("Account not found. Please register first."); setAuthBusy(false); return; }
      if (found.password !== authPass) { setAuthErr("Incorrect password. Try again."); setAuthBusy(false); return; }
      const u = { ...found, isAdmin: false };
      setCurrentUser(u); await sSet("bhu:session", u, false);
      setShowLogin(false); setAuthEmail(""); setAuthPass(""); toast$(`Welcome back, ${found.name}! 🎓`);
    }
    setAuthBusy(false);
  }

  async function doRegister() {
    if (!regName.trim() || !regEmail.trim() || !regPass.trim()) { setRegErr("Please fill all required fields."); return; }
    if (regPass.length < 6) { setRegErr("Password must be at least 6 characters."); return; }
    const em = regEmail.trim().toLowerCase();
    if (em === ADMIN_EMAIL.toLowerCase()) { setRegErr("This email is reserved."); return; }
    if (usersDB.find(u => u.email.toLowerCase() === em)) { setRegErr("Email already registered. Please login."); return; }
    const newU = {
      id: Date.now().toString(), name: regName.trim(), roll: regRoll.trim(), year: regYear,
      email: em, password: regPass, joinedAt: new Date().toISOString(), subPlan: null, subExpiry: null,
    };
    await saveU([...usersDB, newU]);
    const sess = { ...newU, isAdmin: false };
    setCurrentUser(sess); await sSet("bhu:session", sess, false);
    setShowLogin(false); toast$(`Registered! Welcome, ${newU.name}! 🎉`);
  }

  async function doLogout() {
    setCurrentUser(null); await sDel("bhu:session", false); toast$("Logged out successfully.");
  }

  // ── FILE UPLOAD ─────────────────────────────────────────────
  function handleFileChange(e) {
    const f = e.target.files[0]; if (!f) return;
    if (f.size > 4.5 * 1024 * 1024) { toast$("File exceeds 4.5MB. Use a Google Drive link instead.", "e"); return; }
    setUFile(f);
    const reader = new FileReader();
    reader.onload = ev => setUFileData(ev.target.result);
    reader.readAsDataURL(f);
  }

  async function doUpload() {
    if (!currentUser) { toast$("Please login to upload.", "e"); return; }
    if (!uTitle.trim() || !uSubject) { toast$("Title and Subject are required.", "e"); return; }
    if (!uLink.trim() && !uFileData) { toast$("Please provide a link or upload a file.", "e"); return; }
    setUploading(true);
    const id   = Date.now().toString();
    const note = {
      id, title: uTitle.trim(), subject: uSubject, type: uType, link: uLink.trim(), desc: uDesc.trim(),
      uploader: currentUser.name, uploaderEmail: currentUser.email,
      date: new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }),
      fileName: uFile ? uFile.name : "", status: currentUser.isAdmin ? "approved" : "pending",
      hasFile: !!uFileData, submittedAt: new Date().toISOString(), isPremium: uPremium,
    };
    if (uFileData) await sSet(`bhu:file:${id}`, uFileData, true);
    if (currentUser.isAdmin) { await saveN([note, ...notes]); toast$("Resource published! 📢"); }
    else { await saveP([note, ...pending]); toast$("Submitted for admin review! ⏳"); }
    setUTitle(""); setUSubject(""); setULink(""); setUDesc("");
    setUFile(null); setUFileData(""); setUPremium(false);
    setUploading(false);
  }

  async function downloadNote(note) {
    if (!isSubscriptionActive(currentUser) && note.isPremium) { setShowPricing(true); return; }
    if (note.hasFile) {
      const data = await sGet(`bhu:file:${note.id}`, true);
      if (data) { b64Download(data, note.fileName || "file"); return; }
    }
    if (note.link) { window.open(note.link, "_blank"); return; }
    toast$("No downloadable file found.", "e");
  }

  // ── ADMIN ───────────────────────────────────────────────────
  async function approveNote(id) {
    const n = pending.find(x => x.id === id); if (!n) return;
    await saveP(pending.filter(x => x.id !== id));
    await saveN([{ ...n, status: "approved" }, ...notes]);
    toast$("Resource approved! ✅");
  }

  async function rejectNote(id, reason) {
    const n = pending.find(x => x.id === id); if (!n) return;
    await saveP(pending.filter(x => x.id !== id));
    await saveN([{ ...n, status: "rejected", rejectReason: reason }, ...notes]);
    setRejectItem(null); setRejectReason(""); toast$("Submission rejected.", "e");
  }

  async function deleteNote(id) {
    if (!window.confirm("Delete this resource permanently?")) return;
    await saveN(notes.filter(n => n.id !== id));
    await sDel(`bhu:file:${id}`, true);
    toast$("Resource deleted.");
  }

  async function deleteUser(id) {
    if (!window.confirm("Remove this student account?")) return;
    await saveU(usersDB.filter(u => u.id !== id)); toast$("Student removed.");
  }

  async function grantPremium(userId, plan) {
    const expiry  = getExpiryDate(plan);
    const updated = usersDB.map(u => u.id === userId ? { ...u, subPlan: plan, subExpiry: expiry } : u);
    await saveU(updated);
    if (currentUser && currentUser.id === userId) {
      const ns = { ...currentUser, subPlan: plan, subExpiry: expiry };
      setCurrentUser(ns); await sSet("bhu:session", ns, false);
    }
    toast$(`Premium granted (${plan})! ✅`);
  }

  async function revokePremium(userId) {
    const updated = usersDB.map(u => u.id === userId ? { ...u, subPlan: null, subExpiry: null } : u);
    await saveU(updated); toast$("Premium revoked.");
  }

  // ── QUIZ ────────────────────────────────────────────────────
  function startQuiz(subj) {
    const isPremium = isSubscriptionActive(currentUser);
    const qs = [...(QUIZ_BANK[subj] || [])].filter(q => !q.premium || isPremium).sort(() => Math.random() - .5);
    if (qs.length === 0) { setShowPricing(true); return; }
    setQuizSubj(subj); setQuizQs(qs); setQuizAns(new Array(qs.length).fill(-1));
    setQuizIdx(0); setQuizDone(false);
  }

  // ── RAZORPAY PAYMENT ─────────────────────────────────────────
  async function doPay(planId) {
    if (!currentUser) { setShowPricing(false); setShowLogin(true); return; }
    setPayBusy(true);
    const ok = await loadRazorpay();
    if (!ok) { toast$("Payment gateway failed to load. Try again.", "e"); setPayBusy(false); return; }
    const plan    = PLANS[planId];
    const options = {
      key:         RAZORPAY_KEY,
      amount:      plan.price * 100,
      currency:    "INR",
      name:        "BHU Agriculture Portal",
      description: `${plan.label} Premium Subscription`,
      handler: async function(response) {
        const expiry  = getExpiryDate(planId);
        const updated = usersDB.map(u =>
          u.id === currentUser.id ? { ...u, subPlan: planId, subExpiry: expiry, lastPaymentId: response.razorpay_payment_id } : u
        );
        await saveU(updated);
        const ns = { ...currentUser, subPlan: planId, subExpiry: expiry };
        setCurrentUser(ns); await sSet("bhu:session", ns, false);
        setShowPricing(false);
        toast$(`🎉 Premium activated! Enjoy all features until ${new Date(expiry).toLocaleDateString("en-IN")}`);
      },
      prefill: { name: currentUser.name, email: currentUser.email },
      theme: { color: "#1a6d43" },
      modal: { ondismiss: () => setPayBusy(false) },
    };
    try { new window.Razorpay(options).open(); }
    catch(e) { toast$("Payment error. Please check your Razorpay key.", "e"); }
    setPayBusy(false);
  }

  // ── DERIVED ─────────────────────────────────────────────────
  const approved        = notes.filter(n => n.status === "approved");
  const rejected        = notes.filter(n => n.status === "rejected");
  const isPremiumUser   = isSubscriptionActive(currentUser);
  const myUploads       = currentUser ? approved.filter(n => n.uploaderEmail === currentUser.email) : [];
  const myPending       = currentUser ? pending.filter(n  => n.uploaderEmail === currentUser.email) : [];
  const filtSubs        = SUBJECTS.filter(s => {
    const q = subSearch.toLowerCase();
    return (!q || s.name.toLowerCase().includes(q) || s.topics.some(t => t.toLowerCase().includes(q))) &&
           (!catFilter || s.cat === catFilter);
  });
  const filtRes         = approved.filter(n =>
    !resSearch || n.title.toLowerCase().includes(resSearch.toLowerCase()) || n.subject.toLowerCase().includes(resSearch.toLowerCase())
  );
  const subCount        = (name, type) => approved.filter(n => {
    if (n.subject !== name) return false;
    if (type === "pdf")   return n.type === "PDF";
    if (type === "video") return n.type === "Video" || n.type === "Link";
    return true;
  }).length;
  const premiumStudents = usersDB.filter(u => isSubscriptionActive(u));

  // ── THEME ────────────────────────────────────────────────────
  const C = {
    bg:         dark ? "#080f0a" : "#eef5ef",
    surface:    dark ? "#111d14" : "#ffffff",
    surfaceAlt: dark ? "#0d1910" : "#f4faf5",
    border:     dark ? "#1e3826" : "#cde4d4",
    text:       dark ? "#e0f0e5" : "#0c2e18",
    textMid:    dark ? "#8dc09a" : "#2d6640",
    textMuted:  dark ? "#4e7a5c" : "#6a9a78",
    accent:     "#1a6d43",
    accentB:    "#25a865",
    accentL:    dark ? "#0a2215" : "#e6f7ed",
    gold:       "#c9690a",
    goldL:      dark ? "#1f1200" : "#fff5e6",
    red:        "#c82020",
    redL:       dark ? "#200808" : "#fde8e8",
    blue:       "#1860c8",
    blueL:      dark ? "#080d20" : "#e0eeff",
    navBg:      dark ? "#0b1a0e" : "#124e30",
    hdr:        "linear-gradient(135deg,#082818,#1a6d43)",
    premBg:     dark ? "#1a0f00" : "#fff8f0",
    premBorder: "#f59e0b",
  };

  const sty = {
    card:  { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14 },
    btn:   (bg, col = "white") => ({ background: bg, color: col, border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }),
    input: { width: "100%", padding: "9px 14px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", fontSize: 14, background: C.surfaceAlt, color: C.text, transition: ".2s" },
    label: { display: "block", fontSize: 13, fontWeight: 500, color: C.textMid, marginBottom: 5 },
  };

  // ── LOADING SCREEN ───────────────────────────────────────────
  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:C.bg, flexDirection:"column", gap:18 }}>
      <div style={{ fontSize:56 }}>🌾</div>
      <div style={{ fontFamily:"Playfair Display,serif", fontSize:20, color:C.text }}>BHU Agriculture Portal</div>
      <div style={{ color:C.textMuted, fontSize:13 }}>Loading & syncing data…</div>
      <div style={{ width:180, height:4, background:C.border, borderRadius:2, overflow:"hidden" }}>
        <div style={{ width:"65%", height:"100%", background:C.accentB, borderRadius:2 }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'DM Sans',sans-serif" }}>

      {/* ══ TOAST ══ */}
      {toast && (
        <div className="slide-right" style={{ position:"fixed", top:18, right:18, zIndex:9999, background:toast.t==="s"?"#1a6d43":"#c82020", color:"white", padding:"12px 20px", borderRadius:12, boxShadow:"0 8px 28px rgba(0,0,0,.28)", fontSize:14, fontWeight:500, maxWidth:320, lineHeight:1.4 }}>
          {toast.msg}
        </div>
      )}

      {/* ══ HEADER ══ */}
      <header style={{ background:C.hdr, color:"white", position:"sticky", top:0, zIndex:800, boxShadow:"0 2px 24px rgba(0,0,0,.35)" }}>
        <div className="hdr-row" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 26px", maxWidth:1200, margin:"auto", flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:13 }}>
            <div style={{ width:46, height:46, borderRadius:"50%", background:"rgba(255,255,255,.14)", border:"2px solid rgba(255,255,255,.28)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🌾</div>
            <div>
              <div className="hdr-title" style={{ fontFamily:"Playfair Display,serif", fontSize:19, fontWeight:700, lineHeight:1.2 }}>BHU Agriculture e-Learning</div>
              <div style={{ fontSize:11, opacity:.72, marginTop:1 }}>Banaras Hindu University · Faculty of Agriculture & Technology</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span className="live-dot" style={{ fontSize:12, color:"rgba(255,255,255,.85)", fontWeight:600 }}>Live Sync</span>
            {currentUser?.isAdmin && <span style={{ background:C.gold, color:"white", fontSize:10, padding:"3px 9px", borderRadius:20, fontWeight:700 }}>ADMIN</span>}
            {isPremiumUser && !currentUser?.isAdmin && (
              <span style={{ background:"linear-gradient(90deg,#c9690a,#f59e0b)", color:"white", fontSize:10, padding:"3px 9px", borderRadius:20, fontWeight:700 }}>⭐ PREMIUM</span>
            )}
            {!isPremiumUser && currentUser && !currentUser.isAdmin && (
              <button onClick={()=>setShowPricing(true)} className="premium-shimmer btn-t" style={{ color:"white", border:"none", padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:700, cursor:"pointer" }}>⭐ Go Premium</button>
            )}
            <button onClick={()=>setDark(d=>!d)} style={{ background:"rgba(255,255,255,.12)", border:"1.5px solid rgba(255,255,255,.3)", color:"white", width:34, height:34, borderRadius:8, cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>{dark?"☀️":"🌙"}</button>
            {currentUser ? (
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(255,255,255,.12)", padding:"6px 12px", borderRadius:8, fontSize:13 }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:currentUser.isAdmin?C.gold:isPremiumUser?"#f59e0b":C.accentB, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>
                    {currentUser.isAdmin?"🛡":isPremiumUser?"⭐":currentUser.name[0].toUpperCase()}
                  </div>
                  <span style={{ display:"inline" }}>{currentUser.name}</span>
                </div>
                <button onClick={doLogout} style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.28)", color:"white", padding:"6px 12px", borderRadius:8, cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>Logout</button>
              </div>
            ) : (
              <button onClick={()=>{setShowLogin(true);setLoginTab("login");}} style={{ background:C.accentB, color:"white", border:"none", padding:"8px 18px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit" }}>🎓 Login / Register</button>
            )}
          </div>
        </div>

        {/* NAV BAR */}
        <nav className="nav-bar" style={{ background:C.navBg, paddingLeft:26, display:"flex", alignItems:"center", gap:2, scrollbarWidth:"none" }}>
          {[
            { id:"home",      label:"🏠 Home" },
            { id:"subjects",  label:"📚 Subjects" },
            { id:"resources", label:"📁 Resources" },
            { id:"upload",    label:"⬆️ Upload" },
            { id:"quiz",      label:"🧠 Quiz" },
            { id:"pricing",   label:"⭐ Premium" },
            ...(currentUser?.isAdmin ? [{ id:"admin", label:"🛡️ Admin Panel" }] : []),
          ].map(t => (
            <button key={t.id} onClick={() => t.id==="pricing" ? setShowPricing(true) : setSection(t.id)}
              className="nav-btn"
              style={{ background:"none", border:"none", borderBottom:`3px solid ${section===t.id?"#f59e0b":"transparent"}`, color:t.id==="pricing"?"#fbbf24":section===t.id?"white":"rgba(255,255,255,.72)", padding:"12px 14px", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ══ MAIN CONTENT ══ */}
      <div className="main-pad" style={{ maxWidth:1160, margin:"0 auto", padding:"0 18px 80px" }}>

        {/* ════════════ HOME ════════════ */}
        {section==="home" && (
          <div className="fade-up">
            {/* Hero */}
            <div style={{ background:"linear-gradient(135deg,#082818,#145232)", color:"white", borderRadius:"0 0 24px 24px", padding:"56px 32px 48px", textAlign:"center", position:"relative", overflow:"hidden", marginBottom:28 }}>
              <div style={{ position:"absolute", inset:0, backgroundImage:"url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=40')", backgroundSize:"cover", backgroundPosition:"center", opacity:.14 }} />
              <div style={{ position:"relative" }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,.11)", border:"1px solid rgba(255,255,255,.2)", padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:600, marginBottom:20 }}>
                  🌿 BHU Faculty of Agriculture & Technology
                </div>
                <h1 className="hero-h" style={{ fontFamily:"Playfair Display,serif", fontSize:40, lineHeight:1.25, marginBottom:14, fontWeight:700 }}>
                  Your Complete Agriculture<br />Learning Companion
                </h1>
                <p style={{ fontSize:15, opacity:.85, lineHeight:1.7, maxWidth:540, margin:"0 auto 28px" }}>
                  Access lecture notes, PDFs, video lectures, and quizzes — all synced live across every device.
                </p>
                <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                  <button onClick={()=>setSection("subjects")} className="btn-t" style={{ background:C.accentB, color:"white", border:"none", padding:"12px 28px", borderRadius:10, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Explore Subjects →</button>
                  <button onClick={()=>setShowPricing(true)}   className="btn-t" style={{ background:"linear-gradient(90deg,#c9690a,#f59e0b)", color:"white", border:"none", padding:"12px 28px", borderRadius:10, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>⭐ Get Premium — ₹19/mo</button>
                </div>
                <div className="stats-row" style={{ display:"flex", gap:48, justifyContent:"center", flexWrap:"wrap", marginTop:44, paddingTop:32, borderTop:"1px solid rgba(255,255,255,.14)" }}>
                  {[{num:SUBJECTS.length,label:"Subjects"},{num:approved.length,label:"Resources"},{num:usersDB.length,label:"Students"},{num:premiumStudents.length,label:"Premium Members"}].map((s,i) => (
                    <div key={i} style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"Playfair Display,serif", fontSize:36, fontWeight:700, lineHeight:1 }}>{s.num}</div>
                      <div style={{ fontSize:13, opacity:.72, marginTop:4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Premium banner */}
            {!isPremiumUser && currentUser && !currentUser.isAdmin && (
              <div className="fade-in" style={{ background:"linear-gradient(135deg,#1a0a00,#3d1f00)", border:"1px solid #f59e0b", borderRadius:16, padding:"24px 28px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
                <div>
                  <div style={{ fontFamily:"Playfair Display,serif", fontSize:20, color:"#fbbf24", fontWeight:700, marginBottom:6 }}>⭐ Unlock Premium Features</div>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,.8)", lineHeight:1.6 }}>Get all premium PDF notes, video lectures, previous year papers & advanced quizzes</p>
                  <div style={{ display:"flex", gap:16, marginTop:10, flexWrap:"wrap" }}>
                    {["📄 Premium PDFs","🎬 All Videos","📝 PYQ Papers","🧠 Full Quiz Bank"].map(f => (
                      <span key={f} style={{ fontSize:12, color:"#fbbf24", fontWeight:600 }}>✓ {f}</span>
                    ))}
                  </div>
                </div>
                <button onClick={()=>setShowPricing(true)} style={{ background:"linear-gradient(90deg,#c9690a,#f59e0b)", color:"white", border:"none", padding:"14px 28px", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                  Start at ₹19/month →
                </button>
              </div>
            )}

            {isPremiumUser && !currentUser?.isAdmin && (
              <div style={{ background:dark?"#0a2215":"#e6f7ed", border:`1px solid ${C.accentB}`, borderRadius:12, padding:"14px 20px", marginBottom:24, display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:24 }}>⭐</span>
                <div>
                  <strong style={{ color:C.accent }}>Premium Active</strong>
                  <span style={{ fontSize:13, color:C.textMuted, marginLeft:10 }}>
                    {currentUser.subPlan==="monthly"?"Monthly":"Yearly"} plan · Expires {new Date(currentUser.subExpiry).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            )}

            {/* Feature cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
              {[
                {icon:"📄",title:"PDF Notes",             desc:"Subject-wise lecture notes & PDFs",         premium:true,  action:()=>setSection("resources")},
                {icon:"🎬",title:"Video Lectures",        desc:"Curated video resources for every topic",    premium:true,  action:()=>setSection("resources")},
                {icon:"📝",title:"Previous Year Papers",  desc:"Practice with past exam questions",          premium:true,  action:()=>setSection("resources")},
                {icon:"🧠",title:"Practice Quizzes",      desc:"MCQs with explanations for all subjects",    premium:true,  action:()=>setSection("quiz")},
                {icon:"⬆️",title:"Upload Resources",      desc:"Share notes with your classmates",           premium:false, action:()=>setSection("upload")},
                {icon:"📚",title:"All Subjects",          desc:"Browse 9 agriculture subjects",              premium:false, action:()=>setSection("subjects")},
              ].map((f, i) => (
                <div key={i} onClick={f.premium && !isPremiumUser ? ()=>setShowPricing(true) : f.action}
                  style={{ ...sty.card, padding:"20px 18px", cursor:"pointer", position:"relative", overflow:"hidden" }} className="hover-lift">
                  {f.premium && <div style={{ position:"absolute", top:10, right:10, background:"linear-gradient(90deg,#c9690a,#f59e0b)", color:"white", fontSize:9, padding:"2px 7px", borderRadius:10, fontWeight:700 }}>PREMIUM</div>}
                  <div style={{ fontSize:30, marginBottom:10 }}>{f.icon}</div>
                  <div style={{ fontWeight:600, fontSize:14, color:C.text, marginBottom:4 }}>{f.title}</div>
                  <div style={{ fontSize:12, color:C.textMuted, lineHeight:1.5 }}>{f.desc}</div>
                  {f.premium && !isPremiumUser && <div style={{ fontSize:11, color:C.gold, marginTop:8, fontWeight:600 }}>🔒 Premium only</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════ SUBJECTS ════════════ */}
        {section==="subjects" && (
          <div style={{ paddingTop:28 }} className="fade-up">
            <h2 style={{ fontFamily:"Playfair Display,serif", fontSize:26, color:C.accent, marginBottom:4 }}>Agriculture Subjects</h2>
            <p style={{ color:C.textMuted, fontSize:14, marginBottom:20 }}>{SUBJECTS.length} subjects — click to view notes & videos</p>
            <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
              <input value={subSearch} onChange={e=>setSubSearch(e.target.value)} placeholder="Search subjects or topics…" style={{ ...sty.input, flex:1, minWidth:200 }} />
              {["","core","applied","science"].map(c => (
                <button key={c} onClick={()=>setCatFilter(c)} style={{ padding:"8px 16px", borderRadius:20, border:`1.5px solid ${catFilter===c?C.accent:C.border}`, background:catFilter===c?C.accent:C.surface, color:catFilter===c?"white":C.textMid, fontFamily:"inherit", fontSize:13, cursor:"pointer", transition:".2s" }}>
                  {c===""?"All":c.charAt(0).toUpperCase()+c.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
              {filtSubs.map(s => (
                <div key={s.id} style={{ ...sty.card, padding:20 }} className="hover-lift">
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:28 }}>{s.icon}</span>
                      <div>
                        <div style={{ fontWeight:600, fontSize:15, color:C.text }}>{s.name}</div>
                        <span style={{ fontSize:11, color:C.textMuted, textTransform:"capitalize" }}>{s.cat}</span>
                      </div>
                    </div>
                    {s.badge && <span style={{ background:C.accentL, color:C.accent, fontSize:10, padding:"2px 8px", borderRadius:10, fontWeight:700 }}>{s.badge}</span>}
                  </div>
                  <p style={{ fontSize:13, color:C.textMuted, lineHeight:1.55, marginBottom:12 }}>{s.desc}</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:14 }}>
                    {s.topics.map(t => <span key={t} style={{ background:C.surfaceAlt, color:C.textMid, fontSize:11, padding:"3px 9px", borderRadius:10, border:`1px solid ${C.border}` }}>{t}</span>)}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={()=>setViewer({subject:s.name,type:"pdf"})} style={{ ...sty.btn(C.accentL,C.accent), border:`1px solid ${C.border}`, flex:1, textAlign:"center" }}>
                      📄 Notes {subCount(s.name,"pdf")>0&&`(${subCount(s.name,"pdf")})`}
                    </button>
                    <button onClick={()=>setViewer({subject:s.name,type:"video"})} style={{ ...sty.btn(C.blueL,C.blue), border:`1px solid ${C.border}`, flex:1, textAlign:"center" }}>
                      🎬 Videos {subCount(s.name,"video")>0&&`(${subCount(s.name,"video")})`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════ RESOURCES ════════════ */}
        {section==="resources" && (
          <div style={{ paddingTop:28 }} className="fade-up">
            <h2 style={{ fontFamily:"Playfair Display,serif", fontSize:26, color:C.accent, marginBottom:4 }}>Resource Library</h2>
            <p style={{ color:C.textMuted, fontSize:14, marginBottom:20 }}>{approved.length} resource{approved.length!==1?"s":""} available</p>
            <input value={resSearch} onChange={e=>setResSearch(e.target.value)} placeholder="Search by title or subject…" style={{ ...sty.input, marginBottom:20 }} />
            {filtRes.length===0 ? (
              <div style={{ ...sty.card, padding:48, textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
                <p style={{ fontSize:15, fontWeight:600, color:C.textMid }}>{approved.length===0?"No resources yet — be the first to upload!":"No results found."}</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {filtRes.map(n => (
                  <NoteCard key={n.id} note={n} C={C} currentUser={currentUser} isPremiumUser={isPremiumUser}
                    onAction={()=>downloadNote(n)} onDelete={()=>deleteNote(n.id)} sty={sty}
                    onUpgrade={()=>setShowPricing(true)} expanded />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════ UPLOAD ════════════ */}
        {section==="upload" && (
          <div style={{ paddingTop:28 }} className="fade-up">
            <h2 style={{ fontFamily:"Playfair Display,serif", fontSize:26, color:C.accent, marginBottom:4 }}>Upload Resource</h2>
            <p style={{ color:C.textMuted, fontSize:14, marginBottom:24 }}>
              {currentUser?.isAdmin ? "Admin uploads are published immediately." : "Your submission will be reviewed by admin before going live."}
            </p>
            {!currentUser ? (
              <div style={{ ...sty.card, padding:48, textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🔒</div>
                <p style={{ fontSize:15, color:C.textMid, marginBottom:16 }}>Please log in to upload resources.</p>
                <button onClick={()=>setShowLogin(true)} style={{ ...sty.btn(C.accent), padding:"10px 24px" }}>Login / Register</button>
              </div>
            ) : (
              <div style={{ maxWidth:580 }}>
                <div style={{ ...sty.card, padding:24 }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <div>
                      <label style={sty.label}>Resource Title *</label>
                      <input value={uTitle} onChange={e=>setUTitle(e.target.value)} placeholder="e.g., Agronomy Unit 3 — Weed Management" style={sty.input} />
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      <div>
                        <label style={sty.label}>Subject *</label>
                        <select value={uSubject} onChange={e=>setUSubject(e.target.value)} style={{ ...sty.input, cursor:"pointer" }}>
                          <option value="">— Select —</option>
                          {SUBJECTS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={sty.label}>Type</label>
                        <select value={uType} onChange={e=>setUType(e.target.value)} style={{ ...sty.input, cursor:"pointer" }}>
                          {["PDF","Notes","Video","Link","PPT","Previous Year Paper","Image"].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={sty.label}>External Link (Google Drive, YouTube, etc.)</label>
                      <input value={uLink} onChange={e=>setULink(e.target.value)} placeholder="https://drive.google.com/…" style={sty.input} />
                    </div>
                    <div>
                      <label style={sty.label}>Upload File (max 4.5 MB)</label>
                      <div onClick={()=>fileRef.current?.click()} style={{ border:`2px dashed ${C.accentB}`, borderRadius:10, padding:20, textAlign:"center", cursor:"pointer", background:C.accentL, transition:".2s" }}>
                        <input ref={fileRef} type="file" style={{ display:"none" }} onChange={handleFileChange} accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png" />
                        <div style={{ fontSize:26, marginBottom:6 }}>📂</div>
                        <div style={{ fontSize:13, color:C.textMid }}>{uFile ? `✅ ${uFile.name}` : "Click to browse or drag & drop"}</div>
                        {uFile && <button onClick={e=>{e.stopPropagation();setUFile(null);setUFileData("");}} style={{ background:"none", border:"none", color:C.red, cursor:"pointer", fontSize:12, marginTop:4 }}>✕ Remove</button>}
                      </div>
                    </div>
                    {currentUser?.isAdmin && (
                      <div style={{ display:"flex", alignItems:"center", gap:10, background:C.goldL, border:`1px solid ${C.premBorder}`, borderRadius:8, padding:"12px 14px" }}>
                        <input type="checkbox" id="premiumCheck" checked={uPremium} onChange={e=>setUPremium(e.target.checked)} style={{ width:16, height:16, cursor:"pointer" }} />
                        <label htmlFor="premiumCheck" style={{ fontSize:13, color:C.gold, fontWeight:600, cursor:"pointer" }}>⭐ Mark as Premium Content (paid subscribers only)</label>
                      </div>
                    )}
                    <div>
                      <label style={sty.label}>Description (optional)</label>
                      <textarea value={uDesc} onChange={e=>setUDesc(e.target.value)} rows={2} placeholder="Brief description of this resource…" style={{ ...sty.input, resize:"vertical" }} />
                    </div>
                    <button disabled={uploading} onClick={doUpload} style={{ ...sty.btn(uploading?C.textMuted:C.accent), padding:"11px 20px", display:"flex", alignItems:"center", gap:8, justifyContent:"center", opacity:uploading?.7:1 }}>
                      {uploading ? <><span className="spin">⏳</span> Uploading…</> : (currentUser.isAdmin ? "📢 Publish Resource" : "📨 Submit for Review")}
                    </button>
                  </div>
                </div>

                {myPending.length > 0 && (
                  <div style={{ marginTop:28 }}>
                    <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:18, color:C.gold, marginBottom:14 }}>⏳ Awaiting Review ({myPending.length})</h3>
                    {myPending.map(n => (
                      <div key={n.id} style={{ background:C.goldL, border:"1px solid #fde68a", borderRadius:10, padding:14, marginBottom:9 }}>
                        <div style={{ fontWeight:600, fontSize:14, color:"#78350f", marginBottom:3 }}>{n.title}</div>
                        <div style={{ fontSize:12, color:"#92400e" }}>{n.subject} · {n.type} · {n.date}</div>
                      </div>
                    ))}
                  </div>
                )}

                {myUploads.length > 0 && (
                  <div style={{ marginTop:24 }}>
                    <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:18, color:C.accent, marginBottom:14 }}>✅ My Approved Uploads ({myUploads.length})</h3>
                    {myUploads.map(n => (
                      <NoteCard key={n.id} note={n} C={C} currentUser={currentUser} isPremiumUser={isPremiumUser}
                        onAction={()=>downloadNote(n)} onDelete={()=>deleteNote(n.id)} sty={sty}
                        onUpgrade={()=>setShowPricing(true)} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════════════ QUIZ ════════════ */}
        {section==="quiz" && (
          <div style={{ paddingTop:28, maxWidth:680 }} className="fade-up">
            <h2 style={{ fontFamily:"Playfair Display,serif", fontSize:26, color:C.accent, marginBottom:4 }}>Practice Quiz</h2>
            <p style={{ color:C.textMuted, fontSize:14, marginBottom:22 }}>Subject-wise MCQs with explanations — {isPremiumUser ? "Full bank unlocked! ⭐" : "2 free Qs per subject · Premium for all"}</p>
            {!quizSubj ? (
              <div style={{ ...sty.card, padding:24 }}>
                <p style={{ fontSize:14, color:C.textMid, marginBottom:16, fontWeight:500 }}>Select a subject to begin:</p>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {Object.entries(QUIZ_BANK).map(([subj, qs]) => {
                    const freeCount  = qs.filter(q => !q.premium).length;
                    const totalCount = qs.length;
                    return (
                      <button key={subj} onClick={()=>startQuiz(subj)} className="btn-t"
                        style={{ background:C.accentL, color:C.accent, border:`1.5px solid ${C.border}`, padding:"9px 18px", borderRadius:20, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:".2s" }}>
                        {subj} <span style={{ opacity:.7, fontWeight:400 }}>({isPremiumUser?totalCount:freeCount}/{totalCount} Qs)</span>
                      </button>
                    );
                  })}
                </div>
                {!isPremiumUser && (
                  <div style={{ marginTop:18, background:C.goldL, border:`1px solid ${C.premBorder}`, borderRadius:10, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                    <div style={{ fontSize:13, color:C.gold, fontWeight:600 }}>⭐ Premium unlocks full quiz bank (5 Qs per subject)</div>
                    <button onClick={()=>setShowPricing(true)} style={{ ...sty.btn("linear-gradient(90deg,#c9690a,#f59e0b)"), padding:"7px 16px", fontSize:12 }}>Upgrade — ₹19/mo</button>
                  </div>
                )}
              </div>
            ) : quizDone ? (
              <div style={{ ...sty.card, padding:28, textAlign:"center" }} className="fade-in">
                <div style={{ fontFamily:"Playfair Display,serif", fontSize:58, color:C.accent, fontWeight:700, lineHeight:1 }}>
                  {quizQs.filter((q,i)=>quizAns[i]===q.ans).length}/{quizQs.length}
                </div>
                <div style={{ fontSize:22, margin:"10px 0 8px" }}>
                  {(quizQs.filter((q,i)=>quizAns[i]===q.ans).length/quizQs.length)>=.8?"🎉 Excellent!":
                   (quizQs.filter((q,i)=>quizAns[i]===q.ans).length/quizQs.length)>=.6?"👍 Good Work!":
                   (quizQs.filter((q,i)=>quizAns[i]===q.ans).length/quizQs.length)>=.4?"📖 Keep Revising":"😅 Study Harder!"}
                </div>
                <p style={{ color:C.textMuted, fontSize:14, marginBottom:24 }}>
                  You scored {Math.round(quizQs.filter((q,i)=>quizAns[i]===q.ans).length/quizQs.length*100)}% in {quizSubj}
                </p>
                <div style={{ textAlign:"left", marginBottom:24 }}>
                  {quizQs.map((q, qi) => {
                    const correct = quizAns[qi] === q.ans;
                    return (
                      <div key={qi} style={{ background:correct?C.accentL:C.redL, border:`1px solid ${correct?C.border:"#fca5a5"}`, borderRadius:10, padding:14, marginBottom:10 }}>
                        <p style={{ fontSize:14, fontWeight:500, marginBottom:8, color:C.text }}>Q{qi+1}: {q.q}</p>
                        <p style={{ fontSize:13, marginBottom:5 }}>
                          Your answer: <strong style={{ color:correct?C.accent:C.red }}>{quizAns[qi]===-1?"Not answered":q.opts[quizAns[qi]]}</strong>
                          {!correct && <> · Correct: <strong style={{ color:C.accent }}>{q.opts[q.ans]}</strong></>}
                        </p>
                        <p style={{ fontSize:12, color:C.textMuted }}>💡 {q.exp}</p>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                  <button onClick={()=>startQuiz(quizSubj)} style={{ ...sty.btn(C.accent), padding:"10px 22px" }}>Try Again</button>
                  <button onClick={()=>setQuizSubj("")} style={{ ...sty.btn(C.accentL,C.accent), border:`1px solid ${C.border}`, padding:"10px 22px" }}>Change Subject</button>
                </div>
              </div>
            ) : (
              <div style={{ ...sty.card, padding:24 }} className="fade-in">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontSize:13, color:C.textMuted, fontWeight:500 }}>{quizSubj} · Q{quizIdx+1} of {quizQs.length}</span>
                  <button onClick={()=>setQuizSubj("")} style={{ background:"none", border:"none", color:C.textMuted, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>✕ Exit</button>
                </div>
                <div style={{ height:6, background:C.border, borderRadius:3, marginBottom:22, overflow:"hidden" }}>
                  <div style={{ height:"100%", background:C.accentB, borderRadius:3, transition:"width .35s", width:`${(quizIdx+1)/quizQs.length*100}%` }} />
                </div>
                <h4 style={{ fontSize:16, fontWeight:600, marginBottom:16, lineHeight:1.55, color:C.text }}>{quizQs[quizIdx].q}</h4>
                <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:20 }}>
                  {quizQs[quizIdx].opts.map((opt, i) => (
                    <div key={i} onClick={()=>{const a=[...quizAns];a[quizIdx]=i;setQuizAns(a);}}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 15px", border:`1.5px solid ${quizAns[quizIdx]===i?C.accentB:C.border}`, borderRadius:10, cursor:"pointer", fontSize:14, transition:".2s", background:quizAns[quizIdx]===i?C.accentL:C.surface, color:C.text }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${quizAns[quizIdx]===i?C.accentB:C.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background:quizAns[quizIdx]===i?C.accentB:"transparent" }}>
                        {quizAns[quizIdx]===i && <div style={{ width:7, height:7, borderRadius:"50%", background:"white" }} />}
                      </div>
                      {opt}
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:10, justifyContent:"space-between" }}>
                  <button disabled={quizIdx===0} onClick={()=>setQuizIdx(i=>i-1)} style={{ ...sty.btn(C.surfaceAlt,C.textMid), border:`1px solid ${C.border}`, opacity:quizIdx===0?.4:1 }}>← Previous</button>
                  {quizIdx < quizQs.length-1
                    ? <button onClick={()=>setQuizIdx(i=>i+1)} style={{ ...sty.btn(C.accent) }}>Next →</button>
                    : <button onClick={()=>setQuizDone(true)} style={{ ...sty.btn("#16a34a"), padding:"8px 22px" }}>Submit Quiz ✓</button>
                  }
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════ ADMIN PANEL ════════════ */}
        {section==="admin" && currentUser?.isAdmin && (
          <div style={{ paddingTop:28 }} className="fade-up">
            <h2 style={{ fontFamily:"Playfair Display,serif", fontSize:26, color:C.gold, marginBottom:4 }}>🛡️ Admin Dashboard</h2>
            <p style={{ color:C.textMuted, fontSize:14, marginBottom:20 }}>Manage resources, students, subscriptions and settings</p>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(125px,1fr))", gap:12, marginBottom:22 }}>
              {[
                {n:notes.length+pending.length, l:"Total Submissions", c:C.accent},
                {n:pending.length,              l:"Pending Review",    c:C.gold},
                {n:approved.length,             l:"Approved",          c:"#16a34a"},
                {n:usersDB.length,              l:"Students",          c:C.blue},
                {n:premiumStudents.length,      l:"Premium Members",   c:"#f59e0b"},
              ].map((s, i) => (
                <div key={i} style={{ ...sty.card, padding:"14px 16px", textAlign:"center" }}>
                  <div style={{ fontFamily:"Playfair Display,serif", fontSize:28, fontWeight:700, color:s.c }}>{s.n}</div>
                  <div style={{ fontSize:11, color:C.textMuted, marginTop:3 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Tab buttons */}
            <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
              {[
                {id:"pending",     label:`Pending (${pending.length})`},
                {id:"approved",    label:`Approved (${approved.length})`},
                {id:"rejected",    label:`Rejected (${rejected.length})`},
                {id:"users",       label:`Students (${usersDB.length})`},
                {id:"subscribers", label:`Subscribers (${premiumStudents.length})`},
                {id:"settings",    label:"Settings"},
              ].map(t => (
                <button key={t.id} onClick={()=>setAdminTab(t.id)} style={{ padding:"8px 16px", borderRadius:20, border:`1.5px solid ${adminTab===t.id?C.accent:C.border}`, background:adminTab===t.id?C.accent:C.surface, color:adminTab===t.id?"white":C.textMid, fontFamily:"inherit", fontSize:13, fontWeight:500, cursor:"pointer", transition:".2s" }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* PENDING */}
            {adminTab==="pending" && (
              <div className="fade-in">
                {pending.length===0
                  ? <div style={{ textAlign:"center", color:C.textMuted, padding:"32px 20px", fontSize:14 }}>✅ No pending submissions!</div>
                  : pending.map(n => (
                    <div key={n.id} style={{ background:C.goldL, border:"1px solid #fde68a", borderRadius:12, padding:18, marginBottom:12 }}>
                      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                        <span style={{ fontSize:26, flexShrink:0 }}>{n.type==="Video"?"🎬":n.type==="Link"?"🔗":"📄"}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:600, fontSize:15, color:"#78350f", marginBottom:4 }}>{n.title}</div>
                          <div style={{ fontSize:12, color:"#92400e", marginBottom:6 }}>{n.subject} · {n.type} · By <strong>{n.uploader}</strong> · {n.date}</div>
                          {n.desc && <p style={{ fontSize:13, color:"#78350f", marginBottom:8 }}>{n.desc}</p>}
                          {n.link && <a href={n.link} target="_blank" rel="noreferrer" style={{ fontSize:12, color:C.blue, display:"block", marginBottom:8 }}>🔗 Preview Link</a>}
                          {n.hasFile && <button onClick={async()=>{const d=await sGet(`bhu:file:${n.id}`,true);if(d)b64Download(d,n.fileName);}} style={{ background:"none", border:"none", color:C.blue, cursor:"pointer", fontSize:12, padding:0, fontFamily:"inherit" }}>📥 Download File</button>}
                          <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
                            <button onClick={()=>approveNote(n.id)} style={{ ...sty.btn("#16a34a"), padding:"8px 18px" }}>✓ Approve</button>
                            <button onClick={()=>setRejectItem(n)} style={{ ...sty.btn(C.red), padding:"8px 14px" }}>✕ Reject</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* APPROVED */}
            {adminTab==="approved" && (
              <div className="fade-in">
                {approved.length===0
                  ? <div style={{ textAlign:"center", color:C.textMuted, padding:"32px 20px", fontSize:14 }}>No approved resources yet.</div>
                  : approved.map(n => <NoteCard key={n.id} note={n} C={C} currentUser={currentUser} isPremiumUser={true} onAction={()=>downloadNote(n)} onDelete={()=>deleteNote(n.id)} sty={sty} onUpgrade={()=>{}} expanded />)
                }
              </div>
            )}

            {/* REJECTED */}
            {adminTab==="rejected" && (
              <div className="fade-in">
                {rejected.length===0
                  ? <div style={{ textAlign:"center", color:C.textMuted, padding:"32px 20px", fontSize:14 }}>No rejected submissions.</div>
                  : rejected.map(n => (
                    <div key={n.id} style={{ background:C.redL, border:"1px solid #fca5a5", borderRadius:10, padding:14, marginBottom:10 }}>
                      <div style={{ fontWeight:600, fontSize:14, color:"#991b1b", marginBottom:4 }}>{n.title}</div>
                      <div style={{ fontSize:12, color:"#b91c1c", marginBottom:4 }}>{n.subject} · By {n.uploader} · {n.date}</div>
                      {n.rejectReason && <div style={{ fontSize:12, color:"#b91c1c", marginBottom:8 }}>Reason: {n.rejectReason}</div>}
                      <button onClick={()=>deleteNote(n.id)} style={{ ...sty.btn(C.red), padding:"5px 12px", fontSize:12 }}>🗑 Delete</button>
                    </div>
                  ))
                }
              </div>
            )}

            {/* STUDENTS */}
            {adminTab==="users" && (
              <div className="fade-in">
                {usersDB.length===0
                  ? <div style={{ textAlign:"center", color:C.textMuted, padding:"32px 20px", fontSize:14 }}>No registered students yet.</div>
                  : (
                    <div style={{ ...sty.card, overflow:"hidden" }}>
                      <div style={{ overflowX:"auto" }}>
                        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                          <thead>
                            <tr style={{ background:C.surfaceAlt }}>
                              {["Name","Email","Roll No.","Year","Joined","Action"].map(h => (
                                <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontWeight:600, color:C.textMid, borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap", fontSize:12 }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {usersDB.map(u => (
                              <tr key={u.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                                <td style={{ padding:"10px 14px", fontWeight:500, color:C.text }}>{u.name}</td>
                                <td style={{ padding:"10px 14px", color:C.textMuted }}>{u.email}</td>
                                <td style={{ padding:"10px 14px", color:C.textMuted }}>{u.roll||"—"}</td>
                                <td style={{ padding:"10px 14px", color:C.textMuted, whiteSpace:"nowrap" }}>{u.year}</td>
                                <td style={{ padding:"10px 14px", color:C.textMuted, whiteSpace:"nowrap" }}>{u.joinedAt ? new Date(u.joinedAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—"}</td>
                                <td style={{ padding:"10px 14px" }}>
                                  <button onClick={()=>deleteUser(u.id)} style={{ background:C.redL, color:C.red, border:"none", padding:"4px 10px", borderRadius:6, fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>Remove</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                }
              </div>
            )}

            {/* SUBSCRIBERS */}
            {adminTab==="subscribers" && (
              <div className="fade-in">
                <p style={{ fontSize:13, color:C.textMuted, marginBottom:16 }}>Manage premium subscriptions. Grant or revoke access manually below.</p>
                {usersDB.length===0
                  ? <div style={{ textAlign:"center", color:C.textMuted, padding:"32px 20px", fontSize:14 }}>No registered students yet.</div>
                  : (
                    <div style={{ ...sty.card, overflow:"hidden" }}>
                      <div style={{ overflowX:"auto" }}>
                        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                          <thead>
                            <tr style={{ background:C.surfaceAlt }}>
                              {["Name","Email","Status","Plan","Expiry","Action"].map(h => (
                                <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontWeight:600, color:C.textMid, borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap", fontSize:12 }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {usersDB.map(u => {
                              const active = isSubscriptionActive(u);
                              return (
                                <tr key={u.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                                  <td style={{ padding:"10px 14px", fontWeight:500, color:C.text }}>{u.name}</td>
                                  <td style={{ padding:"10px 14px", color:C.textMuted }}>{u.email}</td>
                                  <td style={{ padding:"10px 14px" }}>
                                    <span style={{ background:active?C.accentL:C.redL, color:active?C.accent:C.red, padding:"3px 10px", borderRadius:10, fontSize:11, fontWeight:700 }}>
                                      {active?"⭐ Active":"Free"}
                                    </span>
                                  </td>
                                  <td style={{ padding:"10px 14px", color:C.textMuted }}>{u.subPlan||"—"}</td>
                                  <td style={{ padding:"10px 14px", color:C.textMuted, whiteSpace:"nowrap" }}>{u.subExpiry ? new Date(u.subExpiry).toLocaleDateString("en-IN") : "—"}</td>
                                  <td style={{ padding:"10px 14px" }}>
                                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                                      {!active && <button onClick={()=>grantPremium(u.id,"monthly")} style={{ background:C.accentL, color:C.accent, border:"none", padding:"3px 8px", borderRadius:5, fontSize:10, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>+Monthly</button>}
                                      {!active && <button onClick={()=>grantPremium(u.id,"yearly")} style={{ background:C.goldL, color:C.gold, border:"none", padding:"3px 8px", borderRadius:5, fontSize:10, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>+Yearly</button>}
                                      {active  && <button onClick={()=>revokePremium(u.id)} style={{ background:C.redL, color:C.red, border:"none", padding:"3px 8px", borderRadius:5, fontSize:10, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>Revoke</button>}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                }
              </div>
            )}

            {/* SETTINGS */}
            {adminTab==="settings" && (
              <div className="fade-in" style={{ maxWidth:480 }}>
                <div style={{ ...sty.card, padding:24, marginBottom:16 }}>
                  <h3 style={{ fontSize:15, fontWeight:600, marginBottom:6, color:C.text }}>🔑 Razorpay Key</h3>
                  <p style={{ fontSize:12, color:C.textMuted, marginBottom:12, lineHeight:1.6 }}>
                    Current key: <code style={{ background:C.surfaceAlt, padding:"2px 6px", borderRadius:4, fontSize:11 }}>{RAZORPAY_KEY}</code><br />
                    To update: edit <strong>src/BHUPortal.jsx</strong> → change <code>RAZORPAY_KEY</code> → push to GitHub → auto-deploys to Cloudflare Pages.
                  </p>
                  <div style={{ background:C.goldL, border:`1px solid ${C.premBorder}`, borderRadius:8, padding:"10px 12px", fontSize:12, color:C.gold }}>
                    💡 Plans: ₹19/month · ₹199/year (amounts set in <code>PLANS</code> constant)
                  </div>
                </div>
                <div style={{ ...sty.card, padding:24, marginBottom:16 }}>
                  <h3 style={{ fontSize:15, fontWeight:600, marginBottom:14, color:C.text }}>🔐 Change Admin Password</h3>
                  <input type="password" value={newAdminPass} onChange={e=>setNewAdminPass(e.target.value)} placeholder="New password (min 6 chars)" style={{ ...sty.input, marginBottom:12 }} />
                  <button onClick={async()=>{
                    if (!newAdminPass.trim() || newAdminPass.length < 6) { toast$("Min 6 characters.","e"); return; }
                    setAdminPass(newAdminPass); await sSet("bhu:adminpass", newAdminPass, false);
                    setNewAdminPass(""); toast$("Password updated! ✅");
                  }} style={{ ...sty.btn(C.gold), padding:"9px 20px" }}>Update Password</button>
                </div>
                <div style={{ ...sty.card, padding:24, marginBottom:16 }}>
                  <h3 style={{ fontSize:15, fontWeight:600, marginBottom:12, color:C.text }}>ℹ️ Portal Info</h3>
                  <p style={{ fontSize:13, color:C.textMuted, marginBottom:4 }}>Admin email: <strong style={{color:C.text}}>{ADMIN_EMAIL}</strong></p>
                  <p style={{ fontSize:13, color:C.textMuted, marginBottom:4 }}>Premium members: <strong style={{color:C.gold}}>{premiumStudents.length}</strong></p>
                  <p style={{ fontSize:13, color:C.textMuted }}>Est. monthly revenue: <strong style={{color:"#16a34a"}}>₹{premiumStudents.length*19}/mo</strong></p>
                </div>
                <div style={{ background:C.redL, border:"1px solid #fca5a5", borderRadius:12, padding:20 }}>
                  <h3 style={{ fontSize:14, fontWeight:600, color:C.red, marginBottom:10 }}>⚠️ Danger Zone</h3>
                  <button onClick={async()=>{
                    if (!window.confirm("⚠️ CLEAR ALL DATA? This cannot be undone.")) return;
                    await saveN([]); await saveP([]); await saveU([]);
                    toast$("All data cleared.", "e");
                  }} style={{ ...sty.btn(C.red), padding:"8px 18px" }}>🗑 Reset All Portal Data</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ FOOTER ══ */}
      <footer style={{ background:"#082818", color:"rgba(255,255,255,.68)", textAlign:"center", padding:"28px 20px" }}>
        <div style={{ fontSize:22, marginBottom:8 }}>🌾</div>
        <p style={{ fontSize:13, lineHeight:2 }}>
          <strong style={{ color:"rgba(255,255,255,.9)" }}>BHU Agriculture e-Learning Portal</strong><br />
          Faculty of Agriculture & Technology · Banaras Hindu University<br />
          <span style={{ fontSize:12, opacity:.6 }}>Premium: ₹19/month · ₹199/year · Admin: {ADMIN_EMAIL}</span>
        </p>
      </footer>

      {/* ══ PRICING MODAL ══ */}
      {showPricing && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:3000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={e=>{if(e.target===e.currentTarget)setShowPricing(false);}}>
          <div style={{ background:C.surface, borderRadius:20, padding:32, width:"100%", maxWidth:480, boxShadow:"0 32px 80px rgba(0,0,0,.5)", position:"relative", maxHeight:"90vh", overflowY:"auto" }} className="fade-up">
            <button onClick={()=>setShowPricing(false)} style={{ position:"absolute", top:14, right:16, background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.textMuted }}>✕</button>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ fontSize:40, marginBottom:8 }}>⭐</div>
              <h2 style={{ fontFamily:"Playfair Display,serif", fontSize:24, color:C.text, marginBottom:6 }}>Unlock Premium Access</h2>
              <p style={{ fontSize:14, color:C.textMuted }}>Full access to all premium content</p>
            </div>
            <div style={{ background:C.surfaceAlt, borderRadius:12, padding:"16px 18px", marginBottom:24 }}>
              {["📄 All Premium PDF Notes & Study Material","🎬 Full Video Lecture Library","📝 Previous Year Question Papers","🧠 Complete Quiz Bank (5 Qs per subject)","📲 Access on Mobile, Tablet & Desktop","🔄 Instant Sync Across All Devices"].map(f => (
                <div key={f} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:`1px solid ${C.border}`, fontSize:13, color:C.text }}>
                  <span style={{ color:"#16a34a", fontWeight:700 }}>✓</span> {f}
                </div>
              ))}
            </div>
            <div className="plan-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
              {Object.values(PLANS).map(plan => (
                <div key={plan.id} style={{ border:`2px solid ${plan.id==="yearly"?C.gold:C.border}`, borderRadius:14, padding:"18px 16px", textAlign:"center", position:"relative", background:plan.id==="yearly"?C.goldL:C.surface }}>
                  {plan.badge && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(90deg,#c9690a,#f59e0b)", color:"white", fontSize:10, padding:"3px 12px", borderRadius:10, fontWeight:700, whiteSpace:"nowrap" }}>{plan.badge}</div>}
                  <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:6 }}>{plan.label}</div>
                  <div style={{ fontFamily:"Playfair Display,serif", fontSize:32, fontWeight:700, color:plan.id==="yearly"?C.gold:C.accent, lineHeight:1 }}>₹{plan.price}</div>
                  <div style={{ fontSize:12, color:C.textMuted, marginBottom:14 }}>per {plan.period}</div>
                  <button onClick={()=>doPay(plan.id)} disabled={payBusy}
                    style={{ ...sty.btn(plan.id==="yearly"?"linear-gradient(90deg,#c9690a,#f59e0b)":C.accent), width:"100%", padding:"10px", fontSize:13, opacity:payBusy?.6:1 }}>
                    {payBusy?"Processing…":`Pay ₹${plan.price}`}
                  </button>
                </div>
              ))}
            </div>
            <p style={{ fontSize:11, color:C.textMuted, textAlign:"center", lineHeight:1.6 }}>
              🔒 Secure payment via Razorpay · UPI, Cards, Net Banking<br />
              No auto-renewal · Cancel anytime
            </p>
          </div>
        </div>
      )}

      {/* ══ LOGIN / REGISTER MODAL ══ */}
      {showLogin && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={e=>{if(e.target===e.currentTarget)setShowLogin(false);}}>
          <div style={{ background:C.surface, borderRadius:16, padding:28, width:"100%", maxWidth:420, boxShadow:"0 28px 70px rgba(0,0,0,.38)", position:"relative", maxHeight:"92vh", overflowY:"auto" }} className="fade-up">
            <button onClick={()=>setShowLogin(false)} style={{ position:"absolute", top:14, right:16, background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.textMuted }}>✕</button>
            <div style={{ fontSize:28, marginBottom:8 }}>🌾</div>
            <h2 style={{ fontFamily:"Playfair Display,serif", fontSize:22, color:C.accent, marginBottom:3 }}>BHU Agriculture Portal</h2>
            <p style={{ fontSize:13, color:C.textMuted, marginBottom:20 }}>Login or create an account to access all features</p>
            <div style={{ display:"flex", borderBottom:`1.5px solid ${C.border}`, marginBottom:22 }}>
              {["login","register"].map(t => (
                <button key={t} onClick={()=>{setLoginTab(t);setAuthErr("");setRegErr("");}}
                  style={{ padding:"10px 20px", background:"none", border:"none", borderBottom:`2.5px solid ${loginTab===t?C.accentB:"transparent"}`, marginBottom:-1.5, fontFamily:"inherit", fontSize:14, fontWeight:500, cursor:"pointer", color:loginTab===t?C.accent:C.textMuted, textTransform:"capitalize", transition:".2s" }}>
                  {t}
                </button>
              ))}
            </div>
            {loginTab==="login" ? (
              <div>
                {authErr && <div style={{ background:C.redL, border:"1px solid #fca5a5", borderRadius:8, padding:"9px 13px", fontSize:13, color:C.red, marginBottom:12 }}>{authErr}</div>}
                <div style={{ marginBottom:12 }}>
                  <label style={sty.label}>Email Address</label>
                  <input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} placeholder="your@email.com" style={sty.input} />
                </div>
                <div style={{ marginBottom:20 }}>
                  <label style={sty.label}>Password</label>
                  <input type="password" value={authPass} onChange={e=>setAuthPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} placeholder="••••••••" style={sty.input} />
                </div>
                <button disabled={authBusy} onClick={doLogin} style={{ ...sty.btn(C.accent), width:"100%", padding:"11px", fontSize:14, opacity:authBusy?.7:1 }}>
                  {authBusy ? "Logging in…" : "Login"}
                </button>
                <div style={{ marginTop:16, padding:"11px 14px", background:C.accentL, borderRadius:8, fontSize:12, color:C.textMid }}>
                  🛡 Admin: <strong>{ADMIN_EMAIL}</strong> · Default password: <strong>admin2025</strong>
                </div>
              </div>
            ) : (
              <div>
                {regErr && <div style={{ background:C.redL, border:"1px solid #fca5a5", borderRadius:8, padding:"9px 13px", fontSize:13, color:C.red, marginBottom:12 }}>{regErr}</div>}
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div>
                    <label style={sty.label}>Full Name *</label>
                    <input value={regName} onChange={e=>setRegName(e.target.value)} placeholder="Your full name" style={sty.input} />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <div>
                      <label style={sty.label}>Roll Number</label>
                      <input value={regRoll} onChange={e=>setRegRoll(e.target.value)} placeholder="e.g., 21AG001" style={sty.input} />
                    </div>
                    <div>
                      <label style={sty.label}>Year / Course</label>
                      <select value={regYear} onChange={e=>setRegYear(e.target.value)} style={{ ...sty.input, cursor:"pointer" }}>
                        {["B.Sc. Ag. Year 1","B.Sc. Ag. Year 2","B.Sc. Ag. Year 3","B.Sc. Ag. Year 4","M.Sc. Agriculture","Ph.D. Agriculture"].map(y => <option key={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={sty.label}>Email Address *</label>
                    <input type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="your@email.com" style={sty.input} />
                  </div>
                  <div>
                    <label style={sty.label}>Password * (min 6 characters)</label>
                    <input type="password" value={regPass} onChange={e=>setRegPass(e.target.value)} placeholder="••••••••" style={sty.input} />
                  </div>
                  <button onClick={doRegister} style={{ ...sty.btn(C.accent), width:"100%", padding:"11px", fontSize:14 }}>Create Account</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ SUBJECT VIEWER MODAL ══ */}
      {viewer && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", zIndex:2500, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
          onClick={e=>{if(e.target===e.currentTarget)setViewer(null);}}>
          <div style={{ background:C.surface, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:680, maxHeight:"88vh", display:"flex", flexDirection:"column", boxShadow:"0 -12px 48px rgba(0,0,0,.4)" }} className="fade-up">
            <div style={{ padding:"18px 20px 14px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
              <div>
                <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:18, color:C.accent }}>{viewer.subject}</h3>
                <span style={{ fontSize:13, color:C.textMuted }}>{viewer.type==="pdf"?"📄 Notes & PDFs":"🎬 Video Lectures"}</span>
              </div>
              <button onClick={()=>setViewer(null)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.textMuted }}>✕</button>
            </div>
            <div style={{ overflowY:"auto", padding:"16px 20px 24px" }}>
              {(() => {
                const items = approved.filter(n =>
                  n.subject === viewer.subject &&
                  (viewer.type==="pdf"
                    ? ["PDF","Notes","PPT","Previous Year Paper","Image"].includes(n.type)
                    : n.type==="Video"||n.type==="Link")
                );
                if (items.length === 0) return (
                  <div style={{ textAlign:"center", padding:"44px 20px" }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
                    <p style={{ fontSize:15, fontWeight:600, color:C.textMid }}>No content yet for {viewer.subject}</p>
                    <button onClick={()=>{setViewer(null);setSection("upload");}} style={{ ...sty.btn(C.accent), marginTop:14, padding:"9px 20px" }}>Upload Resource</button>
                  </div>
                );
                return items.map(n => (
                  <div key={n.id} style={{ border:`1px solid ${n.isPremium?C.premBorder:C.border}`, borderRadius:12, padding:16, marginBottom:12, background:n.isPremium?C.premBg:C.surfaceAlt }}>
                    <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                      <span style={{ fontSize:24, flexShrink:0 }}>{n.type==="Video"?"🎬":n.type==="Link"?"🔗":"📄"}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3, flexWrap:"wrap" }}>
                          <strong style={{ fontSize:15, color:C.accent }}>{n.title}</strong>
                          {n.isPremium && <span style={{ background:"linear-gradient(90deg,#c9690a,#f59e0b)", color:"white", fontSize:9, padding:"2px 7px", borderRadius:8, fontWeight:700 }}>⭐ PREMIUM</span>}
                        </div>
                        <span style={{ fontSize:12, color:C.textMuted }}>{n.date} · By {n.uploader}</span>
                        {n.desc && <p style={{ fontSize:13, color:C.textMuted, marginTop:4, lineHeight:1.5 }}>{n.desc}</p>}
                        <div style={{ marginTop:10, display:"flex", gap:8, flexWrap:"wrap" }}>
                          {n.isPremium && !isPremiumUser
                            ? <button onClick={()=>{setViewer(null);setShowPricing(true);}} style={{ ...sty.btn("linear-gradient(90deg,#c9690a,#f59e0b)"), padding:"7px 16px" }}>🔒 Upgrade to Access</button>
                            : <>
                              {n.hasFile && <button onClick={async()=>{const d=await sGet(`bhu:file:${n.id}`,true);if(d)b64Download(d,n.fileName);}} style={{ ...sty.btn(C.accent), padding:"7px 16px" }}>📥 Download</button>}
                              {n.link && <a href={n.link} target="_blank" rel="noreferrer" style={{ ...sty.btn(C.blueL,C.blue), textDecoration:"none", display:"inline-flex", padding:"7px 16px" }}>🔗 Open Link</a>}
                            </>
                          }
                          {currentUser?.isAdmin && <button onClick={()=>{deleteNote(n.id);setViewer(null);}} style={{ ...sty.btn(C.redL,C.red), border:"none", padding:"7px 12px" }}>🗑 Delete</button>}
                        </div>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ══ REJECT MODAL ══ */}
      {rejectItem && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:3000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:C.surface, borderRadius:14, padding:24, maxWidth:400, width:"100%", boxShadow:"0 28px 70px rgba(0,0,0,.38)" }} className="fade-up">
            <h3 style={{ fontSize:16, fontWeight:600, color:C.red, marginBottom:8 }}>Reject Submission</h3>
            <p style={{ fontSize:13, color:C.textMuted, marginBottom:16 }}>Rejecting: <strong style={{color:C.text}}>{rejectItem.title}</strong></p>
            <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} rows={3} placeholder="Reason for rejection (optional)…" style={{ ...sty.input, resize:"vertical", marginBottom:14 }} />
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button onClick={()=>{setRejectItem(null);setRejectReason("");}} style={{ ...sty.btn(C.surfaceAlt,C.textMid), border:`1px solid ${C.border}` }}>Cancel</button>
              <button onClick={()=>rejectNote(rejectItem.id,rejectReason)} style={{ ...sty.btn(C.red) }}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NOTE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
function NoteCard({ note, C, currentUser, isPremiumUser, onAction, onDelete, sty, onUpgrade, expanded }) {
  const icon   = note.type==="Video"?"🎬":note.type==="Link"?"🔗":"📄";
  const canDel = currentUser && (currentUser.isAdmin || currentUser.email === note.uploaderEmail);
  const locked = note.isPremium && !isPremiumUser;
  return (
    <div style={{ background:note.isPremium?C.premBg:C.surface, border:`1px solid ${note.isPremium?C.premBorder:C.border}`, borderRadius:10, padding:14, marginBottom:expanded?0:8, display:"flex", gap:12, alignItems:"flex-start", transition:".2s" }} className={expanded?"hover-lift":""}>
      <div style={{ fontSize:22, flexShrink:0, marginTop:1 }}>{icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3, flexWrap:"wrap" }}>
          <strong style={{ fontSize:14, color:C.accent, lineHeight:1.3 }}>{note.title}</strong>
          {note.isPremium && <span style={{ background:"linear-gradient(90deg,#c9690a,#f59e0b)", color:"white", fontSize:9, padding:"2px 7px", borderRadius:8, fontWeight:700 }}>⭐ PREMIUM</span>}
        </div>
        <div style={{ fontSize:12, color:C.textMuted, marginBottom:3 }}>
          <span style={{ background:C.accentL, color:C.accent, padding:"1px 7px", borderRadius:12, fontSize:11, fontWeight:600, marginRight:6 }}>{note.subject}</span>
          {note.type} · {note.date} · {note.uploader}
        </div>
        {note.desc && <p style={{ fontSize:12, color:C.textMuted, marginTop:4, lineHeight:1.5 }}>{note.desc}</p>}
        <div style={{ marginTop:8, display:"flex", gap:7, flexWrap:"wrap" }}>
          {locked
            ? <button onClick={onUpgrade} style={{ background:"linear-gradient(90deg,#c9690a,#f59e0b)", color:"white", border:"none", borderRadius:7, padding:"5px 14px", fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>🔒 Upgrade to Access</button>
            : <>
              {note.hasFile && <button onClick={onAction} style={{ ...sty.btn(C.accent), padding:"5px 12px", fontSize:12 }}>📥 Download</button>}
              {note.link && !note.hasFile && <a href={note.link} target="_blank" rel="noreferrer" style={{ ...sty.btn(C.blueL,C.blue), textDecoration:"none", padding:"5px 12px", fontSize:12, display:"inline-flex" }}>🔗 Open Link</a>}
              {note.link && note.hasFile  && <a href={note.link} target="_blank" rel="noreferrer" style={{ ...sty.btn(C.blueL,C.blue), textDecoration:"none", padding:"5px 12px", fontSize:12, display:"inline-flex" }}>🔗 Link</a>}
            </>
          }
          {canDel && <button onClick={onDelete} style={{ background:C.redL, color:C.red, border:"none", borderRadius:7, padding:"5px 10px", fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>🗑 Delete</button>}
        </div>
      </div>
    </div>
  );
}
