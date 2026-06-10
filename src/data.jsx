// ── Constants ────────────────────────────────────────────────
const MN = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const MS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
// Default selected Thai fiscal year — keep matching the original repo
const CY = 2569;
// Fiscal year days helper — same formula as original repo
const getDays = (m) => new Date(m >= 7 ? 2025 : 2026, m + 1, 0).getDate();

// Lists from the original repo — keep IDs identical so Firestore docs are reused
const BLDG_END = ["อาคารโรงพยาบาล","อาคารเฉลิมพระบารมี (ส่วนหน้า)","อาคารเฉลิมพระบารมี (ส่วนหลัง)","อาคาร 100 ปี","อาคารรัตนชีวรักษ์ (สธ.)","อาคารศรีเวชวัฒน์"];
const SPOTS = {"อาคารโรงพยาบาล":"ห้องน้ำชั้น 12","อาคารเฉลิมพระบารมี (ส่วนหน้า)":"ห้องน้ำข้างเซเว่น","อาคารเฉลิมพระบารมี (ส่วนหลัง)":"ห้องล้างจาน","อาคาร 100 ปี":"ห้องน้ำชั้นล่าง","อาคารรัตนชีวรักษ์ (สธ.)":"ลานจอดรถ","อาคารศรีเวชวัฒน์":"ห้องน้ำชั้นล่าง"};
const BUILDINGS_WATER = ["อาคารโรงพยาบาล","อาคารเฉลิมพระบารมี (ส่วนหน้า)","อาคารเฉลิมพระบารมี (ส่วนหลัง)","อาคาร 100 ปี","อาคารรัตนชีวรักษ์ (สธ.)","อาคารศรีเวชวัฒน์","หอพักแพทย์"];

const PARAMS_RESEARCH = [
  {id:"ph",   label:"pH",       unit:"",     std:"5.5–9.0",  tanks:[{g:"EQ",ids:["EQ1","EQ2"]},{g:"Aeration",ids:["AE1","AE2","AE3","AE4"]},{g:"Effluent",ids:["EFF"]}]},
  {id:"tds",  label:"TDS",      unit:"mg/L", std:"≤1,000",   tanks:[{g:"EQ",ids:["EQ1","EQ2"]},{g:"Effluent",ids:["EFF"]}]},
  {id:"cl",   label:"คลอรีน",   unit:"mg/L", std:"≤1.0",     tanks:[{g:"Effluent",ids:["EFF"]}]},
  {id:"temp", label:"อุณหภูมิ", unit:"°C",   std:"—",        tanks:[{g:"EQ",ids:["EQ1","EQ2"]},{g:"Aeration",ids:["AE1","AE2","AE3","AE4"]},{g:"Effluent",ids:["EFF"]}]},
  {id:"sv30", label:"SV30",     unit:"ml/L", std:"—",        tanks:[{g:"Aeration",ids:["AE1","AE2","AE3","AE4"]}]},
  {id:"do",   label:"DO",       unit:"mg/L", std:"≥2.0",     tanks:[{g:"Aeration",ids:["AE1","AE2","AE3","AE4"]}]},
];
const PARAMS_STH = [
  {id:"ph",  label:"pH",     unit:"",     std:"5.5–9.0", tanks:[{g:"EQ",ids:["EQ"]},{g:"Aeration",ids:["AE"]},{g:"Effluent",ids:["EFF"]}]},
  {id:"tds", label:"TDS",    unit:"mg/L", std:"≤1,000",  tanks:[{g:"EQ",ids:["EQ"]},{g:"Effluent",ids:["EFF"]}]},
  {id:"cl",  label:"คลอรีน", unit:"mg/L", std:"≤1.0",    tanks:[{g:"Effluent",ids:["EFF"]}]},
  {id:"do",  label:"DO",     unit:"mg/L", std:"≥2.0",    tanks:[{g:"Aeration",ids:["AE"]}]},
];

const WW_ANALYSIS_PARAMS = [
  {id:"ph",      label:"ความเป็นกรด-ด่าง (pH)",        unit:"",           std:"5.5 – 9.0",   max:9,  min:5.5},
  {id:"bod",     label:"บีโอดี (BOD)",                  unit:"mg/L",       std:"≤ 20",        max:20},
  {id:"cod",     label:"ซีโอดี (COD)",                  unit:"mg/L",       std:"≤ 120",       max:120},
  {id:"ss",      label:"สารแขวนลอย (TSS)",             unit:"mg/L",       std:"≤ 30",        max:30},
  {id:"tds",     label:"ของแข็งละลายน้ำ (TDS)",        unit:"mg/L",       std:"≤ 1,000",     max:1000},
  {id:"tkn",     label:"ทีเคเอ็น (TKN)",                unit:"mg/L",       std:"≤ 35",        max:35},
  {id:"sulfide", label:"ซัลไฟด์ (Sulfide)",             unit:"mg/L",       std:"≤ 1.0",       max:1.0},
  {id:"oil",     label:"น้ำมันและไขมัน",                unit:"mg/L",       std:"≤ 20",        max:20},
  {id:"cl_free", label:"คลอรีนอิสระ",                   unit:"mg/L",       std:"≤ 1.0",       max:1.0},
  {id:"t_coli",  label:"Total Coliforms",               unit:"MPN/100mL",  std:"—"},
  {id:"f_coli",  label:"Fecal Coliforms",               unit:"MPN/100mL",  std:"—"},
];

const NAV = [
  {type:"item", id:"dashboard", label:"ภาพรวมระบบ", icon:"home"},
  {type:"section", label:"ระบบบำบัดน้ำเสีย"},
  {type:"group", label:"อาคารวิจัยฯ", items:[
    {id:"ww-research-daily",   label:"รายงานประจำวัน",   icon:"file"},
    {id:"ww-research-param",   label:"พารามิเตอร์น้ำเสีย", icon:"sliders"},
    {id:"ww-research-analysis",label:"ผลวิเคราะห์น้ำ",    icon:"flask"},
    {id:"ww-research-summary", label:"สรุปรายเดือน",      icon:"chart"},
  ]},
  {type:"group", label:"อาคารรัตนชีวรักษ์ (สธ.)", items:[
    {id:"ww-sth-daily",   label:"รายงานประจำวัน",   icon:"file"},
    {id:"ww-sth-param",   label:"พารามิเตอร์น้ำเสีย", icon:"sliders"},
    {id:"ww-sth-analysis",label:"ผลวิเคราะห์น้ำ",    icon:"flask"},
    {id:"ww-sth-summary", label:"สรุปรายเดือน",      icon:"chart"},
  ]},
  {type:"section", label:"ระบบประปา"},
  {type:"group", label:"ปริมาณการใช้น้ำ", items:[
    {id:"water-usage",     label:"การใช้น้ำประปา รพ.", icon:"droplet"},
    {id:"water-usage-sth", label:"การใช้น้ำประปา สธ.", icon:"droplet"},
  ]},
  {type:"item", id:"chlorine-start", label:"คลอรีนต้นทาง (รายวัน)",  icon:"beaker"},
  {type:"item", id:"chlorine-end",   label:"คลอรีนปลายทาง (รายสัปดาห์)", icon:"beaker"},
  {type:"item", id:"water-analysis", label:"ผลตรวจวิเคราะห์น้ำประปา", icon:"flask"},
  {type:"section", label:"ผู้ดูแลระบบ", admin:true},
  {type:"item", id:"manage-users",   label:"จัดการผู้ใช้", icon:"users", admin:true},
];

const PAGE_META = {
  "dashboard":{title:"ภาพรวมระบบ", crumb:["หน้าหลัก"]},
  "ww-research-daily":{title:"รายงานประจำวัน", crumb:["ระบบบำบัดน้ำเสีย","อาคารวิจัยฯ"]},
  "ww-research-param":{title:"พารามิเตอร์น้ำเสีย", crumb:["ระบบบำบัดน้ำเสีย","อาคารวิจัยฯ"]},
  "ww-research-analysis":{title:"ผลวิเคราะห์น้ำเสีย", crumb:["ระบบบำบัดน้ำเสีย","อาคารวิจัยฯ"]},
  "ww-research-summary":{title:"สรุปรายเดือน", crumb:["ระบบบำบัดน้ำเสีย","อาคารวิจัยฯ"]},
  "ww-sth-daily":{title:"รายงานประจำวัน", crumb:["ระบบบำบัดน้ำเสีย","อาคาร สธ."]},
  "ww-sth-param":{title:"พารามิเตอร์น้ำเสีย", crumb:["ระบบบำบัดน้ำเสีย","อาคาร สธ."]},
  "ww-sth-analysis":{title:"ผลวิเคราะห์น้ำเสีย", crumb:["ระบบบำบัดน้ำเสีย","อาคาร สธ."]},
  "ww-sth-summary":{title:"สรุปรายเดือน", crumb:["ระบบบำบัดน้ำเสีย","อาคาร สธ."]},
  "water-usage":{title:"การใช้น้ำประปา — โรงพยาบาล", crumb:["ระบบประปา","ปริมาณการใช้น้ำ"]},
  "water-usage-sth":{title:"การใช้น้ำประปา — อาคาร สธ.", crumb:["ระบบประปา","ปริมาณการใช้น้ำ"]},
  "chlorine-start":{title:"คลอรีนต้นทาง (รายวัน)", crumb:["ระบบประปา"]},
  "chlorine-end":{title:"คลอรีนปลายทาง (รายสัปดาห์)", crumb:["ระบบประปา"]},
  "water-analysis":{title:"ผลตรวจวิเคราะห์น้ำประปา", crumb:["ระบบประปา"]},
  "manage-users":{title:"จัดการผู้ใช้", crumb:["ผู้ดูแลระบบ"]},
};

Object.assign(window,{MN,MS,CY,getDays,BLDG_END,SPOTS,BUILDINGS_WATER,
  PARAMS_RESEARCH,PARAMS_STH,WW_ANALYSIS_PARAMS,NAV,PAGE_META});
