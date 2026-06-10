// ════════ WW Analysis (lab) ════════
function WWAnalysis({ctx,bldg}){
  const {month:m,year:y,setMonth,setYear,role}=ctx;
  const admin=role==="admin";
  const title=bldg==="research"?"ผลวิเคราะห์น้ำเสีย · อาคารวิจัยฯ":"ผลวิเคราะห์น้ำเสีย · อาคาร สธ.";

  // Year-wide load for chart + history table
  const ids=MN.map((_,mi)=>`ww_analysis_${bldg}_${y}_${mi}`);
  const {map,loading}=useFsDocs(ids);
  const docId=`ww_analysis_${bldg}_${y}_${m}`;
  const cur=map[docId]||{};
  const hasCur=Object.keys(cur).length>0;

  const update=(f,v)=>{
    if(!window.__cache[docId]) window.__cache[docId]={};
    window.__cache[docId][f]=v;
    debouncedSave(docId, window.__cache[docId]);
  };
  const [,force]=useState(0);

  const keys=[{id:"bod",label:"BOD",color:brandColor("--brand-500")},
              {id:"cod",label:"COD",color:brandColor("--teal-500")},
              {id:"ss",label:"TSS",color:brandColor("--warn")}];
  const chartData={labels:MS,datasets:keys.map(k=>{
    const data=MN.map((_,mi)=>{const r=map[`ww_analysis_${bldg}_${y}_${mi}`]||{};return r[k.id]!=null&&r[k.id]!==""?+r[k.id]:null;});
    return {label:k.label,data,borderColor:k.color,backgroundColor:k.color+"22",borderWidth:2.4,tension:.38,
      pointRadius:3,pointBackgroundColor:k.color,pointBorderColor:"#fff",pointBorderWidth:1.5,spanGaps:true,fill:false};
  })};

  const status=(p,v)=>{ if(v==null||v===""||p.std==="—")return null;
    const num=+v; if(isNaN(num))return null;
    if(p.min!=null&&num<p.min) return "bad";
    if(p.max!=null&&num>p.max) return "bad";
    if(p.max!=null&&num>p.max*0.85) return "warn";
    return "ok"; };

  return <div>
    <PageHead title={title} subtitle={`รายงานผลตรวจจากห้องปฏิบัติการ — ${MN[m]} ${y}`}>
      <MonthPicker month={m} year={y} onMonth={setMonth} onYear={setYear}/>
    </PageHead>

    <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:16,marginBottom:18}}>
      <ChartCard title="แนวโน้มพารามิเตอร์หลัก (ทั้งปี)" loading={loading} right={<Legend items={keys.map(k=>({c:k.color,l:k.label}))}/>}>
        <ChartBox type="line" data={chartData} options={baseOpts()} height={240}/>
      </ChartCard>
      <Card pad={18}>
        <div style={{fontFamily:"var(--font-display)",fontSize:14.5,fontWeight:700,color:"var(--ink-800)",marginBottom:12}}>สถานะคุณภาพน้ำ</div>
        {loading?<div className="skel" style={{height:200}}/>:hasCur?(()=>{
          let ok=0,warn=0,bad=0,total=0;
          WW_ANALYSIS_PARAMS.forEach(p=>{const s=status(p,cur[p.id]);if(s){total++;if(s==="ok")ok++;else if(s==="warn")warn++;else bad++;}});
          const score=total?Math.round(ok/total*100):0;
          return <div>
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:14}}>
              <div className="num" style={{fontFamily:"var(--font-display)",fontSize:38,fontWeight:700,color:score>=85?"var(--ok)":score>=60?"var(--warn)":"var(--bad)",lineHeight:1}}>{score}<span style={{fontSize:18,fontWeight:600}}>%</span></div>
              <div style={{fontSize:13,color:"var(--ink-500)"}}>ผ่านเกณฑ์</div>
            </div>
            <div style={{height:9,borderRadius:99,overflow:"hidden",display:"flex",background:"var(--surface-2)",marginBottom:14}}>
              <div style={{width:`${total?ok/total*100:0}%`,background:"var(--ok)"}}/>
              <div style={{width:`${total?warn/total*100:0}%`,background:"var(--warn)"}}/>
              <div style={{width:`${total?bad/total*100:0}%`,background:"var(--bad)"}}/>
            </div>
            <div style={{display:"grid",gap:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{display:"inline-flex",alignItems:"center",gap:7,color:"var(--ink-700)"}}><Dot tone="ok"/>ผ่านเกณฑ์</span><span className="num" style={{fontWeight:600,color:"var(--ink-800)"}}>{ok} ค่า</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{display:"inline-flex",alignItems:"center",gap:7,color:"var(--ink-700)"}}><Dot tone="warn"/>เฝ้าระวัง</span><span className="num" style={{fontWeight:600,color:"var(--ink-800)"}}>{warn} ค่า</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{display:"inline-flex",alignItems:"center",gap:7,color:"var(--ink-700)"}}><Dot tone="bad"/>เกินมาตรฐาน</span><span className="num" style={{fontWeight:600,color:"var(--ink-800)"}}>{bad} ค่า</span></div>
            </div>
            {cur.send_date&&<div style={{marginTop:14,padding:"10px 12px",background:"var(--surface-2)",borderRadius:"var(--r-sm)",fontSize:12.5,color:"var(--ink-500)"}}>
              <div>วันที่ส่งตรวจ: <span style={{color:"var(--ink-800)",fontWeight:600}}>{cur.send_date}</span></div>
              {cur.pdf_link&&<a href={cur.pdf_link} target="_blank" rel="noopener" style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:7,color:"var(--brand-600)",textDecoration:"none",fontWeight:600,fontSize:12.5}}>
                <Icon name="link" size={13}/>ดูเอกสาร PDF</a>}
            </div>}
          </div>;
        })():<EmptyState msg={admin?"กรอกผลตรวจด้านล่างได้เลย":"ยังไม่มีข้อมูลในเดือนนี้"}/>}
      </Card>
    </div>

    {/* Editable cards grid */}
    <Card pad={0} style={{marginBottom:18,overflow:"hidden"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,padding:"14px 18px",borderBottom:"1px solid var(--border)",flexWrap:"wrap"}}>
        <div style={{fontFamily:"var(--font-display)",fontSize:14.5,fontWeight:700,color:"var(--ink-800)"}}>รายละเอียดผลตรวจ {MN[m]} {y}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          {admin&&<>
            <span style={{fontSize:12.5,color:"var(--ink-500)"}}>วันที่ส่งตรวจ:</span>
            <input type="text" placeholder="เช่น 15/05/2569" defaultValue={cur.send_date||""}
              key={`send-${docId}`} onChange={e=>{update("send_date",e.target.value);force(x=>x+1);}}
              style={{padding:"6px 10px",fontFamily:"var(--font)",fontSize:12.5,border:"1px solid var(--border-strong)",borderRadius:6,outline:"none",width:130}}/>
            <input type="text" placeholder="ลิงก์ PDF (ไม่บังคับ)" defaultValue={cur.pdf_link||""}
              key={`pdf-${docId}`} onChange={e=>update("pdf_link",e.target.value)}
              style={{padding:"6px 10px",fontFamily:"var(--font)",fontSize:12.5,border:"1px solid var(--border-strong)",borderRadius:6,outline:"none",width:200}}/>
          </>}
        </div>
      </div>
      {loading?<div style={{padding:30}}><div className="skel" style={{height:240}}/></div>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,padding:14}}>
          {WW_ANALYSIS_PARAMS.map(p=>{
            const v=cur[p.id]; const s=status(p,v);
            const toneBg={ok:"var(--ok-bg)",warn:"var(--warn-bg)",bad:"var(--bad-bg)"}[s]||"var(--surface-2)";
            const toneBd={ok:"var(--ok-border)",warn:"var(--warn-border)",bad:"var(--bad-border)"}[s]||"var(--border)";
            const toneFg={ok:"var(--ok)",warn:"var(--warn)",bad:"var(--bad)"}[s]||"var(--ink-400)";
            const pct=p.max&&v!=null&&v!==""?Math.min(100,(+v/p.max)*100):null;
            return <div key={p.id} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",padding:14}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:8}}>
                <div style={{fontSize:12.5,fontWeight:600,color:"var(--ink-600)",lineHeight:1.3}}>{p.label}</div>
                {s&&<span style={{padding:"1px 8px",borderRadius:99,fontSize:10.5,fontWeight:700,
                  background:toneBg,color:toneFg,border:`1px solid ${toneBd}`}}>{s==="ok"?"ผ่าน":s==="warn"?"เฝ้าระวัง":"เกิน"}</span>}
              </div>
              <div style={{display:"flex",alignItems:"baseline",gap:5,marginBottom:8}}>
                {admin
                  ?<input className="num" type={p.id==="t_coli"||p.id==="f_coli"?"text":"number"} step="any" defaultValue={v??""}
                    key={`${docId}-${p.id}`} onChange={e=>{const val=e.target.value;update(p.id,p.id==="t_coli"||p.id==="f_coli"?val:(val===""?"":+val));force(x=>x+1);}}
                    style={{flex:1,minWidth:0,padding:"5px 8px",fontFamily:"var(--font-display)",fontSize:18,fontWeight:700,color:"var(--ink-900)",
                      border:"1px solid var(--border-strong)",borderRadius:6,outline:"none"}}/>
                  :<div className="num" style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:700,color:"var(--ink-900)",lineHeight:1}}>{v??"–"}</div>}
                <div style={{fontSize:11.5,color:"var(--ink-400)"}}>{p.unit}</div>
              </div>
              {pct!=null&&<div style={{height:5,borderRadius:99,background:"var(--surface-2)",overflow:"hidden",marginBottom:7}}>
                <div style={{height:"100%",width:`${pct}%`,background:toneFg,transition:"width .4s"}}/></div>}
              <div style={{fontSize:11,color:"var(--ink-400)"}}>เกณฑ์: <span style={{color:"var(--ink-600)",fontWeight:600}}>{p.std}</span></div>
            </div>;
          })}
        </div>}
    </Card>

    <TableCard title="ประวัติผลตรวจทั้งปี">
      {loading?<div style={{padding:30}}><div className="skel" style={{height:200}}/></div>
        :<table className="dt">
          <thead><tr>
            <th style={{textAlign:"left",paddingLeft:16}}>เดือน</th>
            <th>วันที่ส่งตรวจ</th>
            {WW_ANALYSIS_PARAMS.slice(0,9).map(p=><th key={p.id}>{p.label.split("(")[0].trim()}<small>{p.unit||"–"}</small></th>)}
            <th>เอกสาร</th>
          </tr></thead>
          <tbody>{MN.map((mn,mi)=>{const r=map[`ww_analysis_${bldg}_${y}_${mi}`]||{};
            const has=Object.keys(r).length>0;
            if(!has) return <tr key={mi} style={{opacity:.4}}><td className="day" style={{textAlign:"left",paddingLeft:16,width:"auto"}}>{mn}</td><td colSpan={11}>ยังไม่มีข้อมูล</td></tr>;
            return <tr key={mi}><td className="day" style={{textAlign:"left",paddingLeft:16,width:"auto"}}>{mn}</td>
              <td style={{color:"var(--ink-500)",fontSize:12}}>{r.send_date||"–"}</td>
              {WW_ANALYSIS_PARAMS.slice(0,9).map(p=>{const v=r[p.id];const s=status(p,v);
                return <td key={p.id} style={{color:s==="bad"?"var(--bad)":s==="warn"?"var(--warn)":"var(--ink-800)",fontWeight:s?600:400}}>{v??"–"}</td>;})}
              <td>{r.pdf_link?<a href={r.pdf_link} target="_blank" rel="noopener" style={{color:"var(--brand-600)",fontSize:12,fontWeight:600,textDecoration:"none"}}>PDF</a>:"–"}</td></tr>;})}
          </tbody>
        </table>}
    </TableCard>
  </div>;
}

// ════════ Water analysis (รพ. ประปา) — per building, per month ════════
// ════════ shared helper for water analysis cards ════════
const BUILDINGS_TAP = [
  "อาคารเฉลิมพระบารมี","อาคารศรีเวชวัฒน์","อาคารรัตนชีวรักษ์","อาคาร 100 ปี","อาคารโรงพยาบาล","น้ำเข้าโรงพยาบาล"
];
const BUILDINGS_RO = [
  "น้ำ RO อาคารเฉลิมพระบารมี","น้ำ RO อาคารศรีเวชวัฒน์","น้ำ RO อาคารรัตนชีวรักษ์","น้ำฟอกไต อาคาร 100 ปี","น้ำฟอกไต อาคารเฉลิมพระบารมี"
];

function WaterAnalysisBase({ctx,pageTitle,buildings,params,docPrefix}){
  const {month:m,year:y,setMonth,setYear,role}=ctx;
  const admin=role==="admin";
  const [bldg,setBldg]=useState(buildings[0]);
  const bldgKey=bldg.replace(/[^a-zA-Z0-9ก-๙]/g,"_");
  const docId=`${docPrefix}_${y}_${m}_${bldgKey}`;
  const {data:cur,loading}=useFsDoc(docId);
  const [,force]=useState(0);
  const update=(f,v)=>{
    if(!window.__cache[docId]) window.__cache[docId]={};
    window.__cache[docId][f]=v;
    debouncedSave(docId,window.__cache[docId]);
  };
  const status=(p,v)=>{
    if(v==null||v===""||p.std==="ไม่พบ"||p.std==="—")return null;
    const num=+v; if(isNaN(num))return null;
    if(p.min!=null&&num<p.min) return "bad";
    if(p.max!=null&&num>p.max) return "bad";
    if(p.max!=null&&num>p.max*0.85) return "warn";
    return "ok";
  };
  const isText=(id)=>["coliforms","e_coli","salmonella","staph","t_coli","f_coli"].includes(id);

  return <div>
    <PageHead title={pageTitle} subtitle={`${MN[m]} ${y} · เลือกอาคารและกรอกผลตรวจ`}>
      <MonthPicker month={m} year={y} onMonth={setMonth} onYear={setYear}/>
    </PageHead>

    <Card pad={14} style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <span style={{fontSize:12.5,fontWeight:600,color:"var(--ink-600)"}}>อาคาร:</span>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {buildings.map(b=><button key={b} className={"tabchip"+(bldg===b?" on":"")} onClick={()=>setBldg(b)}>{b}</button>)}
        </div>
      </div>
    </Card>

    <Card pad={0} style={{overflow:"hidden",marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,padding:"14px 18px",borderBottom:"1px solid var(--border)",flexWrap:"wrap"}}>
        <div>
          <div style={{fontFamily:"var(--font-display)",fontSize:14.5,fontWeight:700,color:"var(--ink-800)"}}>{bldg}</div>
          <div style={{fontSize:12,color:"var(--ink-500)",marginTop:2}}>ผลตรวจ — {MN[m]} {y}</div>
        </div>
        {admin&&<div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:12.5,color:"var(--ink-500)"}}>วันที่ส่งตรวจ:</span>
          <input type="text" placeholder="เช่น 15/05/2569" defaultValue={cur.send_date||""}
            key={`send-${docId}`} onChange={e=>{update("send_date",e.target.value);force(x=>x+1);}}
            style={{padding:"6px 10px",fontFamily:"var(--font)",fontSize:12.5,border:"1px solid var(--border-strong)",borderRadius:6,outline:"none",width:130}}/>
          <input type="text" placeholder="ลิงก์ PDF" defaultValue={cur.pdf_link||""}
            key={`pdf-${docId}`} onChange={e=>update("pdf_link",e.target.value)}
            style={{padding:"6px 10px",fontFamily:"var(--font)",fontSize:12.5,border:"1px solid var(--border-strong)",borderRadius:6,outline:"none",width:200}}/>
        </div>}
      </div>

      {loading?<div style={{padding:30}}><div className="skel" style={{height:200}}/></div>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,padding:14}}>
          {params.map(p=>{
            const v=cur[p.id]; const s=status(p,v);
            const toneBg={ok:"var(--ok-bg)",warn:"var(--warn-bg)",bad:"var(--bad-bg)"}[s]||"var(--surface-2)";
            const toneBd={ok:"var(--ok-border)",warn:"var(--warn-border)",bad:"var(--bad-border)"}[s]||"var(--border)";
            const toneFg={ok:"var(--ok)",warn:"var(--warn)",bad:"var(--bad)"}[s]||"var(--ink-400)";
            return <div key={p.id} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",padding:14}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:8}}>
                <div style={{fontSize:12.5,fontWeight:600,color:"var(--ink-600)",lineHeight:1.3}}>{p.label}</div>
                {s&&<span style={{padding:"1px 8px",borderRadius:99,fontSize:10.5,fontWeight:700,background:toneBg,color:toneFg,border:`1px solid ${toneBd}`}}>{s==="ok"?"ผ่าน":s==="warn"?"เฝ้าระวัง":"เกิน"}</span>}
              </div>
              <div style={{display:"flex",alignItems:"baseline",gap:5,marginBottom:8}}>
                {admin
                  ?<input className="num" type={isText(p.id)?"text":"number"} step="any" defaultValue={v??""}
                    key={`${docId}-${p.id}`} onChange={e=>{const val=e.target.value;update(p.id,isText(p.id)?val:(val===""?"":+val));force(x=>x+1);}}
                    style={{flex:1,minWidth:0,padding:"5px 8px",fontFamily:"var(--font-display)",fontSize:18,fontWeight:700,color:"var(--ink-900)",border:"1px solid var(--border-strong)",borderRadius:6,outline:"none"}}/>
                  :<div className="num" style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:700,color:"var(--ink-900)",lineHeight:1}}>{v??"–"}</div>}
                <div style={{fontSize:11.5,color:"var(--ink-400)"}}>{p.unit}</div>
              </div>
              <div style={{fontSize:11,color:"var(--ink-400)"}}>เกณฑ์: <span style={{color:"var(--ink-600)",fontWeight:600}}>{p.std}</span></div>
            </div>;
          })}
        </div>}
    </Card>
  </div>;
}

function WaterAnalysisTap({ctx}){
  return <WaterAnalysisBase ctx={ctx} pageTitle="ผลตรวจน้ำประปา"
    buildings={BUILDINGS_TAP} params={PARAMS_TAP_WATER} docPrefix="water_analysis_tap"/>;
}

function WaterAnalysisRo({ctx}){
  return <WaterAnalysisBase ctx={ctx} pageTitle="ผลตรวจน้ำ RO และน้ำฟอกไต"
    buildings={BUILDINGS_RO} params={PARAMS_RO_WATER} docPrefix="water_analysis_ro"/>;
}

// ════════ MANAGE USERS — create new login + role ════════
function ManageUsers({ctx}){
  const [open,setOpen]=useState(false);
  const [me,setMe]=useState(null);
  useEffect(()=>{
    const u=window.FB.auth.currentUser;
    if(u) window.FB.fsGetUser(u.uid).then(info=>setMe({uid:u.uid,email:u.email,...info}));
  },[]);

  return <div>
    <PageHead title="จัดการผู้ใช้" subtitle="สร้างบัญชีใหม่และกำหนดสิทธิ์การเข้าใช้ระบบ">
      <Btn variant="primary" icon="plus" onClick={()=>setOpen(true)}>เพิ่มผู้ใช้</Btn>
    </PageHead>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card pad={20}>
        <div style={{fontFamily:"var(--font-display)",fontSize:14.5,fontWeight:700,color:"var(--ink-800)",marginBottom:12}}>บัญชีของฉัน</div>
        {me?<div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
            <div style={{width:48,height:48,borderRadius:"50%",
              background:"linear-gradient(145deg,var(--brand-400),var(--brand-600))",color:"#fff",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:600}}>{(me.name||me.email)[0]}</div>
            <div>
              <div style={{fontWeight:600,color:"var(--ink-800)"}}>{me.name||"(ยังไม่ได้ตั้งชื่อ)"}</div>
              <div style={{fontSize:12.5,color:"var(--ink-500)"}}>{me.email}</div>
              <div style={{marginTop:5}}><Tag tone={me.role==="admin"?"brand":"teal"}>{me.role==="admin"?"ผู้ดูแลระบบ":"ผู้ดูข้อมูล"}</Tag></div>
            </div>
          </div>
          <div style={{padding:"11px 13px",background:"var(--brand-50)",border:"1px solid var(--brand-100)",borderRadius:"var(--r-sm)",fontSize:12.5,color:"var(--brand-700)",lineHeight:1.6}}>
            <strong>คำแนะนำ:</strong> Firebase Authentication ไม่อนุญาตให้แสดงรายชื่อผู้ใช้ทั้งหมดจากฝั่ง client เพื่อความปลอดภัย หากต้องการดูรายชื่อ ผู้ดูแลควรเข้า Firebase Console
          </div>
        </div>:<div className="skel" style={{height:120}}/>}
      </Card>

      <Card pad={20}>
        <div style={{fontFamily:"var(--font-display)",fontSize:14.5,fontWeight:700,color:"var(--ink-800)",marginBottom:12}}>สิทธิ์การใช้งาน</div>
        {[
          {role:"admin",label:"ผู้ดูแลระบบ",perms:["เพิ่ม/แก้ไข/ลบข้อมูลทุกหน้า","สร้างบัญชีผู้ใช้ใหม่","กำหนดสิทธิ์การเข้าถึง","ดูภาพรวมและสรุปทั้งหมด"]},
          {role:"viewer",label:"ผู้ดูข้อมูล",perms:["ดูข้อมูลทุกหน้า","ออกรายงาน/Export ได้","ไม่สามารถแก้ไขข้อมูล","ไม่สามารถจัดการผู้ใช้"]},
        ].map(r=>
          <div key={r.role} style={{padding:"12px 14px",border:"1px solid var(--border)",borderRadius:"var(--r-sm)",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <Tag tone={r.role==="admin"?"brand":"teal"}>{r.label}</Tag>
            </div>
            <ul style={{listStyle:"none",display:"grid",gap:5}}>{r.perms.map((p,i)=>
              <li key={i} style={{fontSize:12.5,color:"var(--ink-600)",display:"flex",alignItems:"flex-start",gap:7}}>
                <Icon name="check" size={13} stroke={2.5} style={{color:r.role==="admin"?"var(--brand-500)":"var(--teal-500)",marginTop:3,flexShrink:0}}/>{p}</li>)}
            </ul>
          </div>)}
      </Card>
    </div>

    {open&&<NewUserModal onClose={()=>setOpen(false)}/>}
  </div>;
}

function NewUserModal({onClose}){
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [role,setRole]=useState("viewer");
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);

  const submit=async()=>{
    if(!name||!email||!pass){setErr("กรุณากรอกข้อมูลให้ครบ");return;}
    if(pass.length<6){setErr("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");return;}
    setBusy(true); setErr("");
    try {
      const cred=await window.FB.createUser(email,pass);
      await window.FB.fsSetUser(cred.user.uid,{role,name});
      alert(`สร้างบัญชี ${name} (${email}) เรียบร้อย\n\nหมายเหตุ: Firebase จะลงชื่อเข้าใช้ด้วยบัญชีใหม่นี้อัตโนมัติ — กรุณา logout แล้วเข้าใหม่ด้วยบัญชีผู้ดูแลของคุณ`);
      onClose();
    } catch(e){
      setErr(e.code==="auth/email-already-in-use"?"อีเมลนี้ถูกใช้แล้ว":
             e.code==="auth/invalid-email"?"รูปแบบอีเมลไม่ถูกต้อง":
             e.message||"เกิดข้อผิดพลาด");
    } finally { setBusy(false); }
  };

  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(15,27,45,.5)",backdropFilter:"blur(3px)",
    display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,animation:"fadeIn .15s"}}>
    <div onClick={e=>e.stopPropagation()} className="fade-up" style={{width:460,background:"var(--surface)",
      borderRadius:"var(--r-xl)",boxShadow:"var(--sh-lg)",overflow:"hidden"}}>
      <div style={{padding:"18px 22px 14px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:"var(--font-display)",fontSize:17,fontWeight:700,color:"var(--ink-900)"}}>เพิ่มผู้ใช้ใหม่</div>
        <button onClick={onClose} style={{border:"none",background:"transparent",color:"var(--ink-400)",cursor:"pointer",padding:4,borderRadius:6,display:"flex"}}><Icon name="x" size={18}/></button>
      </div>
      <div style={{padding:22,display:"flex",flexDirection:"column",gap:14}}>
        {err&&<div style={{padding:"9px 12px",background:"var(--bad-bg)",color:"var(--bad)",border:"1px solid var(--bad-border)",borderRadius:"var(--r-sm)",fontSize:13}}>{err}</div>}
        <div><label style={{fontSize:12.5,fontWeight:600,color:"var(--ink-600)",marginBottom:5,display:"block"}}>ชื่อ-นามสกุล</label>
          <Field value={name} onChange={setName} placeholder="เช่น ชัยสิทธิ์ จันทร์"/></div>
        <div><label style={{fontSize:12.5,fontWeight:600,color:"var(--ink-600)",marginBottom:5,display:"block"}}>อีเมล</label>
          <Field value={email} onChange={setEmail} type="email" placeholder="name@psu.ac.th"/></div>
        <div><label style={{fontSize:12.5,fontWeight:600,color:"var(--ink-600)",marginBottom:5,display:"block"}}>รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</label>
          <Field value={pass} onChange={setPass} type="password" placeholder="••••••••"/></div>
        <div><label style={{fontSize:12.5,fontWeight:600,color:"var(--ink-600)",marginBottom:7,display:"block"}}>บทบาท</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[["admin","ผู้ดูแลระบบ","แก้ไขข้อมูลและจัดการผู้ใช้"],["viewer","ผู้ดูข้อมูล","ดูข้อมูลและออกรายงาน"]].map(([v,l,d])=>
              <button key={v} onClick={()=>setRole(v)} style={{padding:"11px 12px",borderRadius:"var(--r-sm)",cursor:"pointer",
                fontFamily:"var(--font)",textAlign:"left",transition:"all .15s",
                border:`1.5px solid ${role===v?"var(--brand-400)":"var(--border-strong)"}`,
                background:role===v?"var(--brand-50)":"var(--surface)"}}>
                <div style={{fontSize:13,fontWeight:600,color:role===v?"var(--brand-700)":"var(--ink-700)"}}>{l}</div>
                <div style={{fontSize:11.5,color:"var(--ink-500)",marginTop:2}}>{d}</div>
              </button>)}
          </div>
        </div>
      </div>
      <div style={{padding:"14px 22px",borderTop:"1px solid var(--border)",display:"flex",gap:8,justifyContent:"flex-end",background:"var(--surface-2)"}}>
        <Btn variant="ghost" onClick={onClose} disabled={busy}>ยกเลิก</Btn>
        <Btn variant="primary" icon={busy?null:"check"} onClick={submit} disabled={busy}>{busy?"กำลังสร้าง…":"สร้างบัญชี"}</Btn>
      </div>
    </div>
  </div>;
}

Object.assign(window,{WWAnalysis,WaterAnalysisTap,WaterAnalysisRo,ManageUsers,NewUserModal});
