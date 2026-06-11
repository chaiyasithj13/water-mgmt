// ════════ Shared helpers ════════
function StatCard({label,value,unit,icon,tone="brand",trend,trendUp,sub,loading}){
  const tc={brand:"var(--brand-500)",teal:"var(--teal-500)",amber:"var(--warn)",gray:"var(--ink-500)"}[tone];
  const tbg={brand:"var(--brand-50)",teal:"var(--teal-50)",amber:"var(--warn-bg)",gray:"var(--surface-2)"}[tone];
  return <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",
    padding:"15px 16px",boxShadow:"var(--sh-sm)",display:"flex",flexDirection:"column",gap:11,minWidth:0}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{width:34,height:34,borderRadius:9,background:tbg,color:tc,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Icon name={icon} size={18} stroke={2}/></div>
      {trend&&!loading&&<span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:11.5,fontWeight:600,
        color:trendUp?"var(--ok)":"var(--bad)"}}>
        <Icon name="trend" size={13} style={{transform:trendUp?"none":"scaleY(-1)"}}/>{trend}</span>}
    </div>
    <div>
      {loading
        ? <div className="skel" style={{height:24,width:"60%"}}/>
        : <div className="num" style={{fontFamily:"var(--font-display)",fontSize:23,fontWeight:700,color:"var(--ink-900)",lineHeight:1,letterSpacing:"-.01em"}}>
            {value}<span style={{fontSize:12.5,fontWeight:500,color:"var(--ink-400)",marginLeft:4}}>{unit}</span></div>}
      <div style={{fontSize:12.5,color:"var(--ink-500)",marginTop:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{label}</div>
      {sub&&!loading&&<div style={{fontSize:11,color:"var(--ink-400)",marginTop:2}}>{sub}</div>}
    </div>
  </div>;
}

function ChartCard({title,right,children,height=260,loading}){
  return <Card pad={0} style={{overflow:"hidden"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,padding:"15px 18px 12px",flexWrap:"wrap"}}>
      <div style={{fontFamily:"var(--font-display)",fontSize:14.5,fontWeight:700,color:"var(--ink-800)"}}>{title}</div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>{right}</div>
    </div>
    <div style={{padding:"0 14px 16px"}}>
      {loading
        ? <div className="skel" style={{height,borderRadius:8}}/>
        : <div style={{height}}>{children}</div>}
    </div>
  </Card>;
}
function TableCard({title,right,children}){
  return <Card pad={0} style={{overflow:"hidden"}}>
    {(title||right)&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,padding:"14px 18px",borderBottom:"1px solid var(--border)",flexWrap:"wrap"}}>
      <div style={{fontFamily:"var(--font-display)",fontSize:14.5,fontWeight:700,color:"var(--ink-800)"}}>{title}</div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>{right}</div>
    </div>}
    <div style={{overflow:"auto",maxHeight:560}}>{children}</div>
  </Card>;
}
function Legend({items}){
  return <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>{items.map((it,i)=>
    <span key={i} style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:"var(--ink-500)",fontWeight:500}}>
      <span style={{width:10,height:10,borderRadius:3,background:it.c}}/>{it.l}</span>)}</div>;
}
function EmptyState({icon="file",msg="ยังไม่มีข้อมูลในเดือนนี้",sub}){
  return <div style={{padding:"50px 20px",textAlign:"center",color:"var(--ink-400)"}}>
    <div style={{width:54,height:54,borderRadius:14,background:"var(--surface-2)",color:"var(--ink-300)",
      display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:12}}><Icon name={icon} size={24}/></div>
    <div style={{fontSize:14,fontWeight:600,color:"var(--ink-600)"}}>{msg}</div>
    {sub&&<div style={{fontSize:12.5,marginTop:5,color:"var(--ink-400)"}}>{sub}</div>}
  </div>;
}
function EditCell({rows,d,field,admin,mutate,w=58,type="number"}){
  const val=rows[d]?.[field]??"";
  if(!admin) return <span>{val===""?"–":val}</span>;
  return <input className="ti" type={type} defaultValue={val} style={{width:w}} step="any"
    onChange={e=>mutate(r=>{
      if(!r[d]) r[d]={};
      const v=e.target.value;
      r[d][field] = type==="number" ? (v===""?"":+v) : v;
    })}/>;
}
const fmt=(n,d=0)=>Number(n||0).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});

// computation from already-cached docs
function sumWWFrom(rows,m){const days=getDays(m);let w=0,waste=0,flow=0,out=0,e=0,cost=0,cl=0,clc=0,cnt=0;
  for(let d=1;d<=days;d++){const r=rows[d];if(r&&(r.water||r.ww_flow||r.elec_kwh)){w+=+r.water||0;waste+=(+r.water||0)*0.8;flow+=+r.ww_flow||0;out+=+r.waste_out||0;e+=+r.elec_kwh||0;cost+=+r.elec_total||0;cl+=+r.chlorine_l||0;clc+=+r.chlorine_cost||0;cnt++;}}
  return {w,waste,flow,out,e,cost,cl,clc,cnt};}
function sumWaterFrom(rows,m){const days=getDays(m);let h=0,k=0,dm=0,cnt=0;
  for(let d=1;d<=days;d++){const r=rows[d];if(r){
    const hv=r.hospital_after!=null&&r.hospital_before!=null?(+r.hospital_after||0)-(+r.hospital_before||0):(+r.hospital||0);
    const kv=r.khuan_after!=null&&r.khuan_before!=null?(+r.khuan_after||0)-(+r.khuan_before||0):(+r.khuan||0);
    const dv=r.dorm_after!=null&&r.dorm_before!=null?(+r.dorm_after||0)-(+r.dorm_before||0):(+r.dorm||0);
    if(hv||kv||dv){h+=hv;k+=kv;dm+=dv;cnt++;}}}
  return {h,k,dm,total:h+k+dm,cnt};}
function clComplianceFrom(rows,m){const days=getDays(m);let ok=0,tot=0;
  for(let d=1;d<=days;d++){const cl=+rows[d]?.free_chlorine;if(!isNaN(cl)&&cl>0){tot++;if(cl>=0.2)ok++;}}return{ok,tot};}

// ════════ DASHBOARD ════════
function Dashboard({ctx}){
  const {month:m,year:y,setMonth,setYear}=ctx;
  const [sys,setSys]=useState("ww-research");
  const isWW=sys!=="water";
  const bldg=sys==="ww-sth"?"sth":"research";

  // load 12 months
  const idsWW=MN.map((_,mi)=>`ww_${bldg}_${y}_${mi}`);
  const idsWater=[...MN.map((_,mi)=>`water_usage_${y}_${mi}`),...MN.map((_,mi)=>`water_usage_sth_${y}_${mi}`)];
  const ids=isWW?idsWW:idsWater;
  const {map,loading}=useFsDocs(ids);

  const monthsWW=isWW?MN.map((_,mi)=>sumWWFrom(map[`ww_${bldg}_${y}_${mi}`]||{},mi)):[];
  const monthsWater=!isWW?MN.map((_,mi)=>sumWaterFrom(map[`water_usage_${y}_${mi}`]||{},mi)):[];
  const cur=isWW?monthsWW[m]:monthsWater[m];
  const prev=isWW?monthsWW[(m+11)%12]:monthsWater[(m+11)%12];
  const pct=(a,b)=>b?(((a-b)/b)*100).toFixed(1):0;

  // สธ. monthly net water
  const sthMonthly=!isWW?MN.map((_,mi)=>{
    const rows=map[`water_usage_sth_${y}_${mi}`]||{};
    const days=getDays(mi);
    let t=0,c=0;
    for(let d=1;d<=days;d++){const a=rows[d]?.sth_after,b=rows[d]?.sth_before;if(a!=null&&b!=null){const v=(+a||0)-(+b||0);t+=v;c++;}}
    return{total:t,cnt:c};
  }):[];
  const sthCur=!isWW?sthMonthly[m]:{total:0,cnt:0};

  let cards;
  if(isWW){
    cards=[
      {label:"น้ำประปาที่ใช้",value:fmt(cur.w),unit:"ลบ.ม.",icon:"droplet",tone:"brand",trend:prev.w?Math.abs(pct(cur.w,prev.w))+"%":null,trendUp:cur.w>=prev.w},
      {label:"น้ำเสียเข้าระบบ",value:fmt(cur.waste,1),unit:"ลบ.ม.",icon:"drop2",tone:"teal"},
      {label:"น้ำเสีย (Flowmeter)",value:fmt(cur.flow,1),unit:"ลบ.ม.",icon:"drop2",tone:"teal"},
      {label:"ค่าไฟฟ้า",value:fmt(cur.cost,0),unit:"บาท",icon:"bolt",tone:"amber",trend:prev.cost?Math.abs(pct(cur.cost,prev.cost))+"%":null,trendUp:cur.cost<prev.cost},
      {label:"คลอรีนที่ใช้",value:fmt(cur.cl,1),unit:"ลิตร",icon:"beaker",tone:"teal"},
    ];
  } else {
    cards=[
      {label:"โรงพยาบาล",value:fmt(cur.h),unit:"ลบ.ม.",icon:"droplet",tone:"brand"},
      {label:"ควนมดแดง",value:fmt(cur.k),unit:"ลบ.ม.",icon:"droplet",tone:"brand"},
      {label:"หอพัก",value:fmt(cur.dm),unit:"ลบ.ม.",icon:"droplet",tone:"brand"},
      {label:"อาคาร สธ.",value:fmt(sthCur.total),unit:"ลบ.ม.",icon:"droplet",tone:"teal"},
      {label:"รวมทั้งหมด",value:fmt(cur.total+sthCur.total),unit:"ลบ.ม.",icon:"drop2",tone:"teal"},
      {label:"เฉลี่ยต่อวัน (รพ.)",value:fmt(cur.cnt?cur.total/cur.cnt:0),unit:"ลบ.ม.",icon:"chart",tone:"gray"},
    ];
  }

  // WW trend chart — toggle
  const wwSeries=[
    {key:"water",label:"น้ำประปา",color:brandColor("--brand-500"),bg:"rgba(31,116,186,.22)",bg2:"rgba(31,116,186,0)",data:monthsWW.map(x=>+x.w.toFixed(0))},
    {key:"waste",label:"น้ำเสีย",color:brandColor("--teal-500"),bg:"rgba(15,138,114,.18)",bg2:"rgba(15,138,114,0)",data:monthsWW.map(x=>+x.waste.toFixed(0))},
    {key:"flow",label:"น้ำเสีย (Flowmeter)",color:"#e05c00",bg:"rgba(224,92,0,.15)",bg2:"rgba(224,92,0,0)",data:monthsWW.map(x=>+x.flow.toFixed(1))},
  ];
  const waterSeries=[
    {key:"hosp",label:"โรงพยาบาล",color:brandColor("--brand-500")},
    {key:"kuan",label:"ควนมดแดง",color:brandColor("--brand-300")},
    {key:"dorm",label:"หอพัก",color:brandColor("--teal-500")},
    {key:"sth",label:"อาคาร สธ.",color:"#7c3aed"},
  ];
  const [wwVis,setWwVis]=useState({water:true,waste:true,flow:true});
  const [waterVis,setWaterVis]=useState({hosp:true,kuan:true,dorm:true,sth:true});
  const tWwVis=(k)=>setWwVis(v=>({...v,[k]:!v[k]}));
  const tWaterVis=(k)=>setWaterVis(v=>({...v,[k]:!v[k]}));

  const trendData=isWW
    ?{labels:MS,datasets:wwSeries.filter(s=>wwVis[s.key]).map(s=>({...areaDataset(s.label,s.data,s.color,s.bg,s.bg2)}))}
    :{labels:MS,datasets:[
        waterVis.hosp&&{...barDataset("โรงพยาบาล",monthsWater.map(x=>x.h),brandColor("--brand-500"))},
        waterVis.kuan&&{...barDataset("ควนมดแดง",monthsWater.map(x=>x.k),brandColor("--brand-300"))},
        waterVis.dorm&&{...barDataset("หอพัก",monthsWater.map(x=>x.dm),brandColor("--teal-500"))},
        waterVis.sth&&{...barDataset("อาคาร สธ.",sthMonthly.map(x=>x.total),brandColor("--purple-500")||"#7c3aed")},
      ].filter(Boolean)};
  const trendOpts=baseOpts(!isWW?{scales:{x:{stacked:true,grid:{display:false},border:{display:false},ticks:{color:"#94a0b3",font:{family:"Sarabun",size:11}}},y:{stacked:true,grid:{color:"#eef2f7",drawBorder:false},border:{display:false},ticks:{color:"#94a0b3",font:{family:"Sarabun",size:11}},beginAtZero:true}}}:{});

  // mixed chart: bar=การใช้ไฟฟ้า, line=ค่าไฟฟ้า
  const elecData={labels:MS,datasets:[
    {type:"bar",label:"การใช้ไฟฟ้า (kWh)",data:monthsWW.map(x=>+x.e.toFixed(0)),backgroundColor:brandColor("--warn")+"99",borderColor:brandColor("--warn"),borderWidth:1,yAxisID:"y"},
    {type:"line",label:"ค่าไฟฟ้า (บาท)",data:monthsWW.map(x=>+x.cost.toFixed(0)),borderColor:"#e53e3e",borderWidth:2,pointRadius:3,fill:false,tension:0.3,yAxisID:"y2"},
  ]};
  const elecOpts=baseOpts({scales:{
    x:{grid:{display:false},border:{display:false},ticks:{color:"#94a0b3",font:{family:"Sarabun",size:11},autoSkipPadding:0,maxRotation:0}},
    y:{beginAtZero:true,position:"left",title:{display:true,text:"kWh"},grid:{color:"#eef2f7",drawBorder:false},border:{display:false},ticks:{color:"#94a0b3",font:{family:"Sarabun",size:10}}},
    y2:{beginAtZero:true,position:"right",title:{display:true,text:"บาท"},grid:{drawOnChartArea:false},border:{display:false},ticks:{color:"#e53e3e",font:{family:"Sarabun",size:10}}},
  }});

  const toggleBtns=(series,vis,toggle)=>(
    <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
      {series.map(s=>(
        <button key={s.key} onClick={()=>toggle(s.key)}
          style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:99,fontSize:12,fontWeight:600,cursor:"pointer",
            background:vis[s.key]?(s.bg||s.color+"22"):"var(--surface-2)",
            border:`1.5px solid ${vis[s.key]?s.color:"var(--border)"}`,
            color:vis[s.key]?s.color:"var(--ink-400)",transition:"all .15s"}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:vis[s.key]?s.color:"var(--border)",display:"inline-block"}}/>
          {s.label}
        </button>))}
    </div>);

  return <div>
    <PageHead title="ภาพรวมระบบ" subtitle="สรุปสถานะการจัดการน้ำของโรงพยาบาลแบบเรียลไทม์">
      <MonthPicker month={m} year={y} onMonth={setMonth} onYear={setYear}/>
    </PageHead>

    <div style={{display:"flex",gap:6,padding:5,background:"var(--surface)",border:"1px solid var(--border)",
      borderRadius:99,boxShadow:"var(--sh-xs)",marginBottom:20,width:"fit-content",flexWrap:"wrap"}}>
      {[["ww-research","บำบัดน้ำเสีย — วิจัยฯ"],["ww-sth","บำบัดน้ำเสีย — สธ."],["water","ระบบประปา"]].map(([v,l])=>
        <button key={v} onClick={()=>setSys(v)} style={{padding:"7px 17px",borderRadius:99,border:"none",cursor:"pointer",
          fontFamily:"var(--font)",fontSize:13,fontWeight:600,transition:"all .15s",
          background:sys===v?"var(--brand-500)":"transparent",color:sys===v?"#fff":"var(--ink-600)",
          boxShadow:sys===v?"0 1px 3px rgba(21,94,156,.4)":"none"}}>{l}</button>)}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14,marginBottom:18}}>
      {cards.map((c,i)=><StatCard key={i} {...c} loading={loading}/>)}
    </div>

    <div style={{display:"grid",gridTemplateColumns:isWW?"1.55fr 1fr":"1fr",gap:16,marginBottom:18}}>
      <ChartCard title={`แนวโน้มรายเดือน — ปีงบประมาณ ${y}`} loading={loading}
        right={isWW?toggleBtns(wwSeries,wwVis,tWwVis):toggleBtns(waterSeries,waterVis,tWaterVis)}>
        <ChartBox type={isWW?"line":"bar"} data={trendData} options={trendOpts} height={260}/>
      </ChartCard>
      {isWW&&<ChartCard title="การใช้ไฟฟ้าและค่าไฟฟ้ารายเดือน" loading={loading}>
        <ChartBox type="bar" data={elecData} options={elecOpts} height={260}/>
      </ChartCard>}
    </div>

    <TableCard title={`สรุปรายเดือน — ${isWW?(bldg==="sth"?"อาคาร สธ.":"อาคารวิจัยฯ"):"ระบบประปา"}`}>
      {loading
        ? <div style={{padding:30}}><div className="skel" style={{height:340}}/></div>
        : <table className="dt">
          <thead>{isWW
            ?<tr><th style={{textAlign:"left"}}>เดือน</th><th>น้ำประปา<small>ลบ.ม.</small></th><th>น้ำเสีย<small>ลบ.ม.</small></th><th>น้ำเสีย (Flowmeter)<small>ลบ.ม.</small></th><th>น้ำทิ้ง<small>ลบ.ม.</small></th><th>การใช้ไฟฟ้า<small>kWh</small></th><th>ค่าไฟฟ้า<small>บาท</small></th><th>คลอรีน<small>ลิตร</small></th><th>ค่าคลอรีน<small>บาท</small></th></tr>
            :<tr><th style={{textAlign:"left"}}>เดือน</th><th>โรงพยาบาล<small>ลบ.ม.</small></th><th>ควนมดแดง<small>ลบ.ม.</small></th><th>หอพัก<small>ลบ.ม.</small></th><th>รวม<small>ลบ.ม.</small></th><th>เฉลี่ย/วัน (รพ.)<small>ลบ.ม.</small></th><th>อาคาร สธ.<small>ลบ.ม.</small></th></tr>}
          </thead>
          <tbody>{MN.map((mn,mi)=>{
            if(isWW){const x=monthsWW[mi],e=x.cnt===0;
              return <tr key={mi} style={{opacity:e?.4:1}}>
                <td className="day" style={{textAlign:"left",width:"auto",paddingLeft:16}}>{mn}</td>
                <td>{e?"–":fmt(x.w)}</td><td>{e?"–":fmt(x.waste,1)}</td><td>{e?"–":fmt(x.flow,1)}</td><td>{e?"–":fmt(x.out,1)}</td>
                <td>{e?"–":fmt(x.e)}</td><td>{e?"–":fmt(x.cost,0)}</td><td>{e?"–":fmt(x.cl,1)}</td><td>{e?"–":fmt(x.clc,0)}</td></tr>;
            } else {const x=monthsWater[mi],s=sthMonthly[mi],e=x.cnt===0;
              return <tr key={mi} style={{opacity:e&&s.cnt===0?.4:1}}>
                <td className="day" style={{textAlign:"left",width:"auto",paddingLeft:16}}>{mn}</td>
                <td>{e?"–":fmt(x.h)}</td><td>{e?"–":fmt(x.k)}</td><td>{e?"–":fmt(x.dm)}</td>
                <td className="calc">{e?"–":fmt(x.total)}</td>
                <td>{e?"–":fmt(x.cnt?x.total/x.cnt:0,1)}</td>
                <td>{s.cnt>0?fmt(s.total):"–"}</td></tr>;
            }})}</tbody>
        </table>}
    </TableCard>
  </div>;
}

// ════════ WW DAILY ════════
function WWDaily({ctx,bldg}){
  const {month:m,year:y,setMonth,setYear,role}=ctx;
  const admin=role==="admin";
  const title=bldg==="research"?"อาคารวิจัยฯ":"อาคารรัตนชีวรักษ์ (สธ.)";
  const docId=`ww_${bldg}_${y}_${m}`;
  const {data:rows,loading,mutate}=useFsDoc(docId);
  const days=getDays(m);
  const t=sumWWFrom(rows,m);

  const [mode,setMode]=useState("daily");
  const [vis,setVis]=useState({water:true,waste:true,flow:true});
  const toggleVis=(k)=>setVis(v=>({...v,[k]:!v[k]}));

  const allDaily=[
    {key:"water", label:"น้ำประปา",           color:brandColor("--brand-500"), bg:"rgba(31,116,186,.2)",  bg2:"rgba(31,116,186,0)",  data:Array.from({length:days},(_,i)=>+rows[i+1]?.water||0)},
    {key:"waste", label:"น้ำเสีย",             color:brandColor("--teal-500"),  bg:"rgba(15,138,114,.18)", bg2:"rgba(15,138,114,0)",  data:Array.from({length:days},(_,i)=>+(rows[i+1]?.water||0)*0.8)},
    {key:"flow",  label:"น้ำเสีย (Flowmeter)", color:"#e05c00",                 bg:"rgba(224,92,0,.15)",   bg2:"rgba(224,92,0,0)",    data:Array.from({length:days},(_,i)=>+rows[i+1]?.ww_flow||0)},
  ];
  const chartData=mode==="daily"
    ?{labels:Array.from({length:days},(_,i)=>i+1),datasets:allDaily.filter(s=>vis[s.key]).map(s=>({...areaDataset(s.label,s.data,s.color,s.bg,s.bg2)}))}
    :{labels:MS,datasets:[{...barDataset("น้ำประปา",[+t.w.toFixed(0)],brandColor("--brand-500"))}]};

  return <div>
    <PageHead title={`รายงานประจำวัน · ${title}`} subtitle={`${MN[m]} ${y} · ปริมาณน้ำ ไฟฟ้า และคลอรีนรายวัน`}>
      <MonthPicker month={m} year={y} onMonth={setMonth} onYear={setYear}/>
    </PageHead>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:13,marginBottom:18}}>
      <StatCard loading={loading} label="น้ำประปารวม" value={fmt(t.w)} unit="ลบ.ม." icon="droplet" tone="brand"/>
      <StatCard loading={loading} label="น้ำเสียเข้าระบบ" value={fmt(t.waste,1)} unit="ลบ.ม." icon="drop2" tone="teal"/>
      <StatCard loading={loading} label="น้ำเสีย (Flowmeter)" value={fmt(t.flow,1)} unit="ลบ.ม." icon="drop2" tone="teal"/>
      <StatCard loading={loading} label="น้ำทิ้ง" value={fmt(t.out,1)} unit="ลบ.ม." icon="drop2" tone="gray"/>
      <StatCard loading={loading} label="ไฟฟ้ารวม" value={fmt(t.e)} unit="kWh" icon="bolt" tone="amber"/>
      <StatCard loading={loading} label="ค่าไฟฟ้ารวม" value={fmt(t.cost,0)} unit="บาท" icon="bolt" tone="amber"/>
      <StatCard loading={loading} label="คลอรีนรวม" value={fmt(t.cl,1)} unit="ลิตร" icon="beaker" tone="teal"/>
    </div>

    <div style={{marginBottom:18}}>
      <ChartCard title="กราฟปริมาณน้ำรายวัน" loading={loading}
        right={<div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
          {allDaily.map(s=>(
            <button key={s.key} onClick={()=>toggleVis(s.key)}
              style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:99,fontSize:12,fontWeight:600,cursor:"pointer",
                background:vis[s.key]?s.bg:"var(--surface-2)",
                border:`1.5px solid ${vis[s.key]?s.color:"var(--border)"}`,
                color:vis[s.key]?s.color:"var(--ink-400)",transition:"all .15s"}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:vis[s.key]?s.color:"var(--border)",display:"inline-block"}}/>
              {s.label}
            </button>
          ))}
        </div>}>
        <ChartBox type="line" data={chartData} options={baseOpts()} height={250}/>
      </ChartCard>
    </div>

    <TableCard title="ตารางบันทึกข้อมูลรายวัน" right={admin?<Tag tone="ok"><Dot tone="ok"/>แก้ไขได้</Tag>:<Tag tone="gray">ดูอย่างเดียว</Tag>}>
      {loading
        ? <div style={{padding:30}}><div className="skel" style={{height:300}}/></div>
        : <table className="dt" key={docId}>
          <thead>
            <tr>
              <th>วันที่</th>
              <th>น้ำประปา<small>ลบ.ม.</small></th><th>น้ำเสีย<small>ลบ.ม.</small></th><th>น้ำเสีย (Flowmeter)<small>ลบ.ม.</small></th><th>น้ำทิ้ง<small>ลบ.ม.</small></th>
              <th>การใช้ไฟฟ้า<small>kWh</small></th><th>ค่าไฟต่อหน่วย<small>บาท/kWh</small></th><th>ค่าไฟรวม<small>บาท</small></th>
              <th>คลอรีน<small>ลิตร</small></th><th>ค่าคลอรีน<small>บาท</small></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({length:days},(_,i)=>i+1).map(d=>{
              const r=rows[d]||{};
              return <tr key={d}>
                <td className="day">{d}</td>
                <td><EditCell rows={rows} d={d} field="water" admin={admin} mutate={mutate}/></td>
                <td className="calc">{r.water?fmt(+r.water*0.8,1):"–"}</td>
                <td><EditCell rows={rows} d={d} field="ww_flow" admin={admin} mutate={mutate}/></td>
                <td><EditCell rows={rows} d={d} field="waste_out" admin={admin} mutate={mutate}/></td>
                <td><EditCell rows={rows} d={d} field="elec_kwh" admin={admin} mutate={mutate}/></td>
                <td><EditCell rows={rows} d={d} field="elec_rate" admin={admin} mutate={mutate}/></td>
                <td className="calc"><EditCell rows={rows} d={d} field="elec_total" admin={admin} mutate={mutate} w={64}/></td>
                <td><EditCell rows={rows} d={d} field="chlorine_l" admin={admin} mutate={mutate}/></td>
                <td><EditCell rows={rows} d={d} field="chlorine_cost" admin={admin} mutate={mutate} w={64}/></td>
              </tr>;
            })}
            <tr className="total">
              <td>รวม</td><td>{fmt(t.w)}</td><td className="calc">{fmt(t.waste,1)}</td><td>{fmt(t.flow,1)}</td><td>{fmt(t.out,1)}</td>
              <td>{fmt(t.e)}</td><td>–</td><td className="calc">{fmt(t.cost,0)}</td><td>{fmt(t.cl,1)}</td><td>{fmt(t.clc,0)}</td>
            </tr>
          </tbody>
        </table>}
    </TableCard>
  </div>;
}

// ════════ WW PARAM ════════
function WWParam({ctx,bldg}){
  const {month:m,year:y,setMonth,setYear,role}=ctx;
  const admin=role==="admin";
  const title=bldg==="research"?"อาคารวิจัยฯ":"อาคารรัตนชีวรักษ์ (สธ.)";
  const PARAMS=bldg==="research"?PARAMS_RESEARCH:PARAMS_STH;
  const [pid,setPid]=useState(PARAMS[0].id);
  const param=PARAMS.find(p=>p.id===pid)||PARAMS[0];
  const docId=`ww_param_${bldg}_${param.id}_${y}_${m}`;
  const {data:rows,loading,mutate}=useFsDoc(docId);
  const days=getDays(m);
  const allTanks=param.tanks.flatMap(g=>g.ids);

  const dailyAvg=Array.from({length:days},(_,i)=>{const d=i+1;let s=0,c=0;
    allTanks.forEach(id=>{["m","a"].forEach(sh=>{const v=+rows[d]?.[id]?.[sh];if(!isNaN(v)&&rows[d]?.[id]?.[sh]!==""&&rows[d]?.[id]?.[sh]!=null){s+=v;c++;}});});
    return c?+(s/c).toFixed(2):null;});

  // เส้นประสีแดงแสดงเกณฑ์
  const stdDatasets=[];
  if(param.stdMax!=null){
    const maxLine=Array(days).fill(param.stdMax);
    stdDatasets.push({label:`เกณฑ์สูงสุด (${param.stdMax})`,data:maxLine,borderColor:"#e53e3e",borderWidth:1.5,borderDash:[6,4],pointRadius:0,fill:false,tension:0,spanGaps:true});
  }
  if(param.stdMin!=null){
    const minLine=Array(days).fill(param.stdMin);
    stdDatasets.push({label:`เกณฑ์ต่ำสุด (${param.stdMin})`,data:minLine,borderColor:"#e53e3e",borderWidth:1.5,borderDash:[6,4],pointRadius:0,fill:false,tension:0,spanGaps:true});
  }

  const chartData={labels:Array.from({length:days},(_,i)=>i+1),datasets:[
    {...areaDataset(param.label,dailyAvg,brandColor("--brand-500"),"rgba(31,116,186,.2)","rgba(31,116,186,0)"),spanGaps:true},
    ...stdDatasets]};

  return <div>
    <PageHead title={`พารามิเตอร์น้ำเสีย · ${title}`} subtitle={`${MN[m]} ${y} · ค่าตรวจวัดเช้า/บ่ายแยกตามถัง`}>
      <MonthPicker month={m} year={y} onMonth={setMonth} onYear={setYear}/>
    </PageHead>

    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:18}}>
      {PARAMS.map(p=><button key={p.id} className={"tabchip"+(pid===p.id?" on":"")} onClick={()=>setPid(p.id)}>
        {p.label}{p.unit?` (${p.unit})`:""}</button>)}
    </div>

    <div style={{marginBottom:18}}>
      <ChartCard title={`ค่าเฉลี่ยรายวัน — ${param.label}`} loading={loading}
        right={param.std!=="—"&&<Tag tone="warn">เกณฑ์ {param.std}</Tag>}>
        <ChartBox type="line" data={chartData} options={baseOpts()} height={230}/>
      </ChartCard>
    </div>

    <TableCard title="ตารางค่าพารามิเตอร์" right={admin?<Tag tone="ok"><Dot tone="ok"/>แก้ไขได้</Tag>:<Tag tone="gray">ดูอย่างเดียว</Tag>}>
      {loading
        ? <div style={{padding:30}}><div className="skel" style={{height:300}}/></div>
        : <table className="dt" key={docId}>
          <thead>
            <tr><th rowSpan="3" style={{minWidth:46}}>วันที่</th>
              {param.tanks.map(g=><th key={g.g} colSpan={g.ids.length*2}>{g.g}</th>)}</tr>
            <tr>{param.tanks.flatMap(g=>g.ids).map(id=><th key={id} colSpan="2">{id}</th>)}</tr>
            <tr>{allTanks.flatMap(id=>[<th key={id+"m"}>เช้า</th>,<th key={id+"a"}>บ่าย</th>])}</tr>
          </thead>
          <tbody>
            {Array.from({length:days},(_,i)=>i+1).map(d=>
              <tr key={d}><td className="day">{d}</td>
                {allTanks.flatMap(id=>
                  ["m","a"].map(sh=>{
                    const val=rows[d]?.[id]?.[sh]??"";
                    return <td key={id+sh}>{admin
                      ?<input className="ti" type="number" defaultValue={val} step="any" style={{width:52}}
                        onChange={e=>mutate(r=>{if(!r[d])r[d]={};if(!r[d][id])r[d][id]={};r[d][id][sh]=e.target.value===""?"":+e.target.value;})}/>
                      :<span style={{fontSize:12}}>{val===""?"–":val}</span>}</td>;
                  }))}
              </tr>)}
          </tbody>
        </table>}
    </TableCard>
  </div>;
}

// ════════ WATER USAGE ════════
function WaterUsage({ctx}){
  const {month:m,year:y,setMonth,setYear,role}=ctx;
  const admin=role==="admin";
  const docId=`water_usage_${y}_${m}`;
  const wwDocId=`ww_research_${y}_${m}`;
  const {data:rows,loading,mutate}=useFsDoc(docId);
  const days=getDays(m);
  const t=sumWaterFrom(rows,m);

  // คำนวณ รวม จาก after - before
  const calcNet=(r,prefix)=>{
    const a=r?.[prefix+"_after"],b=r?.[prefix+"_before"];
    if(a!=null&&a!==""&&b!=null&&b!==""){const v=(+a||0)-(+b||0);return v;}
    return null;
  };

  const mutateLinked=(fn)=>{
    mutate(r=>{fn(r);});
    Object.keys(rows).forEach(d=>{
      const dn=+d;if(isNaN(dn))return;
      const r=rows[d]||{};
      const hv=calcNet(r,"hospital")??0;
      const kv=calcNet(r,"khuan")??0;
      const dv=calcNet(r,"dorm")??0;
      const total=hv+kv+dv;
      const wwData=window.__cache[wwDocId];
      if(wwData){if(!wwData[dn])wwData[dn]={};wwData[dn].water=total>0?total:"";debouncedSave(wwDocId,wwData);}
    });
  };

  // chart ใช้ค่า net (after-before)
  const chartData={labels:Array.from({length:days},(_,i)=>i+1),datasets:[
    {...barDataset("โรงพยาบาล",Array.from({length:days},(_,i)=>{const r=rows[i+1]||{};const v=calcNet(r,"hospital");return v!=null?v:0;}),brandColor("--brand-500"))},
    {...barDataset("ควนมดแดง",Array.from({length:days},(_,i)=>{const r=rows[i+1]||{};const v=calcNet(r,"khuan");return v!=null?v:0;}),brandColor("--brand-300"))},
    {...barDataset("หอพัก",Array.from({length:days},(_,i)=>{const r=rows[i+1]||{};const v=calcNet(r,"dorm");return v!=null?v:0;}),brandColor("--teal-500"))}]};
  const stackOpts=baseOpts({scales:{x:{stacked:true,grid:{display:false},border:{display:false},ticks:{color:"#94a0b3",font:{family:"Sarabun",size:10},autoSkipPadding:10}},y:{stacked:true,grid:{color:"#eef2f7",drawBorder:false},border:{display:false},ticks:{color:"#94a0b3",font:{family:"Sarabun",size:11}},beginAtZero:true}}});

  const METERS=[
    {key:"hospital",label:"โรงพยาบาล"},
    {key:"khuan",   label:"ควนมดแดง"},
    {key:"dorm",    label:"หอพัก"},
  ];

  return <div>
    <PageHead title="การใช้น้ำประปา — โรงพยาบาล" subtitle={`${MN[m]} ${y} · มิเตอร์ 3 จุด — โรงพยาบาล / ควนมดแดง / หอพัก`}>
      <MonthPicker month={m} year={y} onMonth={setMonth} onYear={setYear}/>
    </PageHead>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:13,marginBottom:18}}>
      <StatCard loading={loading} label="โรงพยาบาล" value={fmt(t.h)} unit="ลบ.ม." icon="droplet" tone="brand"/>
      <StatCard loading={loading} label="ควนมดแดง" value={fmt(t.k)} unit="ลบ.ม." icon="droplet" tone="brand"/>
      <StatCard loading={loading} label="หอพัก" value={fmt(t.dm)} unit="ลบ.ม." icon="droplet" tone="teal"/>
      <StatCard loading={loading} label="รวมทั้งหมด" value={fmt(t.total)} unit="ลบ.ม." icon="drop2" tone="teal"/>
      <StatCard loading={loading} label="เฉลี่ย/วัน" value={fmt(t.cnt?t.total/t.cnt:0,1)} unit="ลบ.ม." icon="chart" tone="gray"/>
    </div>
    <div style={{marginBottom:18}}>
      <ChartCard title="การใช้น้ำรายวัน (แยกจุด)" loading={loading}
        right={<Legend items={[{c:"var(--brand-500)",l:"ร.พ."},{c:"var(--brand-300)",l:"ควนมดแดง"},{c:"var(--teal-500)",l:"หอพัก"}]}/>}>
        <ChartBox type="bar" data={chartData} options={stackOpts} height={250}/>
      </ChartCard>
    </div>
    <TableCard title="ตารางบันทึกการใช้น้ำ" right={admin?<Tag tone="ok"><Dot tone="ok"/>แก้ไขได้</Tag>:<Tag tone="gray">ดูอย่างเดียว</Tag>}>
      {loading
        ? <div style={{padding:30}}><div className="skel" style={{height:300}}/></div>
        : <table className="dt" key={docId}>
          <thead>
            <tr>
              <th rowSpan="2">วันที่</th>
              {METERS.map(({label})=><th key={label} colSpan="3">{label}<small>ลบ.ม.</small></th>)}
              <th rowSpan="2">รวมทั้งหมด<small>ลบ.ม.</small></th>
            </tr>
            <tr>
              {METERS.map(({key})=>[
                <th key={key+"b"}>มิเตอร์ก่อน</th>,
                <th key={key+"a"}>มิเตอร์หลัง</th>,
                <th key={key+"t"}>รวม</th>,
              ])}
            </tr>
          </thead>
          <tbody>
            {Array.from({length:days},(_,i)=>i+1).map(d=>{
              const r=rows[d]||{};
              const nets=METERS.map(({key})=>calcNet(r,key));
              const grandTotal=nets.every(v=>v!=null)?nets.reduce((a,v)=>a+v,0):null;
              return <tr key={d}>
                <td className="day">{d}</td>
                {METERS.map(({key},mi)=>{
                  const net=nets[mi];
                  return [
                    <td key={key+"b"}><EditCell rows={rows} d={d} field={key+"_before"} admin={admin} mutate={mutateLinked} w={70}/></td>,
                    <td key={key+"a"}><EditCell rows={rows} d={d} field={key+"_after"} admin={admin} mutate={mutateLinked} w={70}/></td>,
                    <td key={key+"t"} className="calc">{net!=null?fmt(net):"–"}</td>,
                  ];
                })}
                <td className="calc">{grandTotal!=null?fmt(grandTotal):"–"}</td>
              </tr>;
            })}
            <tr className="total">
              <td>รวม</td>
              {METERS.map(({key})=>[
                <td key={key+"b"}>–</td>,
                <td key={key+"a"}>–</td>,
                <td key={key+"t"} className="calc">{fmt(key==="hospital"?t.h:key==="khuan"?t.k:t.dm)}</td>,
              ])}
              <td className="calc">{fmt(t.total)}</td>
            </tr>
          </tbody>
        </table>}
    </TableCard>
  </div>;
}

// ════════ CHLORINE START ════════
function ChlorineStart({ctx}){
  const {month:m,year:y,setMonth,setYear,role}=ctx;
  const admin=role==="admin";
  const docId=`chlorine_start_${y}_${m}`;
  const {data:rows,loading,mutate}=useFsDoc(docId);
  const days=getDays(m);
  const c=clComplianceFrom(rows,m);

  return <div>
    <PageHead title="คลอรีนต้นทาง (รายวัน)" subtitle="เกณฑ์: คลอรีนอิสระ ≥ 0.2 มก./ล · TDS ≤ 1,000 มก./ล">
      <MonthPicker month={m} year={y} onMonth={setMonth} onYear={setYear}/>
    </PageHead>
    {!loading&&c.tot>0&&<div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 18px",borderRadius:"var(--r-lg)",marginBottom:18,
      background:c.ok/c.tot>=.9?"var(--ok-bg)":"var(--warn-bg)",border:`1px solid ${c.ok/c.tot>=.9?"var(--ok-border)":"var(--warn-border)"}`}}>
      <div style={{width:38,height:38,borderRadius:"50%",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",
        color:c.ok/c.tot>=.9?"var(--ok)":"var(--warn)"}}><Icon name="shield" size={20}/></div>
      <div><div style={{fontWeight:700,fontSize:15,color:c.ok/c.tot>=.9?"var(--ok)":"var(--warn)"}}>
        คลอรีนผ่านเกณฑ์ {c.ok}/{c.tot} วัน ({Math.round(c.ok/c.tot*100)}%)</div>
        <div style={{fontSize:12.5,color:"var(--ink-500)",marginTop:1}}>{c.ok/c.tot>=.9?"อยู่ในเกณฑ์มาตรฐาน":"ควรตรวจสอบและเติมคลอรีนเพิ่ม"}</div></div>
    </div>}
    <TableCard title="ตารางตรวจวัดคลอรีนต้นทาง" right={admin?<Tag tone="ok"><Dot tone="ok"/>แก้ไขได้</Tag>:<Tag tone="gray">ดูอย่างเดียว</Tag>}>
      {loading
        ? <div style={{padding:30}}><div className="skel" style={{height:300}}/></div>
        : <table className="dt" key={docId}>
          <thead><tr><th>วันที่</th><th>เวลา</th><th>คลอรีนอิสระ<small>มก./ล</small></th><th>TDS<small>มก./ล</small></th><th>pH</th><th>สถานะ</th><th>หมายเหตุ</th><th>ผู้ตรวจ</th></tr></thead>
          <tbody>
            {Array.from({length:days},(_,i)=>i+1).map(d=>{const r=rows[d]||{};const cl=+r.free_chlorine;const ok=!isNaN(cl)&&cl>=0.2;const has=!isNaN(cl)&&r.free_chlorine!==""&&r.free_chlorine!=null;
              return <tr key={d}><td className="day">{d}</td>
                <td><EditCell rows={rows} d={d} field="time" admin={admin} mutate={mutate} type="text" w={56}/></td>
                <td><EditCell rows={rows} d={d} field="free_chlorine" admin={admin} mutate={mutate} w={64}/></td>
                <td><EditCell rows={rows} d={d} field="tds" admin={admin} mutate={mutate} w={64}/></td>
                <td><EditCell rows={rows} d={d} field="ph" admin={admin} mutate={mutate} w={52}/></td>
                <td>{has
                  ?<span style={{fontWeight:700,color:ok?"var(--ok)":"var(--bad)"}}>{ok?"ผ่าน":"ไม่ผ่าน"}</span>
                  :"–"}</td>
                <td style={{textAlign:"left",minWidth:140}}><EditCell rows={rows} d={d} field="note" admin={admin} mutate={mutate} type="text" w={130}/></td>
                <td style={{minWidth:110}}>{admin
                  ?<select className="ti" value={r.inspector||""} style={{width:100}} onChange={e=>mutate(rw=>{if(!rw[d])rw[d]={};rw[d].inspector=e.target.value;})}>
                    <option value=""></option>
                    {["ธรรมนูญ","วีระยุทธ","สิทธิชัย","ณัฐพัฒน์"].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                  :<span>{r.inspector||"–"}</span>}</td></tr>;})}
          </tbody>
        </table>}
    </TableCard>
  </div>;
}

// ════════ CHLORINE END (weekly, 4 weeks × buildings) ════════
function ChlorineEnd({ctx}){
  const {month:m,year:y,setMonth,setYear,role}=ctx;
  const admin=role==="admin";
  const docId=`chlorine_end_${y}_${m}`;
  const {data,loading,mutate}=useFsDoc(docId);

  const updateWeekDate=(wk,v)=>mutate(d=>{if(!d[wk])d[wk]={};d[wk].date=v;});
  const updateRow=(wk,b,f,v)=>mutate(d=>{if(!d[wk])d[wk]={};if(!d[wk][b])d[wk][b]={};d[wk][b][f]=v;});

  return <div>
    <PageHead title="คลอรีนปลายทาง (รายสัปดาห์)" subtitle="ตรวจรายสัปดาห์ · เกณฑ์คลอรีนอิสระ ≥ 0.2 มก./ล">
      <MonthPicker month={m} year={y} onMonth={setMonth} onYear={setYear}/>
    </PageHead>
    {loading
      ? <Card><div className="skel" style={{height:400}}/></Card>
      : <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {[1,2,3,4,5].map(wk=>{
          const wd=data[wk]||{};
          return <Card key={wk} pad={0} style={{overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"13px 18px",borderBottom:"1px solid var(--border)",flexWrap:"wrap"}}>
              <div style={{width:30,height:30,borderRadius:8,background:"var(--brand-50)",color:"var(--brand-600)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13}}>W{wk}</div>
              <div style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:14.5,color:"var(--ink-800)"}}>สัปดาห์ที่ {wk}</div>
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontSize:12,color:"var(--ink-500)"}}>วันที่ตรวจ:</span>
                {admin
                  ?<input type="date" defaultValue={wd.date||""} key={wk+(wd.date||"")} onChange={e=>updateWeekDate(wk,e.target.value)}
                    style={{padding:"5px 9px",fontFamily:"var(--font)",fontSize:12.5,border:"1px solid var(--border-strong)",borderRadius:6,outline:"none"}}/>
                  :<span style={{fontSize:12.5,fontWeight:600}}>{wd.date||"–"}</span>}
              </div>
            </div>
            <table className="dt">
              <thead><tr>
                <th style={{textAlign:"left",paddingLeft:18}}>อาคาร</th>
                <th style={{textAlign:"left"}}>จุดเก็บตัวอย่าง</th>
                <th>คลอรีนอิสระ<small>มก./ล</small></th>
                <th>TDS<small>มก./ล</small></th>
                <th>pH</th>
                <th>สถานะ</th>
                <th>ผู้ตรวจ</th>
              </tr></thead>
              <tbody>{BLDG_END.map((sp,si)=>{const r=wd[sp]||{};const cl=+r.free_chlorine;const has=!isNaN(cl)&&r.free_chlorine!==""&&r.free_chlorine!=null;const ok=has&&cl>=0.2;
                return <tr key={si}>
                  <td style={{textAlign:"left",paddingLeft:18,fontWeight:500,color:"var(--ink-700)"}}>{sp}</td>
                  <td style={{textAlign:"left",fontSize:12,color:"var(--ink-400)"}}>{SPOTS[sp]}</td>
                  <td>{admin?<input className="ti" type="number" step="any" defaultValue={r.free_chlorine??""} key={`${wk}-${sp}-cl-${wd.date||""}`} style={{width:64}} onChange={e=>updateRow(wk,sp,"free_chlorine",e.target.value===""?"":+e.target.value)}/>:<span>{r.free_chlorine??"–"}</span>}</td>
                  <td>{admin?<input className="ti" type="number" step="any" defaultValue={r.tds??""} key={`${wk}-${sp}-tds-${wd.date||""}`} style={{width:64}} onChange={e=>updateRow(wk,sp,"tds",e.target.value===""?"":+e.target.value)}/>:<span>{r.tds??"–"}</span>}</td>
                  <td>{admin?<input className="ti" type="number" step="any" defaultValue={r.ph??""} key={`${wk}-${sp}-ph-${wd.date||""}`} style={{width:52}} onChange={e=>updateRow(wk,sp,"ph",e.target.value===""?"":+e.target.value)}/>:<span>{r.ph??"–"}</span>}</td>
                  <td>{has
                    ?<span style={{fontWeight:700,color:ok?"var(--ok)":"var(--bad)"}}>{ok?"ผ่าน":"ไม่ผ่าน"}</span>
                    :"–"}</td>
                  <td>{admin
                    ?<select className="ti" value={r.inspector||""} key={`${wk}-${sp}-i-${wd.date||""}`} style={{width:100}} onChange={e=>updateRow(wk,sp,"inspector",e.target.value)}>
                      <option value=""></option>
                      {["ธรรมนูญ","วีระยุทธ","สิทธิชัย","ณัฐพัฒน์"].map(n=><option key={n} value={n}>{n}</option>)}
                    </select>
                    :<span>{r.inspector||"–"}</span>}</td>
                </tr>;})}</tbody>
            </table>
          </Card>;
        })}
      </div>}
  </div>;
}

// ════════ WW SUMMARY WATER ════════
function WWSummaryWater({ctx,bldg}){
  const {year:y,setYear}=ctx;
  const title=bldg==="research"?"อาคารวิจัยฯ":"อาคาร สธ.";
  const ids=MN.map((_,mi)=>`ww_${bldg}_${y}_${mi}`);
  const {map,loading}=useFsDocs(ids);
  const months=MN.map((_,mi)=>sumWWFrom(map[`ww_${bldg}_${y}_${mi}`]||{},mi));

  const [vis,setVis]=useState({water:true,waste:true,flow:true});
  const toggleVis=(k)=>setVis(v=>({...v,[k]:!v[k]}));
  const series=[
    {key:"water",label:"น้ำประปา",           color:brandColor("--brand-500"),bg:"rgba(31,116,186,.2)",  bg2:"rgba(31,116,186,0)",  data:months.map(x=>+x.w.toFixed(0))},
    {key:"waste",label:"น้ำเสีย",             color:brandColor("--teal-500"), bg:"rgba(15,138,114,.18)",bg2:"rgba(15,138,114,0)",  data:months.map(x=>+x.waste.toFixed(1))},
    {key:"flow", label:"น้ำเสีย (Flowmeter)", color:"#e05c00",                bg:"rgba(224,92,0,.15)",  bg2:"rgba(224,92,0,0)",    data:months.map(x=>+x.flow.toFixed(1))},
  ];
  const chartData={labels:MS,datasets:series.filter(s=>vis[s.key]).map(s=>({...areaDataset(s.label,s.data,s.color,s.bg,s.bg2)}))};

  return <div>
    <PageHead title={`สรุปรายเดือน · ${title}`} subtitle={`ข้อมูลน้ำประปา/น้ำเสีย ปีงบประมาณ ${y}`}>
      <Select value={y} onChange={v=>setYear(+v)} options={[2568,2569,2570].map(v=>({v,l:`ปี ${v}`}))}/>
    </PageHead>
    <div style={{marginBottom:18}}>
      <ChartCard title="แนวโน้มทั้งปี" loading={loading}
        right={<div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          {series.map(s=>(
            <button key={s.key} onClick={()=>toggleVis(s.key)}
              style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:99,fontSize:12,fontWeight:600,cursor:"pointer",
                background:vis[s.key]?s.bg:"var(--surface-2)",
                border:`1.5px solid ${vis[s.key]?s.color:"var(--border)"}`,
                color:vis[s.key]?s.color:"var(--ink-400)",transition:"all .15s"}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:vis[s.key]?s.color:"var(--border)",display:"inline-block"}}/>
              {s.label}
            </button>))}
        </div>}>
        <ChartBox type="line" data={chartData} options={baseOpts()} height={250}/>
      </ChartCard>
    </div>
    <TableCard title={`ตารางสรุปรายเดือน · ${title}`}>
      {loading
        ? <div style={{padding:30}}><div className="skel" style={{height:340}}/></div>
        : <table className="dt">
          <thead><tr>
            <th style={{textAlign:"left"}}>เดือน</th>
            <th>น้ำประปา<small>ลบ.ม.</small></th><th>น้ำเสีย<small>ลบ.ม.</small></th>
            <th>น้ำเสีย (Flowmeter)<small>ลบ.ม.</small></th><th>น้ำทิ้ง<small>ลบ.ม.</small></th>
            <th>การใช้ไฟฟ้า<small>kWh</small></th><th>ค่าไฟฟ้า<small>บาท</small></th>
            <th>คลอรีน<small>ลิตร</small></th><th>ค่าคลอรีน<small>บาท</small></th>
            <th>เฉลี่ยน้ำ/วัน</th>
          </tr></thead>
          <tbody>{MN.map((mn,mi)=>{const x=months[mi],e=x.cnt===0;
            return <tr key={mi} style={{opacity:e?.4:1}}>
              <td className="day" style={{textAlign:"left",width:"auto",paddingLeft:16}}>{mn}</td>
              <td>{e?"–":fmt(x.w)}</td><td>{e?"–":fmt(x.waste,1)}</td><td>{e?"–":fmt(x.flow,1)}</td><td>{e?"–":fmt(x.out,1)}</td>
              <td>{e?"–":fmt(x.e)}</td><td>{e?"–":fmt(x.cost,0)}</td>
              <td>{e?"–":fmt(x.cl,1)}</td><td>{e?"–":fmt(x.clc,0)}</td>
              <td className="calc">{e?"–":fmt(x.cnt?x.w/x.cnt:0,1)}</td>
            </tr>;})}</tbody>
        </table>}
    </TableCard>
  </div>;
}

// ════════ WW SUMMARY PARAM ════════
function WWSummaryParam({ctx,bldg}){
  const {year:y,setYear}=ctx;
  const title=bldg==="research"?"อาคารวิจัยฯ":"อาคาร สธ.";
  const PARAMS=bldg==="research"?PARAMS_RESEARCH:PARAMS_STH;
  const [pid,setPid]=useState(PARAMS[0].id);
  const param=PARAMS.find(p=>p.id===pid)||PARAMS[0];
  const allTanks=param.tanks.flatMap(g=>g.ids);

  // load all 12 months of param data
  const ids=MN.map((_,mi)=>`ww_param_${bldg}_${param.id}_${y}_${mi}`);
  const {map,loading}=useFsDocs(ids);

  // helper: monthly avg per tank
  const monthAvg=(mi,tankId)=>{
    const rows=map[`ww_param_${bldg}_${param.id}_${y}_${mi}`]||{};
    const days=getDays(mi);
    let s=0,c=0;
    for(let d=1;d<=days;d++){
      ["m","a"].forEach(sh=>{const v=+rows[d]?.[tankId]?.[sh];if(!isNaN(v)&&rows[d]?.[tankId]?.[sh]!==""&&rows[d]?.[tankId]?.[sh]!=null){s+=v;c++;}});
    }
    return c?+(s/c).toFixed(2):null;
  };

  const stdExceeded=(v)=>{
    if(v==null||v==="") return false;
    const n=+v;if(isNaN(n)) return false;
    if(param.stdMax!=null&&n>param.stdMax) return true;
    if(param.stdMin!=null&&n<param.stdMin) return true;
    return false;
  };

  return <div>
    <PageHead title={`สรุปรายเดือน · ${title}`} subtitle={`ข้อมูลตรวจวัดน้ำเสีย ปีงบประมาณ ${y}`}>
      <Select value={y} onChange={v=>setYear(+v)} options={[2568,2569,2570].map(v=>({v,l:`ปี ${v}`}))}/>
    </PageHead>

    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:18}}>
      {PARAMS.map(p=><button key={p.id} className={"tabchip"+(pid===p.id?" on":"")} onClick={()=>setPid(p.id)}>
        {p.label}{p.unit?` (${p.unit})`:""}</button>)}
    </div>

    {param.std!=="—"&&<div style={{marginBottom:12,fontSize:12.5,color:"var(--ink-500)"}}>
      เกณฑ์: <strong style={{color:"var(--ink-700)"}}>{param.std} {param.unit}</strong>
      <span style={{marginLeft:12,color:"var(--bad)",fontWeight:600}}>■ สีแดง = เกินเกณฑ์</span>
    </div>}

    <div style={{overflowX:"auto",marginBottom:18}}>
      {loading
        ?<div style={{padding:30}}><div className="skel" style={{height:300}}/></div>
        :<table className="dt">
          <thead>
            <tr>
              <th style={{textAlign:"left"}}>เดือน</th>
              {param.tanks.map(g=><th key={g.g} colSpan={g.ids.length}>{g.g}</th>)}
            </tr>
            <tr>
              <th/>
              {allTanks.map(id=><th key={id}>{id}<small>เฉลี่ย</small></th>)}
            </tr>
          </thead>
          <tbody>{MN.map((mn,mi)=>{
            const vals=allTanks.map(id=>monthAvg(mi,id));
            const hasAny=vals.some(v=>v!=null);
            return <tr key={mi} style={{opacity:hasAny?1:.4}}>
              <td className="day" style={{textAlign:"left",width:"auto",paddingLeft:16}}>{mn}</td>
              {vals.map((v,i)=>{
                const over=stdExceeded(v);
                return <td key={i} style={{color:over?"var(--bad)":"var(--ink-800)",fontWeight:over?700:400}}>
                  {v!=null?v:"–"}
                </td>;
              })}
            </tr>;
          })}</tbody>
        </table>}
    </div>
  </div>;
}

// keep old WWSummary as alias for backward compat (not used in nav anymore)
const WWSummary=WWSummaryWater;

// ════════ WATER USAGE STH ════════
function WaterUsageSth({ctx}){
  const {month:m,year:y,setMonth,setYear,role}=ctx;
  const admin=role==="admin";
  const docId=`water_usage_sth_${y}_${m}`;
  const wwSthDocId=`ww_sth_${y}_${m}`;
  const {data:rows,loading,mutate}=useFsDoc(docId);
  const days=getDays(m);

  const calcNet=(r)=>{
    const a=r?.sth_after,b=r?.sth_before;
    if(a!=null&&a!==""&&b!=null&&b!=="") return (+(a)||0)-(+(b)||0);
    return null;
  };

  // link net → ww_sth daily.water อัตโนมัติ
  const mutateLinked=(fn)=>{
    mutate(r=>{fn(r);});
    Object.keys(rows).forEach(d=>{
      const dn=+d;if(isNaN(dn))return;
      const r=rows[d]||{};
      const net=calcNet(r);
      const wwData=window.__cache[wwSthDocId];
      if(wwData){if(!wwData[dn])wwData[dn]={};wwData[dn].water=net!=null&&net>0?net:"";debouncedSave(wwSthDocId,wwData);}
    });
  };

  let tS=0,cnt=0;
  for(let d=1;d<=days;d++){const v=calcNet(rows[d]);if(v!=null){tS+=v;cnt++;}}

  const chartData={labels:Array.from({length:days},(_,i)=>i+1),datasets:[
    {...barDataset("อาคารรัตนชีวรักษ์ สธ.",Array.from({length:days},(_,i)=>{const v=calcNet(rows[i+1]);return v!=null?v:0;}),brandColor("--teal-500"))}]};
  const chartOpts=baseOpts({scales:{x:{grid:{display:false},border:{display:false},ticks:{color:"#94a0b3",font:{family:"Sarabun",size:10},autoSkipPadding:10}},y:{grid:{color:"#eef2f7",drawBorder:false},border:{display:false},ticks:{color:"#94a0b3",font:{family:"Sarabun",size:11}},beginAtZero:true}}});

  return <div>
    <PageHead title="การใช้น้ำประปา — อาคาร สธ." subtitle={`${MN[m]} ${y} · มิเตอร์ 1 จุด — อาคารรัตนชีวรักษ์`}>
      <MonthPicker month={m} year={y} onMonth={setMonth} onYear={setYear}/>
    </PageHead>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:13,marginBottom:18}}>
      <StatCard loading={loading} label="อาคารรัตนชีวรักษ์ สธ." value={fmt(tS)} unit="ลบ.ม." icon="droplet" tone="teal"/>
      <StatCard loading={loading} label="เฉลี่ยต่อวัน" value={fmt(cnt?tS/cnt:0,1)} unit="ลบ.ม." icon="chart" tone="gray"/>
    </div>
    <div style={{marginBottom:18}}>
      <ChartCard title="การใช้น้ำรายวัน — อาคารรัตนชีวรักษ์ สธ." loading={loading}>
        <ChartBox type="bar" data={chartData} options={chartOpts} height={250}/>
      </ChartCard>
    </div>
    <TableCard title="ตารางบันทึกการใช้น้ำ" right={admin?<Tag tone="ok"><Dot tone="ok"/>แก้ไขได้</Tag>:<Tag tone="gray">ดูอย่างเดียว</Tag>}>
      {loading
        ? <div style={{padding:30}}><div className="skel" style={{height:300}}/></div>
        : <table className="dt" key={docId}>
          <thead>
            <tr>
              <th rowSpan="2">วันที่</th>
              <th colSpan="3">อาคารรัตนชีวรักษ์ สธ.<small>ลบ.ม.</small></th>
            </tr>
            <tr>
              <th>มิเตอร์ก่อน</th>
              <th>มิเตอร์หลัง</th>
              <th>รวม</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({length:days},(_,i)=>i+1).map(d=>{
              const r=rows[d]||{};
              const net=calcNet(r);
              return <tr key={d}>
                <td className="day">{d}</td>
                <td><EditCell rows={rows} d={d} field="sth_before" admin={admin} mutate={mutateLinked} w={80}/></td>
                <td><EditCell rows={rows} d={d} field="sth_after" admin={admin} mutate={mutateLinked} w={80}/></td>
                <td className="calc">{net!=null?fmt(net):"–"}</td>
              </tr>;
            })}
            <tr className="total"><td>รวม</td><td>–</td><td>–</td><td className="calc">{fmt(tS)}</td></tr>
          </tbody>
        </table>}
    </TableCard>
  </div>;
}

Object.assign(window,{StatCard,ChartCard,TableCard,Legend,EmptyState,EditCell,fmt,
  sumWWFrom,sumWaterFrom,clComplianceFrom,
  Dashboard,WWDaily,WWParam,WaterUsage,WaterUsageSth,ChlorineStart,ChlorineEnd,WWSummary,WWSummaryWater,WWSummaryParam});
