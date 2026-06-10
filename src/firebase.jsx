// ════════ Firestore + Auth bridge for React ════════
// window.FB is set by the <script type="module"> in index.html

// in-memory cache so we don't refetch every render
window.__cache = window.__cache || {};
window.__inflight = window.__inflight || {};

// Single source of truth: fetch once + cache.
async function fsLoad(id){
  if (id in window.__cache) return window.__cache[id];
  if (id in window.__inflight) return window.__inflight[id];
  const p = window.FB.fsGet(id).then(d => { window.__cache[id] = d || {}; delete window.__inflight[id]; return window.__cache[id]; });
  window.__inflight[id] = p;
  return p;
}
function fsPeek(id){ return window.__cache[id]; }
function fsInvalidate(id){ delete window.__cache[id]; delete window.__inflight[id]; }

// Debounced write per docId
const __saveTimers = {};
let __pendingSaves = 0;
const __saveListeners = new Set();
function onSaveStateChange(cb){__saveListeners.add(cb);return()=>__saveListeners.delete(cb);}
function emitSave(){__saveListeners.forEach(cb=>cb(__pendingSaves>0));}

function debouncedSave(id, data, delay=700){
  clearTimeout(__saveTimers[id]);
  __pendingSaves++; emitSave();
  __saveTimers[id] = setTimeout(async()=>{
    try { await window.FB.fsSet(id, data); }
    catch(e){ console.error("save fail", id, e); }
    finally { __pendingSaves--; emitSave(); }
  }, delay);
}

// React hook: load a single Firestore doc, keep cache, re-render on mutation
function useFsDoc(id, deps=[]){
  const [data, setData] = useState(()=>fsPeek(id));
  const [loading, setLoading] = useState(()=>!(id in window.__cache));
  const [, force] = useState(0);

  useEffect(()=>{
    if (!id) return;
    let alive = true;
    if (!(id in window.__cache)) setLoading(true);
    fsLoad(id).then(d => { if(alive){ setData(d); setLoading(false); } });
    return ()=>{ alive=false; };
  // eslint-disable-next-line
  }, [id, ...deps]);

  const mutate = (mutator) => {
    const cur = window.__cache[id] || (window.__cache[id]={});
    mutator(cur);
    debouncedSave(id, cur);
    force(x=>x+1);
  };
  const refresh = ()=>{ fsInvalidate(id); fsLoad(id).then(d=>setData(d)); };
  return { data: data || {}, loading, mutate, refresh };
}

// React hook: load N doc IDs in parallel; map of cached docs returned
function useFsDocs(ids){
  const key = ids.join("|");
  const [, force] = useState(0);
  const [loading, setLoading] = useState(()=>ids.some(id=>!(id in window.__cache)));
  useEffect(()=>{
    let alive=true;
    const missing = ids.filter(id=>!(id in window.__cache));
    if (missing.length===0){ setLoading(false); return; }
    setLoading(true);
    Promise.all(missing.map(id=>fsLoad(id))).then(()=>{
      if(alive){ setLoading(false); force(x=>x+1); }
    });
    return ()=>{alive=false;};
  // eslint-disable-next-line
  }, [key]);
  const map = {};
  ids.forEach(id => map[id] = window.__cache[id] || {});
  return { map, loading };
}

// Auth hook
function useAuth(){
  const [state, setState] = useState({loading:true, user:null, role:"viewer", name:""});
  useEffect(()=>{
    const off = window.FB.onAuth(async (u)=>{
      if(!u){ setState({loading:false, user:null, role:"viewer", name:""}); return; }
      const info = await window.FB.fsGetUser(u.uid);
      setState({loading:false, user:u, role:info.role||"viewer", name:info.name||u.email});
    });
    return off;
  }, []);
  return state;
}

// Save indicator hook (subscribes to pending writes)
function useSaving(){
  const [saving, setSaving] = useState(false);
  useEffect(()=>onSaveStateChange(setSaving), []);
  return saving;
}

Object.assign(window, {fsLoad, fsPeek, fsInvalidate, debouncedSave, useFsDoc, useFsDocs, useAuth, useSaving});
