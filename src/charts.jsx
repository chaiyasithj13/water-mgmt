// ── Chart.js theming + reusable wrapper ──────────────────────
function brandColor(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim();}

function ChartBox({type,data,options,height=truthyDefault,style}){
  const ref=useRef(null), inst=useRef(null);
  useEffect(()=>{
    if(!ref.current) return;
    const ctx=ref.current.getContext("2d");
    if(inst.current) inst.current.destroy();
    inst.current=new Chart(ctx,{type,data,options});
    return ()=>{ if(inst.current){inst.current.destroy(); inst.current=null;} };
  });
  return <div style={{position:"relative",height,...style}}><canvas ref={ref}/></div>;
}
const truthyDefault=260;

const GRID="#eef2f7", AXIS="#94a0b3";
function baseOpts(extra={}){
  return {
    responsive:true, maintainAspectRatio:false,
    interaction:{mode:"index",intersect:false},
    plugins:{
      legend:{display:false},
      tooltip:{
        backgroundColor:"#0f1b2d",padding:11,cornerRadius:9,titleFont:{family:"Sarabun",size:12.5,weight:"600"},
        bodyFont:{family:"Sarabun",size:12.5},boxPadding:5,usePointStyle:true,borderColor:"rgba(255,255,255,.08)",borderWidth:1,
      },
    },
    scales:{
      x:{grid:{display:false,drawBorder:false},border:{display:false},
         ticks:{color:AXIS,font:{family:"Sarabun",size:11},maxRotation:0,autoSkipPadding:14}},
      y:{grid:{color:GRID,drawBorder:false},border:{display:false},
         ticks:{color:AXIS,font:{family:"Sarabun",size:11},padding:6},beginAtZero:true},
    },
    ...extra,
  };
}
function gradient(ctx,area,c1,c2){
  if(!area) return c1;
  const g=ctx.createLinearGradient(0,area.top,0,area.bottom);
  g.addColorStop(0,c1); g.addColorStop(1,c2); return g;
}
function areaDataset(label,data,color,fill1,fill2){
  return {label,data,borderColor:color,borderWidth:2.4,tension:.38,pointRadius:0,pointHoverRadius:5,
    pointHoverBackgroundColor:color,pointHoverBorderColor:"#fff",pointHoverBorderWidth:2,
    fill:true,backgroundColor:(c)=>gradient(c.chart.ctx,c.chart.chartArea,fill1,fill2)};
}
function barDataset(label,data,color){
  return {label,data,backgroundColor:color,borderRadius:5,borderSkipped:false,maxBarThickness:34,categoryPercentage:.7,barPercentage:.82};
}

Object.assign(window,{ChartBox,baseOpts,areaDataset,barDataset,gradient,brandColor});
