const {useState,useEffect,useRef,useMemo} = React;

// ── Login (real Firebase Auth) ──────────────────────────────
function Login(){
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);

  const submit=async()=>{
    if(!email||!pass){setErr("กรุณากรอกอีเมลและรหัสผ่าน");return;}
    setBusy(true); setErr("");
    try { await window.FB.signIn(email,pass); }
    catch(e){
      setErr(e.code==="auth/invalid-credential"||e.code==="auth/wrong-password"||e.code==="auth/user-not-found"
        ?"อีเมลหรือรหัสผ่านไม่ถูกต้อง"
        :e.code==="auth/too-many-requests"?"พยายามมากเกินไป กรุณารอสักครู่"
        :e.message);
      setBusy(false);
    }
  };

  return <div style={{minHeight:"100vh",display:"grid",gridTemplateColumns:"1fr 1fr"}}>
    <div style={{position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"space-between",
      padding:"48px 52px",background:"linear-gradient(160deg,var(--brand-700),var(--brand-900))",color:"#fff"}}>
      <div style={{position:"absolute",inset:0,opacity:.5,background:"radial-gradient(900px 500px at 80% 10%,rgba(77,151,211,.5),transparent),radial-gradient(700px 600px at 10% 90%,rgba(15,138,114,.35),transparent)"}}/>
      <svg style={{position:"absolute",right:-80,bottom:-60,opacity:.12}} width="460" height="460" viewBox="0 0 24 24" fill="white">
        <path d="M12 3.2C12 3.2 5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 3.2 12 3.2Z"/></svg>
      <div style={{position:"relative",display:"flex",alignItems:"center",gap:12}}>
        <Logo size={42}/>
        <div style={{fontFamily:"var(--font-display)",fontSize:17,fontWeight:700}}>ระบบจัดการน้ำ</div>
      </div>
      <div style={{position:"relative"}}>
        <div style={{fontFamily:"var(--font-display)",fontSize:34,fontWeight:700,lineHeight:1.25,letterSpacing:"-.01em"}}>
          บริหารจัดการน้ำ<br/>อย่างมั่นใจและแม่นยำ</div>
        <p style={{fontSize:15,opacity:.82,marginTop:16,maxWidth:380,lineHeight:1.6}}>
          ติดตามคุณภาพน้ำเสีย น้ำประปา และค่าพารามิเตอร์ของโรงพยาบาลสงขลานครินทร์ ครบในที่เดียว</p>
        <div style={{display:"flex",gap:24,marginTop:32}}>
          {[["2","ระบบบำบัด"],["11","พารามิเตอร์"],["100%","ตามเกณฑ์ สธ."]].map(([n,l])=>
            <div key={l}><div style={{fontFamily:"var(--font-display)",fontSize:24,fontWeight:700}}>{n}</div>
              <div style={{fontSize:12.5,opacity:.75}}>{l}</div></div>)}
        </div>
      </div>
      <div style={{position:"relative",fontSize:12,opacity:.6}}>© 2569 คณะแพทยศาสตร์ มหาวิทยาลัยสงขลานครินทร์</div>
    </div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40,background:"var(--bg)"}}>
      <div style={{width:368}} className="fade-up">
        <h2 style={{fontFamily:"var(--font-display)",fontSize:25,fontWeight:700,color:"var(--ink-900)"}}>เข้าสู่ระบบ</h2>
        <p style={{fontSize:14,color:"var(--ink-500)",marginTop:6,marginBottom:26}}>กรอกอีเมลและรหัสผ่านของคุณเพื่อเข้าใช้งาน</p>
        {err&&<div style={{padding:"10px 13px",background:"var(--bad-bg)",color:"var(--bad)",border:"1px solid var(--bad-border)",borderRadius:"var(--r-sm)",fontSize:13,marginBottom:16}}>{err}</div>}
        <label style={{display:"block",fontSize:12.5,fontWeight:600,color:"var(--ink-600)",marginBottom:6}}>อีเมล</label>
        <Field value={email} onChange={setEmail} type="email" placeholder="name@psu.ac.th" style={{marginBottom:16,padding:"10px 12px"}}/>
        <label style={{display:"block",fontSize:12.5,fontWeight:600,color:"var(--ink-600)",marginBottom:6}}>รหัสผ่าน</label>
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&submit()}
          placeholder="••••••••"
          style={{width:"100%",padding:"10px 12px",fontFamily:"var(--font)",fontSize:13.5,color:"var(--ink-800)",
            background:"var(--surface)",border:"1px solid var(--border-strong)",borderRadius:"var(--r-sm)",outline:"none",marginBottom:18}}/>
        <Btn variant="primary" size="lg" style={{width:"100%"}} onClick={submit} disabled={busy}>
          {busy?<span className="spin" style={{width:18,height:18,borderColor:"rgba(255,255,255,.4)",borderTopColor:"#fff"}}/>:"เข้าสู่ระบบ"}
        </Btn>
        <p style={{fontSize:12,color:"var(--ink-400)",marginTop:18,textAlign:"center"}}>ลืมรหัสผ่าน? ติดต่อผู้ดูแลระบบ</p>
      </div>
    </div>
  </div>;
}

// ── App root ─────────────────────────────────────────────────
function App(){
  const auth=useAuth();
  const saving=useSaving();
  const [page,setPage]=useState("dashboard");
  const [collapsed,setCollapsed]=useState(false);
  const [month,setMonth]=useState(()=>new Date().getMonth());
  const [year,setYear]=useState(CY);

  // Reset cache on logout so a different user's data doesn't bleed through
  useEffect(()=>{ if(!auth.user){ window.__cache={}; window.__inflight={}; } }, [auth.user]);

  if(auth.loading) return <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",gap:12,color:"var(--ink-500)"}}><div className="spin"/>กำลังเชื่อมต่อ…</div>;
  if(!auth.user) return <Login/>;

  const nav=(id)=>{
    if(id==="__logout"){ window.FB.signOut(); return; }
    setPage(id);
    document.querySelector("#scroll-main")?.scrollTo(0,0);
  };

  const ctx={page,role:auth.role,month,year,setMonth,setYear,nav};

  return <div style={{display:"flex",height:"100vh",overflow:"hidden"}}>
    <Sidebar page={page} onNav={nav} role={auth.role} collapsed={collapsed} onToggle={()=>setCollapsed(c=>!c)} user={{name:auth.name,email:auth.user.email}}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      <Topbar page={page} collapsed={collapsed} onToggle={()=>setCollapsed(false)}/>
      <main id="scroll-main" style={{flex:1,overflowY:"auto",padding:"26px 30px 60px"}}>
        <div key={page} className="fade-up" style={{maxWidth:1240,margin:"0 auto"}}>
          <Router ctx={ctx}/>
        </div>
      </main>
    </div>
    {saving&&<div className="fade-in" style={{position:"fixed",bottom:22,right:26,display:"flex",alignItems:"center",gap:9,
      background:"var(--ink-900)",color:"#fff",padding:"9px 16px",borderRadius:99,fontSize:13,fontWeight:500,
      boxShadow:"var(--sh-lg)",zIndex:50}}><span className="spin" style={{width:14,height:14,borderColor:"rgba(255,255,255,.3)",borderTopColor:"#fff"}}/>กำลังบันทึก…</div>}
  </div>;
}

function Router({ctx}){
  const p=ctx.page;
  if(p==="dashboard") return <Dashboard ctx={ctx}/>;
  if(p==="ww-research-daily") return <WWDaily ctx={ctx} bldg="research"/>;
  if(p==="ww-sth-daily") return <WWDaily ctx={ctx} bldg="sth"/>;
  if(p==="ww-research-param") return <WWParam ctx={ctx} bldg="research"/>;
  if(p==="ww-sth-param") return <WWParam ctx={ctx} bldg="sth"/>;
  if(p==="ww-research-summary") return <WWSummary ctx={ctx} bldg="research"/>;
  if(p==="ww-sth-summary") return <WWSummary ctx={ctx} bldg="sth"/>;
  if(p==="ww-research-analysis") return <WWAnalysis ctx={ctx} bldg="research"/>;
  if(p==="ww-sth-analysis") return <WWAnalysis ctx={ctx} bldg="sth"/>;
  if(p==="water-usage") return <WaterUsage ctx={ctx}/>;
  if(p==="chlorine-start") return <ChlorineStart ctx={ctx}/>;
  if(p==="chlorine-end") return <ChlorineEnd ctx={ctx}/>;
  if(p==="water-analysis") return <WaterAnalysis ctx={ctx}/>;
  if(p==="manage-users") return <ManageUsers ctx={ctx}/>;
  return <div>ไม่พบหน้า</div>;
}

// ── Sidebar ──────────────────────────────────────────────────
function Sidebar({page,onNav,role,collapsed,onToggle,user}){
  const isAdmin=role==="admin";
  const [openGroups,setOpenGroups]=useState({0:true,1:true});
  const NavItem=({id,label,icon,indent})=>{
    const active=page===id;
    const [h,setH]=useState(false);
    return <button onClick={()=>onNav(id)} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{position:"relative",display:"flex",alignItems:"center",gap:10,width:"100%",
        padding:`8px 12px 8px ${indent?30:13}px`,border:"none",cursor:"pointer",textAlign:"left",
        borderRadius:"var(--r-sm)",fontFamily:"var(--font)",fontSize:13.5,fontWeight:active?600:500,
        color:active?"var(--brand-700)":h?"var(--ink-800)":"var(--ink-600)",
        background:active?"var(--brand-50)":h?"var(--surface-2)":"transparent",transition:"all .13s"}}>
      {active&&<span style={{position:"absolute",left:0,top:7,bottom:7,width:3,borderRadius:99,background:"var(--brand-500)"}}/>}
      <Icon name={icon} size={17} stroke={active?2.2:1.9} style={{color:active?"var(--brand-500)":"var(--ink-400)",flexShrink:0}}/>
      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</span>
    </button>;
  };
  let groupIdx=-1;
  return <aside style={{width:collapsed?0:256,flexShrink:0,height:"100%",overflow:"hidden",
    background:"var(--surface)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",
    transition:"width .22s cubic-bezier(.4,0,.2,1)"}}>
    <div style={{width:256,display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:11,padding:"15px 16px",borderBottom:"1px solid var(--border)"}}>
        <Logo size={36}/>
        <div style={{overflow:"hidden",flex:1}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:14.5,fontWeight:700,color:"var(--ink-900)",lineHeight:1.1,whiteSpace:"nowrap"}}>ระบบจัดการน้ำ</div>
          <div style={{fontSize:11.5,color:"var(--ink-400)",marginTop:2,whiteSpace:"nowrap"}}>รพ.สงขลานครินทร์</div>
        </div>
        <button onClick={onToggle} title="ย่อเมนู" style={{border:"none",background:"transparent",color:"var(--ink-400)",cursor:"pointer",padding:4,borderRadius:6,display:"flex"}}>
          <Icon name="menu" size={18}/>
        </button>
      </div>
      <nav style={{flex:1,overflowY:"auto",padding:"10px 10px 16px",display:"flex",flexDirection:"column",gap:1}}>
        {NAV.map((n,i)=>{
          if(n.admin&&!isAdmin) return null;
          if(n.type==="item") return <NavItem key={i} {...n}/>;
          if(n.type==="section") return <div key={i} style={{fontSize:10.5,fontWeight:700,color:"var(--ink-400)",
            textTransform:"uppercase",letterSpacing:".07em",padding:"15px 13px 5px"}}>{n.label}</div>;
          if(n.type==="group"){ groupIdx++; const gi=groupIdx; const open=openGroups[gi]!==false;
            return <div key={i}>
              <button onClick={()=>setOpenGroups(o=>({...o,[gi]:!open}))}
                style={{display:"flex",alignItems:"center",gap:7,width:"100%",padding:"6px 13px 4px",border:"none",
                  background:"transparent",cursor:"pointer",fontFamily:"var(--font)",fontSize:12,fontWeight:600,
                  color:"var(--brand-600)",textAlign:"left"}}>
                <Icon name="chevronDown" size={13} stroke={2.4} style={{transform:open?"none":"rotate(-90deg)",transition:"transform .15s",color:"var(--ink-300)"}}/>
                <span style={{flex:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{n.label}</span>
              </button>
              <div style={{maxHeight:open?400:0,overflow:"hidden",transition:"max-height .25s ease"}}>
                {n.items.map(it=><NavItem key={it.id} {...it} indent/>)}
              </div>
            </div>;
          }
          return null;
        })}
      </nav>
      <div style={{padding:12,borderTop:"1px solid var(--border)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 9px",borderRadius:"var(--r-sm)",background:"var(--surface-2)"}}>
          <div style={{width:34,height:34,borderRadius:"50%",flexShrink:0,
            background:"linear-gradient(145deg,var(--brand-400),var(--brand-600))",color:"#fff",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:600}}>{(user.name||user.email||"?")[0]}</div>
          <div style={{flex:1,overflow:"hidden"}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--ink-800)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name||user.email}</div>
            <div style={{marginTop:2}}><Tag tone={role==="admin"?"brand":"teal"}>{role==="admin"?"ผู้ดูแลระบบ":"ผู้ดูข้อมูล"}</Tag></div>
          </div>
          <button onClick={()=>onNav("__logout")} title="ออกจากระบบ" style={{border:"none",background:"transparent",color:"var(--ink-400)",cursor:"pointer",padding:5,borderRadius:6,display:"flex"}}>
            <Icon name="logout" size={17}/>
          </button>
        </div>
      </div>
    </div>
  </aside>;
}

// ── Topbar ───────────────────────────────────────────────────
function Topbar({page,collapsed,onToggle}){
  const meta=PAGE_META[page]||{title:"",crumb:[]};
  return <header style={{height:62,flexShrink:0,display:"flex",alignItems:"center",gap:16,
    padding:"0 24px",background:"rgba(255,255,255,.82)",backdropFilter:"blur(8px)",
    borderBottom:"1px solid var(--border)",position:"sticky",top:0,zIndex:20}}>
    {collapsed&&<button onClick={onToggle} style={{border:"1px solid var(--border-strong)",background:"var(--surface)",
      color:"var(--ink-600)",cursor:"pointer",padding:7,borderRadius:"var(--r-sm)",display:"flex"}}><Icon name="menu" size={18}/></button>}
    <div style={{minWidth:0}}>
      <div style={{display:"flex",alignItems:"center",gap:7,fontSize:11.5,color:"var(--ink-400)",fontWeight:500,marginBottom:1}}>
        {meta.crumb.map((c,i)=><React.Fragment key={i}>{i>0&&<Icon name="chevron" size={11} style={{color:"var(--ink-300)"}}/>}<span>{c}</span></React.Fragment>)}
      </div>
      <h1 style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:700,color:"var(--ink-900)",lineHeight:1.1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{meta.title}</h1>
    </div>
    <div style={{flex:1}}/>
    <button style={{position:"relative",border:"1px solid var(--border)",background:"var(--surface)",color:"var(--ink-500)",
      cursor:"pointer",padding:8,borderRadius:"var(--r-sm)",display:"flex"}} title="การแจ้งเตือน">
      <Icon name="bell" size={18}/>
    </button>
  </header>;
}

// ── Page header (used by screens) ────────────────────────────
function PageHead({title,subtitle,children}){
  return <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:16,flexWrap:"wrap",marginBottom:20}}>
    <div>
      <h2 style={{fontFamily:"var(--font-display)",fontSize:21,fontWeight:700,color:"var(--ink-900)",lineHeight:1.15}}>{title}</h2>
      {subtitle&&<p style={{fontSize:13.5,color:"var(--ink-500)",marginTop:4}}>{subtitle}</p>}
    </div>
    <div style={{display:"flex",gap:9,flexWrap:"wrap",alignItems:"center"}}>{children}</div>
  </div>;
}

// ── Boot ─────────────────────────────────────────────────────
function boot(){
  if(!window.FB){
    window.addEventListener("firebase-ready", boot, {once:true});
    return;
  }
  ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
}
boot();

Object.assign(window,{Login,App,Router,Sidebar,Topbar,PageHead});
