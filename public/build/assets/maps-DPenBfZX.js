import{u as ae,a as re,b as ie,r as n,j as t}from"./app-so_3s6IB.js";import{M as ne,T as le,a as A}from"./monitor-layout-BRXoWMc2.js";import{L as m}from"./leaflet-tMCuh-HN.js";import{S as oe}from"./search-DCB1nR6r.js";import{c as R}from"./createLucideIcon-yWkQp2xk.js";import{L as de}from"./layers-BZ_p3hws.js";import{S as ce}from"./server-BmtO3NRX.js";import"./app-C4xCnywQ.js";import"./x-D9l108OW.js";import"./activity-C72jcQKz.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pe=[["polygon",{points:"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3",key:"1yg77f"}]],ue=R("Filter",pe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me=[["polyline",{points:"15 3 21 3 21 9",key:"mznyad"}],["polyline",{points:"9 21 3 21 3 15",key:"1avn1i"}],["line",{x1:"21",x2:"14",y1:"3",y2:"10",key:"ota7mn"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]],xe=R("Maximize2",me);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ge=[["polyline",{points:"4 14 10 14 10 20",key:"11kfnr"}],["polyline",{points:"20 10 14 10 14 4",key:"rlmsce"}],["line",{x1:"14",x2:"21",y1:"10",y2:"3",key:"o5lafz"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]],fe=R("Minimize2",ge);function Ce(){const{settings:he}=ae(),{t:x}=re(),{currentBranch:c}=ie().props,k=new URLSearchParams(window.location.search),Q=k.get("deviceId")?parseInt(k.get("deviceId")):null,w=k.get("lat")?parseFloat(k.get("lat")):null,j=k.get("lng")?parseFloat(k.get("lng")):null,o=n.useRef(null),E=n.useRef(null),N=n.useRef([]),z=n.useRef(null),L=n.useRef(null),[Z,F]=n.useState(null),[p,V]=n.useState(!1),[$,X]=n.useState("street"),[be,ve]=n.useState(!1),[_,q]=n.useState("all"),[M,J]=n.useState(""),[P,K]=n.useState(!1),[b,Y]=n.useState([]),[C,D]=n.useState(!0),[ye,U]=n.useState(!1),[O,G]=n.useState([]);n.useEffect(()=>{if(!c?.id)return;D(!0);const s=String(c.id)==="all"?"/api/locations":`/api/locations?branch_id=${c.id}`;fetch(s,{credentials:"same-origin",headers:{Accept:"application/json"}}).then(a=>a.ok?a.json():[]).then(a=>{console.log("Loaded locations:",a),Y(a)}).catch(a=>console.error("Error loading locations:",a)).finally(()=>D(!1))},[c?.id]),n.useEffect(()=>{if(!c?.id)return;const e=new URLSearchParams,s=String(c.id);s!=="all"&&e.set("branch_id",s);const a=e.toString()?`/api/floors?${e.toString()}`:"/api/floors";fetch(a,{credentials:"same-origin",headers:{Accept:"application/json"}}).then(r=>r.ok?r.json():[]).then(G).catch(r=>{console.error("Error loading floors:",r),G([])})},[c?.id]);const[g,B]=n.useState([]);n.useEffect(()=>{if(!c?.id)return;U(!0);const s=String(c.id)==="all"?"/api/devices?per_page=2000&include_inactive=true":`/api/devices?branch_id=${c.id}&per_page=2000&include_inactive=true`;fetch(s,{credentials:"same-origin",headers:{Accept:"application/json"},cache:"no-cache"}).then(a=>a.ok?a.json():{data:[]}).then(a=>{const r=a.data||a;console.log("Maps: Loaded devices:",r.length,"Sample device:",r[0]);const l=r.filter(u=>u.is_active!==!1&&u.latitude&&u.longitude);console.log("Maps: Active devices with coordinates:",l.length),B(l)}).catch(a=>{console.error("Error loading devices:",a),B([])}).finally(()=>U(!1))},[c?.id]);const W=new Map;g.forEach(e=>{if(e.latitude&&e.longitude){const s=`${e.latitude},${e.longitude}`,a=W.get(s)||[];W.set(s,[...a,e])}});const f=n.useMemo(()=>{const e=[];return b.forEach(s=>{if(!s.latitude||!s.longitude)return;const a=g.filter(d=>d.location_id===s.id);let r="offline";if(a.length===0)r="offline";else{const d=a.filter(i=>i.status!=="offline_ack"),v=d.filter(i=>i.status==="online").length,I=d.filter(i=>i.status==="offline").length,S=d.filter(i=>i.status==="warning").length;d.length===0||I===d.length?r="offline":v===d.length?r="online":S>0||v>0&&I>0?r="warning":r="online"}const l=a.filter(d=>d.status!=="offline_ack"),u=l.length>0?(l.reduce((d,v)=>d+(v.uptime_percentage||0),0)/l.length).toFixed(1):"0.0";e.push({lat:s.latitude,lng:s.longitude,name:s.name,status:r,count:a.length,devices:a.map(d=>d.name),category:s.description||"Location",ip:a[0]?.ip_address,uptime:`${u}%`})}),g.forEach(s=>{if(!s.location_id&&s.latitude&&s.longitude){let a="offline";s.status==="online"?a="online":s.status==="warning"?a="warning":(s.status==="offline_ack"||s.status==="offline")&&(a="offline"),e.push({lat:s.latitude,lng:s.longitude,name:s.name,status:a,count:1,devices:[s.name],category:s.category?s.category.charAt(0).toUpperCase()+s.category.slice(1):"Device",ip:s.ip_address,uptime:`${s.uptime_percentage||0}%`})}}),e},[b,g]),h=n.useMemo(()=>f.filter(e=>{const s=_==="all"||e.status===_,a=e.name.toLowerCase().includes(M.toLowerCase())||e.devices.some(r=>r.toLowerCase().includes(M.toLowerCase()));return s&&a}),[f,_,M]),ee=(e,s)=>m.divIcon({className:"custom-marker",html:`
                <div style="position: relative;">
                    <!-- Outer pulse ring -->
                    <div style="
                        position: absolute;
                        width: 40px;
                        height: 40px;
                        left: -8px;
                        top: -8px;
                        background: ${e};
                        border-radius: 50%;
                        opacity: 0;
                        animation: pulse 2s ease-out infinite;
                    "></div>
                    
                    <!-- Main marker -->
                    <div style="
                        width: 24px;
                        height: 24px;
                        background: ${e};
                        border: 3px solid white;
                        border-radius: 50%;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        position: relative;
                        z-index: 1;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    "></div>
                    
                    <!-- Count badge -->
                    <div style="
                        position: absolute;
                        top: -8px;
                        right: -8px;
                        background: white;
                        border: 2px solid ${e};
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                        font-weight: bold;
                        color: #1e293b;
                        z-index: 2;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                    ">${s}</div>
                    
                    <style>
                        @keyframes pulse {
                            0% {
                                transform: scale(0.5);
                                opacity: 0.8;
                            }
                            100% {
                                transform: scale(1.5);
                                opacity: 0;
                            }
                        }
                    </style>
                </div>
            `,iconSize:[24,24],iconAnchor:[12,12],popupAnchor:[0,-12]}),te=e=>{switch(e){case"online":return"#10b981";case"warning":return"#f59e0b";case"offline":return"#ef4444";default:return"#6b7280"}},H=e=>{switch(e){case"satellite":return{url:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",attribution:"&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"};case"dark":return{url:"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'};default:return{url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}}};n.useEffect(()=>{if(!E.current||o.current)return;const e=m.map(E.current,{center:[3.139,101.6869],zoom:15,zoomControl:!1,attributionControl:!0});m.control.zoom({position:"topright"}).addTo(e);const s=H($),a=m.tileLayer(s.url,{attribution:s.attribution,maxZoom:19}).addTo(e);return z.current=a,m.control.scale({position:"bottomleft"}).addTo(e),o.current=e,()=>{o.current&&(o.current.remove(),o.current=null)}},[]),n.useEffect(()=>{if(!o.current)return;z.current&&z.current.remove();const e=H($),s=m.tileLayer(e.url,{attribution:e.attribution,maxZoom:19}).addTo(o.current);z.current=s},[$]),n.useEffect(()=>{if(o.current&&(N.current.forEach(e=>e.remove()),N.current=[],!C)){if(h.forEach(e=>{const s=te(e.status),a=ee(s,e.count),r=b.find(i=>Math.abs(i.latitude-e.lat)<1e-4&&Math.abs(i.longitude-e.lng)<1e-4),l=r?g.filter(i=>i.location_id===r.id):g.filter(i=>!i.location_id&&i.latitude&&i.longitude&&Math.abs(i.latitude-e.lat)<1e-4&&Math.abs(i.longitude-e.lng)<1e-4);let u=null,d=!1;if(r){const i=O.filter(y=>y.location_id===r.id);i.length>0&&(d=!0,i.sort((y,T)=>(y.level??0)-(T.level??0)),u=i[0].id)}const v=l.length===1?l[0].id:null,I=l.length>0?l.slice(0,5).map(i=>{const y=i.status==="online"?"#10b981":i.status==="warning"?"#f59e0b":"#ef4444",T=i.status==="online"?"Online":i.status==="warning"?"Warning":i.status==="offline_ack"?"Acknowledged":"Offline";return`
                        <div style="display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid #e2e8f0;">
                            <div style="width: 10px; height: 10px; background: ${y}; border-radius: 50%; box-shadow: 0 0 4px ${y};"></div>
                            <span style="font-weight: 500; color: #1e293b; flex: 1;">${i.name||"Unknown"}</span>
                            <span style="font-size: 10px; color: ${y}; font-weight: 600; text-transform: capitalize;">${T}</span>
                        </div>
                    `}).join("")+(l.length>5?`<div style="padding: 6px 0; color: #64748b; font-size: 11px; font-weight: 500;">+${l.length-5} more device${l.length-5!==1?"s":""}</div>`:""):'<div style="color: #64748b; font-size: 12px; padding: 8px 0;">No devices assigned to this location</div>',S=m.marker([e.lat,e.lng],{icon:a}).addTo(o.current).bindPopup(`
                    <div style="padding: 14px; min-width: 280px; max-width: 340px; font-family: system-ui, -apple-system, sans-serif;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0;">
                            <div style="width: 14px; height: 14px; background: ${s}; border-radius: 50%; box-shadow: 0 0 10px ${s};"></div>
                            <h3 style="margin: 0; font-weight: bold; color: #1e293b; font-size: 17px;">${e.name}</h3>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 14px; margin-bottom: 12px; font-size: 12px;">
                            <span style="color: #64748b; font-weight: 500;">Status:</span>
                            <span style="color: ${s}; font-weight: 600; text-transform: capitalize; font-size: 13px;">${e.status}</span>
                            
                            <span style="color: #64748b; font-weight: 500;">Devices:</span>
                            <span style="color: #1e293b; font-weight: 600;">${e.count} device${e.count!==1?"s":""}</span>
                            
                            <span style="color: #64748b; font-weight: 500;">Avg Uptime:</span>
                            <span style="color: #10b981; font-weight: 600; font-size: 13px;">${e.uptime}</span>
                            
                            ${e.ip?`
                                <span style="color: #64748b; font-weight: 500;">Primary IP:</span>
                                <span style="color: #1e293b; font-weight: 600; font-family: monospace; font-size: 11px;">${e.ip}</span>
                            `:""}
                        </div>
                        
                        ${l.length>0?`
                            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
                                <div style="font-weight: 600; color: #1e293b; margin-bottom: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Device List</div>
                                <div style="max-height: 200px; overflow-y: auto; font-size: 12px;">
                                    ${I}
                                </div>
                            </div>
                        `:""}

                        ${r?`
                            <div style="margin-top: 14px;">
                                <a href="/monitor/plan?location_id=${r.id}${u?`&floor_id=${u}`:""}${v?`&deviceId=${v}`:""}" 
                                   style="display:inline-flex;align-items:center;gap:8px;background:#3b82f6;color:white;padding:8px 12px;border-radius:8px;text-decoration:none;font-weight:600;">
                                    <span>${d?"Open Floor Plan":"Manage Floors"}</span>
                                </a>
                            </div>
                        `:""}
                    </div>
                `,{maxWidth:360,className:"custom-popup"});S.on("click",()=>{F(e)}),S.on("mouseover",()=>{S.openPopup()}),N.current.push(S)}),h.length>0){const e=m.latLngBounds(h.map(s=>[s.lat,s.lng]));o.current.fitBounds(e,{padding:[50,50]})}else c?.id&&o.current.setView([3.139,101.6869],15);K(N.current.length>0)}},[h,C,g,b,O]),n.useEffect(()=>{const e=new URLSearchParams(window.location.search),s=e.get("location"),a=e.get("focusLocation");if(s&&a==="true"){const r=f.find(l=>l.name.toLowerCase().includes(s.toLowerCase()));r&&o.current&&(F(r),setTimeout(()=>{if(o.current){o.current.flyTo([r.lat,r.lng],17,{duration:2,easeLinearity:.25});const l=N.current.find(u=>{const d=u.getLatLng();return d.lat===r.lat&&d.lng===r.lng});l&&l.openPopup()}},500))}},[]),n.useEffect(()=>{if(console.log("Navigation params:",{navDeviceId:Q,navLat:w,navLng:j,markersReady:P}),w&&j&&o.current&&P){L.current&&L.current.remove();const e=m.divIcon({className:"highlight-marker",html:`
                    <div style="position: relative;">
                        <div style="
                            position: absolute;
                            width: 60px;
                            height: 60px;
                            left: -18px;
                            top: -18px;
                            background: #3b82f6;
                            border-radius: 50%;
                            opacity: 0;
                            animation: highlight-pulse 1.5s ease-out infinite;
                        "></div>
                        <div style="
                            width: 24px;
                            height: 24px;
                            background: #3b82f6;
                            border: 4px solid white;
                            border-radius: 50%;
                            box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 4px 12px rgba(0,0,0,0.3);
                            position: relative;
                            z-index: 1000;
                        "></div>
                        <style>
                            @keyframes highlight-pulse {
                                0% {
                                    transform: scale(0.3);
                                    opacity: 1;
                                }
                                100% {
                                    transform: scale(2);
                                    opacity: 0;
                                }
                            }
                        </style>
                    </div>
                `,iconSize:[24,24],iconAnchor:[12,12]}),s=m.marker([w,j],{icon:e,zIndexOffset:1e3}).addTo(o.current);L.current=s,setTimeout(()=>{if(o.current){o.current.flyTo([w,j],18,{duration:1.5,easeLinearity:.25});const a=N.current.find(r=>{const l=r.getLatLng();return Math.abs(l.lat-w)<1e-4&&Math.abs(l.lng-j)<1e-4});a&&setTimeout(()=>{a.openPopup()},1e3)}},300),setTimeout(()=>{L.current&&(L.current.remove(),L.current=null)},5e3)}},[w,j,P]);const se=()=>{V(!p),setTimeout(()=>{o.current&&o.current.invalidateSize()},100)};return t.jsxs(ne,{title:x("maps.title"),children:[t.jsxs("div",{className:"space-y-6",children:[C&&t.jsx("div",{className:"rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-indigo-950/20",children:t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx("div",{className:"size-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"}),t.jsx("p",{className:"text-sm font-medium text-blue-900 dark:text-blue-100",children:"Loading locations from database..."})]})}),!C&&b.length===0&&t.jsx("div",{className:"rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20",children:t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx(le,{className:"size-5 text-amber-600 dark:text-amber-400"}),t.jsxs("div",{children:[t.jsx("p",{className:"text-sm font-semibold text-amber-900 dark:text-amber-100",children:"No Locations Found"}),t.jsx("p",{className:"text-sm text-amber-700 dark:text-amber-300",children:"Add locations in the Configuration page with latitude/longitude coordinates to display them on the map."})]})]})}),c?.id&&t.jsx("div",{className:"rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-indigo-950/20",children:t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx("div",{className:"rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg",children:t.jsx(A,{className:"size-5 text-white"})}),t.jsxs("div",{children:[t.jsxs("h3",{className:"text-lg font-bold text-blue-900 dark:text-blue-100",children:[c.id==="all"?"All Branches":c.name," - Network Map"]}),t.jsxs("p",{className:"text-sm text-blue-700 dark:text-blue-300",children:[b.length," location",b.length!==1?"s":""," •",f.length," marker",f.length!==1?"s":""," •",g.length," device",g.length!==1?"s":""]})]})]})}),!p&&t.jsx("div",{className:"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",children:t.jsxs("div",{children:[t.jsx("h1",{className:"bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl sm:text-3xl font-bold text-transparent dark:from-white dark:to-slate-300",children:x("maps.title")}),t.jsx("p",{className:"mt-2 text-sm text-slate-600 dark:text-slate-400",children:x("maps.subtitle")})]})}),!p&&t.jsxs("div",{className:"flex flex-wrap items-center gap-4 rounded-xl border border-slate-200/50 bg-white p-4 shadow-lg dark:border-slate-700/50 dark:bg-slate-800",children:[t.jsxs("div",{className:"relative flex-1 min-w-[200px]",children:[t.jsx(oe,{className:"absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"}),t.jsx("input",{type:"text",placeholder:x("maps.search"),value:M,onChange:e=>J(e.target.value),className:"w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"})]}),t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx(ue,{className:"size-4 text-slate-600 dark:text-slate-400"}),t.jsxs("span",{className:"text-sm font-medium text-slate-700 dark:text-slate-300",children:[x("maps.filter"),":"]}),["all","online","warning","offline"].map(e=>t.jsx("button",{onClick:()=>q(e),className:`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${_===e?"bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md":"bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"}`,children:e.charAt(0).toUpperCase()+e.slice(1)},e))]}),t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx(de,{className:"size-4 text-slate-600 dark:text-slate-400"}),t.jsxs("span",{className:"text-sm font-medium text-slate-700 dark:text-slate-300",children:[x("maps.style"),":"]}),[{value:"street",label:x("maps.street")},{value:"satellite",label:x("maps.satellite")},{value:"dark",label:x("maps.dark")}].map(e=>t.jsx("button",{onClick:()=>X(e.value),className:`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${$===e.value?"bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md":"bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"}`,children:e.label},e.value))]})]}),t.jsxs("div",{className:`transition-all ${p?"fixed inset-0 z-50 bg-slate-900/95 p-4":"grid gap-6 lg:grid-cols-3"}`,children:[t.jsx("div",{className:`${p?"h-full":"lg:col-span-2"}`,children:t.jsxs("div",{className:`rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50/50 shadow-2xl backdrop-blur-sm dark:border-slate-700/50 dark:from-slate-800 dark:to-slate-900/50 ${p?"h-full":""}`,style:{height:p?"100%":"650px"},children:[t.jsxs("div",{className:"flex items-center justify-between border-b border-slate-200/50 p-4 dark:border-slate-700/50",children:[t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx("div",{className:"rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg",children:t.jsx(A,{className:"size-5 text-white"})}),t.jsxs("div",{children:[t.jsx("h2",{className:"text-lg font-bold text-slate-900 dark:text-white",children:"Network Topology"}),t.jsxs("p",{className:"text-xs text-slate-600 dark:text-slate-400",children:[h.length," location",h.length!==1?"s":""," • ",h.reduce((e,s)=>e+s.count,0)," devices"]})]})]}),t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsxs("div",{className:"flex gap-2",children:[t.jsxs("div",{className:"flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 dark:bg-emerald-900/30",children:[t.jsx("div",{className:"size-2 animate-pulse rounded-full bg-emerald-500"}),t.jsxs("span",{className:"text-xs font-medium text-emerald-700 dark:text-emerald-400",children:[f.filter(e=>e.status==="online").length," Online"]})]}),t.jsxs("div",{className:"flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 dark:bg-amber-900/30",children:[t.jsx("div",{className:"size-2 animate-pulse rounded-full bg-amber-500"}),t.jsxs("span",{className:"text-xs font-medium text-amber-700 dark:text-amber-400",children:[f.filter(e=>e.status==="warning").length," Warning"]})]}),t.jsxs("div",{className:"flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 dark:bg-red-900/30",children:[t.jsx("div",{className:"size-2 animate-pulse rounded-full bg-red-500"}),t.jsxs("span",{className:"text-xs font-medium text-red-700 dark:text-red-400",children:[f.filter(e=>e.status==="offline").length," Offline"]})]})]}),t.jsx("button",{onClick:se,className:"rounded-lg bg-slate-100 p-2 transition-all hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600",title:p?"Exit Fullscreen":"Enter Fullscreen",children:p?t.jsx(fe,{className:"size-4"}):t.jsx(xe,{className:"size-4"})})]})]}),t.jsx("div",{ref:E,className:"relative overflow-hidden rounded-b-2xl",style:{height:p?"calc(100% - 73px)":"624px"}})]})}),!p&&t.jsx("div",{className:"space-y-4",children:t.jsxs("div",{className:"rounded-2xl border border-slate-200/50 bg-white shadow-lg dark:border-slate-700/50 dark:bg-slate-800",children:[t.jsx("div",{className:"border-b border-slate-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-slate-700/50 dark:from-blue-950/30 dark:to-indigo-950/30",children:t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx("div",{className:"rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg",children:t.jsx(A,{className:"size-4 text-white"})}),t.jsxs("div",{children:[t.jsx("h3",{className:"font-bold text-slate-900 dark:text-white",children:"Locations"}),t.jsx("p",{className:"text-xs text-slate-600 dark:text-slate-400",children:"Click to navigate"})]})]})}),t.jsx("div",{className:"max-h-[520px] divide-y divide-slate-200/50 overflow-y-auto dark:divide-slate-700/50",children:h.map((e,s)=>{const a=Z?.name===e.name;return t.jsxs("div",{onClick:()=>{F(e),o.current&&o.current.flyTo([e.lat,e.lng],17,{duration:1.5,easeLinearity:.25})},className:`cursor-pointer p-4 transition-all ${a?"bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20":"hover:bg-slate-50 dark:hover:bg-slate-700/50"}`,children:[t.jsxs("div",{className:"flex items-start gap-3",children:[t.jsx("div",{className:`mt-1 size-3 animate-pulse rounded-full ${e.status==="online"?"bg-emerald-500 shadow-lg shadow-emerald-500/50":e.status==="warning"?"bg-amber-500 shadow-lg shadow-amber-500/50":"bg-red-500 shadow-lg shadow-red-500/50"}`}),t.jsxs("div",{className:"flex-1",children:[t.jsx("h4",{className:"font-bold text-slate-900 dark:text-white",children:e.name}),t.jsxs("div",{className:"mt-2 space-y-1 text-xs",children:[t.jsxs("p",{className:"flex items-center justify-between text-slate-600 dark:text-slate-400",children:[t.jsx("span",{children:"Category:"}),t.jsx("span",{className:"font-semibold",children:e.category})]}),t.jsxs("p",{className:"flex items-center justify-between text-slate-600 dark:text-slate-400",children:[t.jsx("span",{children:"Devices:"}),t.jsx("span",{className:"font-semibold",children:e.count})]}),t.jsxs("p",{className:"flex items-center justify-between text-slate-600 dark:text-slate-400",children:[t.jsx("span",{children:"Uptime:"}),t.jsx("span",{className:"font-semibold text-green-600 dark:text-green-400",children:e.uptime})]})]})]})]}),a&&t.jsx("div",{className:"mt-3 max-h-[280px] space-y-1 overflow-y-auto border-t border-slate-200/50 pt-3 dark:border-slate-700/50",children:e.devices.map((r,l)=>t.jsxs("div",{className:"flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-900",children:[t.jsx(ce,{className:"size-3 text-blue-600 dark:text-blue-400"}),t.jsx("span",{className:"font-medium text-slate-700 dark:text-slate-300",children:r})]},l))})]},s)})})]})})]})]}),t.jsx("style",{children:`
                .custom-popup .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(148, 163, 184, 0.2);
                }
                .custom-popup .leaflet-popup-tip {
                    display: none;
                }
                .leaflet-container {
                    font-family: system-ui, -apple-system, sans-serif;
                }
            `})]})}export{Ce as default};
