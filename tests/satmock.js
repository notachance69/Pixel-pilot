window.satellite=(function(){const R=Math.PI/180;
 function gst(d){const jd=d/864e5+2440587.5;return((((280.46061837+360.98564736629*(jd-2451545))%360)+360)%360)*R}
 return{twoline2satrec:()=>({}),gstime:gst,
  propagate:(s,d)=>{const t=d/60000,P=92.9,inc=51.6*R,u=2*Math.PI*t/P,Om=(-t*0.0035)%(2*Math.PI);const r=6371+420;
   const x=r*(Math.cos(Om)*Math.cos(u)-Math.sin(Om)*Math.sin(u)*Math.cos(inc)),y=r*(Math.sin(Om)*Math.cos(u)+Math.cos(Om)*Math.sin(u)*Math.cos(inc)),z=r*Math.sin(u)*Math.sin(inc);
   return{position:{x,y,z},velocity:{x:7.66,y:0,z:0}}},
  eciToGeodetic:(p,g)=>{const r=Math.hypot(p.x,p.y,p.z);let lon=Math.atan2(p.y,p.x)-g;lon=Math.atan2(Math.sin(lon),Math.cos(lon));return{latitude:Math.asin(p.z/r),longitude:lon,height:r-6371}},
  degreesLat:r=>r/R,degreesLong:r=>r/R}})();
