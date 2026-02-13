const KEY = "core_routine_pwa_v1";
const todayStr = () => new Date().toISOString().slice(0,10);

const defaultState = {
  date: todayStr(),
  checks: { db:false, sp:false, bd:false, pp:false },
  sets: { db:[false,false,false], sp:[false,false,false], bd:[false,false,false], pp:[false,false,false] },
  sessionsCompleted: 0,
  lastCompleted: null,
  notesByDate: {}
};

function loadState(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return structuredClone(defaultState);
    const s = JSON.parse(raw);

    if(s.date !== todayStr()){
      s.date = todayStr();
      s.checks = { db:false, sp:false, bd:false, pp:false };
      s.sets = structuredClone(defaultState.sets);
    }

    s.checks ||= structuredClone(defaultState.checks);
    s.sets ||= structuredClone(defaultState.sets);
    s.sessionsCompleted ||= 0;
    s.notesByDate ||= {};
    return s;
  }catch{
    return structuredClone(defaultState);
  }
}
function saveState(s){ localStorage.setItem(KEY, JSON.stringify(s)); }

const els = {
  db: document.getElementById("db"),
  sp: document.getElementById("sp"),
  bd: document.getElementById("bd"),
  pp: document.getElementById("pp"),
  fill: document.getElementById("fill"),
  pct: document.getElementById("pct"),
  sessions: document.getElementById("sessions"),
  lastDone: document.getElementById("lastDone"),
  dateLine: document.getElementById("dateLine"),
  notes: document.getElementById("notes"),
  doneBtn: document.getElementById("doneBtn"),
  resetBtn: document.getElementById("resetBtn"),
  wipeBtn: document.getElementById("wipeBtn"),
};

let state = loadState();

function updateProgress(){
  const done = ["db","sp","bd","pp"].reduce((a,k)=>a+(state.checks[k]?1:0),0);
  const pct = Math.round((done/4)*100);
  els.fill.style.width = pct + "%";
  els.pct.textContent = pct + "%";
}

function updateDateLine(){
  const d = new Date();
  els.dateLine.textContent = "Today: " + d.toLocaleDateString(undefined, { weekday:"long", year:"numeric", month:"short", day:"numeric" });
}

function updateSetButtons(){
  document.querySelectorAll(".setRow").forEach(row=>{
    const ex = row.dataset.ex;
    row.querySelectorAll("button").forEach(btn=>{
      const idx = Number(btn.dataset.set) - 1;
      btn.classList.toggle("active", !!state.sets[ex][idx]);
    });
  });
}

function updateUI(){
  els.db.checked = !!state.checks.db;
  els.sp.checked = !!state.checks.sp;
  els.bd.checked = !!state.checks.bd;
  els.pp.checked = !!state.checks.pp;

  els.sessions.textContent = state.sessionsCompleted;
  els.lastDone.textContent = state.lastCompleted ?? "—";
  els.notes.value = state.notesByDate[state.date] || "";

  updateProgress();
  updateDateLine();
  updateSetButtons();
}

["db","sp","bd","pp"].forEach(id=>{
  els[id].addEventListener("change", ()=>{
    state.checks[id] = els[id].checked;
    saveState(state);
    updateProgress();
  });
});

document.querySelectorAll(".setRow button").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const row = btn.closest(".setRow");
    const ex = row.dataset.ex;
    const idx = Number(btn.dataset.set) - 1;
    state.sets[ex][idx] = !state.sets[ex][idx];
    saveState(state);
    updateSetButtons();
  });
});

els.notes.addEventListener("input", ()=>{
  state.notesByDate[state.date] = els.notes.value;
  saveState(state);
});

els.doneBtn.addEventListener("click", ()=>{
  const allDone = ["db","sp","bd","pp"].every(k => state.checks[k]);
  if(!allDone){
    alert("Check off all 4 exercises first (or check them to mark as done).");
    return;
  }
  state.sessionsCompleted += 1;
  state.lastCompleted = new Date().toLocaleString();
  state.checks = { db:false, sp:false, bd:false, pp:false };
  state.sets = structuredClone(defaultState.sets);
  saveState(state);
  updateUI();
});

els.resetBtn.addEventListener("click", ()=>{
  state.checks = { db:false, sp:false, bd:false, pp:false };
  state.sets = structuredClone(defaultState.sets);
  saveState(state);
  updateUI();
});

els.wipeBtn.addEventListener("click", ()=>{
  if(!confirm("Erase all saved sessions + notes on this device?")) return;
  localStorage.removeItem(KEY);
  state = structuredClone(defaultState);
  saveState(state);
  updateUI();
});

updateUI();
