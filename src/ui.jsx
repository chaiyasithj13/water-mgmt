const {useState,useEffect,useRef,useMemo} = React;

// ── Icon ─────────────────────────────────────────────────────
const ICONS = {
  home:"M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5",
  file:"M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6",
  sliders:"M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5M14 4v4M6 10v4M11 16v4",
  flask:"M9 3h6M10 3v6.5L5.2 17.6A2 2 0 0 0 6.9 21h10.2a2 2 0 0 0 1.7-3.4L14 9.5V3M8 15h8",
  chart:"M4 20h16M7 16v-5M12 16V7M17 16v-8",
  droplet:"M12 3.2C12 3.2 5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 3.2 12 3.2Z",
  beaker:"M7 3h10M9 3v5l-4.2 8.4A2 2 0 0 0 6.6 20h10.8a2 2 0 0 0 1.8-3.6L15 8V3M7.5 14h9",
  users:"M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4M15 4.1a3.5 3.5 0 0 1 0 6.8",
  search:"M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-3.5-3.5",
  bell:"M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  chevron:"M9 6l6 6-6 6",
  chevronDown:"M6 9l6 6 6-6",
  download:"M12 3v12m0 0 4-4m-4 4-4-4M5 21h14",
  plus:"M12 5v14M5 12h14",
  logout:"M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 17l5-5-5-5M21 12H9",
  menu:"M4 6h16M4 12h16M4 18h16",
  check:"M20 6 9 17l-5-5",
  x:"M6 6l12 12M18 6 6 18",
  edit:"M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z",
  trend:"M3 17l6-6 4 4 7-7M14 8h6v6",
  filter:"M4 5h16l-6 7v6l-4 2v-8L4 5Z",
  drop2:"M12 3.2C12 3.2 5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 3.2 12 3.2Z",
  shield:"M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z",
  bolt:"M13 3 4 14h6l-1 7 9-11h-6l1-7Z",
  calendar:"M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z",
  link:"M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1",
};
function Icon({name,size=18,stroke=2,style,className}){
  const d=ICONS[name]||""; 
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    {d.split("M").filter(Boolean).map((seg,i)=><path key={i} d={"M"+seg}/>)}
  </svg>;
}

// ── Logo ─────────────────────────────────────────────────────
function Logo({size=34}){
  return <div style={{width:size,height:size,borderRadius:size*0.3,flexShrink:0,
    background:"linear-gradient(150deg,var(--brand-400),var(--brand-600) 70%)",
    display:"flex",alignItems:"center",justifyContent:"center",
    boxShadow:"0 4px 10px -2px rgba(21,94,156,.5),inset 0 1px 0 rgba(255,255,255,.35)"}}>
    <svg width={size*0.56} height={size*0.56} viewBox="0 0 24 24" fill="none">
      <path d="M12 3.2C12 3.2 5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 3.2 12 3.2Z" fill="white" fillOpacity="0.95"/>
      <path d="M9.2 14.6a2.8 2.8 0 0 0 2.4 2.4" stroke="var(--brand-500)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  </div>;
}

// ── Button ───────────────────────────────────────────────────
function Btn({children,variant="ghost",size="md",icon,onClick,style,type,disabled}){
  const base={display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,
    fontFamily:"var(--font)",fontWeight:600,cursor:disabled?"not-allowed":"pointer",
    border:"1px solid transparent",borderRadius:"var(--r-sm)",transition:"all .15s ease",
    whiteSpace:"nowrap",opacity:disabled?.55:1,...style};
  const sizes={sm:{padding:"5px 11px",fontSize:12.5},md:{padding:"8px 15px",fontSize:13.5},lg:{padding:"11px 20px",fontSize:15}};
  const variants={
    primary:{background:"var(--brand-500)",color:"#fff",boxShadow:"0 1px 2px rgba(21,94,156,.4)"},
    teal:{background:"var(--teal-500)",color:"#fff"},
    ghost:{background:"var(--surface)",color:"var(--ink-700)",borderColor:"var(--border-strong)"},
    subtle:{background:"var(--surface-2)",color:"var(--ink-600)",borderColor:"transparent"},
    danger:{background:"var(--bad-bg)",color:"var(--bad)",borderColor:"var(--bad-border)"},
  };
  const [h,setH]=useState(false);
  const hov={primary:{background:"var(--brand-600)"},teal:{background:"var(--teal-600)"},
    ghost:{background:"var(--surface-2)",borderColor:"#c2ccd9"},subtle:{background:"#eef2f7"},danger:{background:"#f7dede"}};
  return <button type={type||"button"} disabled={disabled} onClick={onClick}
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{...base,...sizes[size],...variants[variant],...(h&&!disabled?hov[variant]:{})}}>
    {icon&&<Icon name={icon} size={size==="sm"?14:16} stroke={2.1}/>}{children}
  </button>;
}

// ── Card ─────────────────────────────────────────────────────
function Card({children,style,pad=20,className}){
  return <div className={className} style={{background:"var(--surface)",border:"1px solid var(--border)",
    borderRadius:"var(--r-lg)",boxShadow:"var(--sh-sm)",padding:pad,...style}}>{children}</div>;
}

// ── Tag / Badge ──────────────────────────────────────────────
function Tag({children,tone="brand",style}){
  const tones={
    brand:{bg:"var(--brand-50)",fg:"var(--brand-700)",bd:"var(--brand-100)"},
    teal:{bg:"var(--teal-50)",fg:"var(--teal-700)",bd:"var(--teal-100)"},
    ok:{bg:"var(--ok-bg)",fg:"var(--ok)",bd:"var(--ok-border)"},
    warn:{bg:"var(--warn-bg)",fg:"var(--warn)",bd:"var(--warn-border)"},
    bad:{bg:"var(--bad-bg)",fg:"var(--bad)",bd:"var(--bad-border)"},
    gray:{bg:"var(--surface-2)",fg:"var(--ink-500)",bd:"var(--border)"},
  }[tone];
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"2px 9px",borderRadius:99,
    fontSize:11.5,fontWeight:600,background:tones.bg,color:tones.fg,border:`1px solid ${tones.bd}`,...style}}>{children}</span>;
}
function Dot({tone}){const c={ok:"var(--ok)",warn:"var(--warn)",bad:"var(--bad)",gray:"var(--ink-300)"}[tone];
  return <span style={{width:7,height:7,borderRadius:99,background:c,display:"inline-block",flexShrink:0}}/>;}

// ── Inputs ───────────────────────────────────────────────────
function Field({value,onChange,type="text",style,placeholder,w}){
  const [f,setF]=useState(false);
  return <input type={type} value={value} placeholder={placeholder}
    onFocus={()=>setF(true)} onBlur={()=>setF(false)}
    onChange={e=>onChange&&onChange(e.target.value)}
    className={type==="number"?"num":""}
    style={{width:w||"100%",padding:"8px 11px",fontFamily:"var(--font)",fontSize:13.5,color:"var(--ink-800)",
      background:"var(--surface)",border:`1px solid ${f?"var(--brand-400)":"var(--border-strong)"}`,
      borderRadius:"var(--r-sm)",outline:"none",
      boxShadow:f?"0 0 0 3.5px var(--brand-100)":"none",transition:"all .15s",...style}}/>;
}
function Select({value,onChange,options,style,w}){
  const [f,setF]=useState(false);
  return <div style={{position:"relative",width:w||"auto",display:"inline-block"}}>
    <select value={value} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
      onChange={e=>onChange(e.target.value)}
      style={{width:"100%",padding:"8px 30px 8px 12px",fontFamily:"var(--font)",fontSize:13.5,fontWeight:500,
        color:"var(--ink-800)",background:"var(--surface)",
        border:`1px solid ${f?"var(--brand-400)":"var(--border-strong)"}`,borderRadius:"var(--r-sm)",
        outline:"none",appearance:"none",cursor:"pointer",
        boxShadow:f?"0 0 0 3.5px var(--brand-100)":"none",transition:"all .15s",...style}}>
      {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
    <Icon name="chevronDown" size={15} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",
      color:"var(--ink-400)",pointerEvents:"none"}}/>
  </div>;
}

// ── Month / year picker ──────────────────────────────────────
function MonthPicker({month,year,onMonth,onYear,years=[2568,2569,2570]}){
  return <div style={{display:"inline-flex",alignItems:"center",background:"var(--surface)",
    border:"1px solid var(--border-strong)",borderRadius:"var(--r-sm)",overflow:"hidden",boxShadow:"var(--sh-xs)"}}>
    <div style={{display:"flex",alignItems:"center",gap:6,padding:"0 4px 0 11px",color:"var(--ink-400)"}}>
      <Icon name="calendar" size={15}/></div>
    <select value={month} onChange={e=>onMonth(+e.target.value)}
      style={{border:"none",background:"transparent",fontFamily:"var(--font)",fontSize:13.5,fontWeight:600,
        color:"var(--ink-800)",padding:"8px 4px",outline:"none",cursor:"pointer",appearance:"none"}}>
      {MN.map((m,i)=><option key={i} value={i}>{m}</option>)}
    </select>
    <div style={{width:1,height:18,background:"var(--border)"}}/>
    <select value={year} onChange={e=>onYear(+e.target.value)}
      style={{border:"none",background:"transparent",fontFamily:"var(--font)",fontSize:13.5,fontWeight:600,
        color:"var(--ink-600)",padding:"8px 12px 8px 8px",outline:"none",cursor:"pointer",appearance:"none"}}>
      {years.map(y=><option key={y} value={y}>{y}</option>)}
    </select>
  </div>;
}

Object.assign(window,{useState,useEffect,useRef,useMemo,Icon,Logo,Btn,Card,Tag,Dot,Field,Select,MonthPicker});
