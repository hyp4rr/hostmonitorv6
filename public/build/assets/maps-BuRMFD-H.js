import{u as Z,a as V,b as X,r as l,j as t}from"./app-Bi1276fp.js";import{M as J,T as K,a as _}from"./monitor-layout-C2w6m2b6.js";import{L as d}from"./leaflet-DUpzZDIk.js";import{S as Y}from"./search-heTBELu4.js";import{c as $}from"./createLucideIcon-4p5FK-lq.js";import{S as ee}from"./server-DCQRRBFs.js";import"./app-dVD4YXJP.js";import"./x-_iMpUtna.js";import"./activity-xON8AFpi.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=[["polygon",{points:"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3",key:"1yg77f"}]],se=$("Filter",te);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ae=[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]],re=$("Layers",ae);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const le=[["polyline",{points:"15 3 21 3 21 9",key:"mznyad"}],["polyline",{points:"9 21 3 21 3 15",key:"1avn1i"}],["line",{x1:"21",x2:"14",y1:"3",y2:"10",key:"ota7mn"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]],ne=$("Maximize2",le);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ie=[["polyline",{points:"4 14 10 14 10 20",key:"11kfnr"}],["polyline",{points:"20 10 14 10 14 4",key:"rlmsce"}],["line",{x1:"14",x2:"21",y1:"10",y2:"3",key:"o5lafz"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]],oe=$("Minimize2",ie);function ke(){const{settings:de}=Z(),{t:c}=V(),{currentBranch:u}=X().props,g=new URLSearchParams(window.location.search),A=g.get("deviceId")?parseInt(g.get("deviceId")):null,h=g.get("lat")?parseFloat(g.get("lat")):null,f=g.get("lng")?parseFloat(g.get("lng")):null,r=l.useRef(null),C=l.useRef(null),b=l.useRef([]),j=l.useRef(null),y=l.useRef(null),[P,M]=l.useState(null),[o,F]=l.useState(!1),[w,U]=l.useState("street"),[ce,ue]=l.useState(!1),[N,G]=l.useState("all"),[L,D]=l.useState(""),[E,O]=l.useState(!1),[v,B]=l.useState([]),[z,T]=l.useState(!0);l.useEffect(()=>{u?.id&&(T(!0),fetch(`/api/locations?branch_id=${u.id}`,{credentials:"same-origin",headers:{Accept:"application/json"}}).then(e=>e.ok?e.json():[]).then(e=>{console.log("Loaded locations:",e),B(e)}).catch(e=>console.error("Error loading locations:",e)).finally(()=>T(!1)))},[u?.id]);const[k,W]=l.useState([]);l.useEffect(()=>{u?.id&&fetch(`/api/devices?branch_id=${u.id}&per_page=10000`,{credentials:"same-origin",headers:{Accept:"application/json"}}).then(e=>e.ok?e.json():{data:[]}).then(e=>{const s=e.data||e;W(s.filter(a=>a.status!=="offline_ack"))}).catch(e=>console.error("Error loading devices:",e))},[u?.id]);const I=new Map;k.forEach(e=>{if(e.latitude&&e.longitude){const s=`${e.latitude},${e.longitude}`,a=I.get(s)||[];I.set(s,[...a,e])}});const p=[];v.forEach(e=>{if(!e.latitude||!e.longitude)return;const s=k.filter(i=>i.location_id===e.id);let a="offline";if(s.length===0)a="offline";else{const i=s.filter(x=>x.status==="online").length;s.filter(x=>x.status==="offline"||x.status==="offline_ack").length===s.length?a="offline":i===s.length?a="online":a="warning"}const n=s.length>0?(s.reduce((i,S)=>i+(S.uptime_percentage||0),0)/s.length).toFixed(1):"0.0";p.push({lat:e.latitude,lng:e.longitude,name:e.name,status:a,count:s.length,devices:s.map(i=>i.name),category:e.description||"Location",ip:s[0]?.ip_address,uptime:`${n}%`})}),k.forEach(e=>{!e.location_id&&e.latitude&&e.longitude&&p.push({lat:e.latitude,lng:e.longitude,name:e.name,status:e.status==="online"?"online":e.status==="warning"?"warning":"offline",count:1,devices:[e.name],category:e.category.charAt(0).toUpperCase()+e.category.slice(1),ip:e.ip_address,uptime:`${e.uptime_percentage}%`})});const m=p.filter(e=>{const s=N==="all"||e.status===N,a=e.name.toLowerCase().includes(L.toLowerCase())||e.devices.some(n=>n.toLowerCase().includes(L.toLowerCase()));return s&&a}),q=(e,s)=>d.divIcon({className:"custom-marker",html:`
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
            `,iconSize:[24,24],iconAnchor:[12,12],popupAnchor:[0,-12]}),H=e=>{switch(e){case"online":return"#10b981";case"warning":return"#f59e0b";case"offline":return"#ef4444";default:return"#6b7280"}},R=e=>{switch(e){case"satellite":return{url:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",attribution:"&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"};case"dark":return{url:"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'};default:return{url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}}};l.useEffect(()=>{if(!C.current||r.current)return;const e=d.map(C.current,{center:[3.139,101.6869],zoom:15,zoomControl:!1,attributionControl:!0});d.control.zoom({position:"topright"}).addTo(e);const s=R(w),a=d.tileLayer(s.url,{attribution:s.attribution,maxZoom:19}).addTo(e);return j.current=a,d.control.scale({position:"bottomleft"}).addTo(e),r.current=e,()=>{r.current&&(r.current.remove(),r.current=null)}},[]),l.useEffect(()=>{if(!r.current)return;j.current&&j.current.remove();const e=R(w),s=d.tileLayer(e.url,{attribution:e.attribution,maxZoom:19}).addTo(r.current);j.current=s},[w]),l.useEffect(()=>{if(r.current&&(b.current.forEach(e=>e.remove()),b.current=[],!z)){if(m.forEach(e=>{const s=H(e.status),a=q(s,e.count),n=d.marker([e.lat,e.lng],{icon:a}).addTo(r.current).bindPopup(`
                    <div style="padding: 12px; min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <div style="width: 12px; height: 12px; background: ${s}; border-radius: 50%; box-shadow: 0 0 8px ${s};"></div>
                            <h3 style="margin: 0; font-weight: bold; color: #1e293b; font-size: 16px;">${e.name}</h3>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; margin: 12px 0; font-size: 12px;">
                            <span style="color: #64748b; font-weight: 500;">Category:</span>
                            <span style="color: #1e293b; font-weight: 600;">${e.category}</span>
                            
                            <span style="color: #64748b; font-weight: 500;">Status:</span>
                            <span style="color: ${s}; font-weight: 600; text-transform: capitalize;">${e.status}</span>
                            
                            <span style="color: #64748b; font-weight: 500;">Devices:</span>
                            <span style="color: #1e293b; font-weight: 600;">${e.count} device${e.count!==1?"s":""}</span>
                            
                            ${e.ip?`
                                <span style="color: #64748b; font-weight: 500;">Primary IP:</span>
                                <span style="color: #1e293b; font-weight: 600;">${e.ip}</span>
                            `:""}
                            
                            <span style="color: #64748b; font-weight: 500;">Avg Uptime:</span>
                            <span style="color: #10b981; font-weight: 600;">${e.uptime}</span>
                        </div>
                    </div>
                `,{maxWidth:300,className:"custom-popup"});n.on("click",()=>{M(e)}),n.on("mouseover",()=>{n.openPopup()}),b.current.push(n)}),m.length>0){const e=d.latLngBounds(m.map(s=>[s.lat,s.lng]));r.current.fitBounds(e,{padding:[50,50]})}else u?.id&&r.current.setView([3.139,101.6869],15);O(b.current.length>0)}},[N,L,z,v.length]),l.useEffect(()=>{const e=new URLSearchParams(window.location.search),s=e.get("location"),a=e.get("focusLocation");if(s&&a==="true"){const n=p.find(i=>i.name.toLowerCase().includes(s.toLowerCase()));n&&r.current&&(M(n),setTimeout(()=>{if(r.current){r.current.flyTo([n.lat,n.lng],17,{duration:2,easeLinearity:.25});const i=b.current.find(S=>{const x=S.getLatLng();return x.lat===n.lat&&x.lng===n.lng});i&&i.openPopup()}},500))}},[]),l.useEffect(()=>{if(console.log("Navigation params:",{navDeviceId:A,navLat:h,navLng:f,markersReady:E}),h&&f&&r.current&&E){y.current&&y.current.remove();const e=d.divIcon({className:"highlight-marker",html:`
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
                `,iconSize:[24,24],iconAnchor:[12,12]}),s=d.marker([h,f],{icon:e,zIndexOffset:1e3}).addTo(r.current);y.current=s,setTimeout(()=>{if(r.current){r.current.flyTo([h,f],18,{duration:1.5,easeLinearity:.25});const a=b.current.find(n=>{const i=n.getLatLng();return Math.abs(i.lat-h)<1e-4&&Math.abs(i.lng-f)<1e-4});a&&setTimeout(()=>{a.openPopup()},1e3)}},300),setTimeout(()=>{y.current&&(y.current.remove(),y.current=null)},5e3)}},[h,f,E]);const Q=()=>{F(!o),setTimeout(()=>{r.current&&r.current.invalidateSize()},100)};return t.jsxs(J,{title:c("maps.title"),children:[t.jsxs("div",{className:"space-y-6",children:[z&&t.jsx("div",{className:"rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-indigo-950/20",children:t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx("div",{className:"size-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"}),t.jsx("p",{className:"text-sm font-medium text-blue-900 dark:text-blue-100",children:"Loading locations from database..."})]})}),!z&&v.length===0&&t.jsx("div",{className:"rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20",children:t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx(K,{className:"size-5 text-amber-600 dark:text-amber-400"}),t.jsxs("div",{children:[t.jsx("p",{className:"text-sm font-semibold text-amber-900 dark:text-amber-100",children:"No Locations Found"}),t.jsx("p",{className:"text-sm text-amber-700 dark:text-amber-300",children:"Add locations in the Configuration page with latitude/longitude coordinates to display them on the map."})]})]})}),u?.id&&t.jsx("div",{className:"rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-indigo-950/20",children:t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx("div",{className:"rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg",children:t.jsx(_,{className:"size-5 text-white"})}),t.jsxs("div",{children:[t.jsxs("h3",{className:"text-lg font-bold text-blue-900 dark:text-blue-100",children:[u.name," - Network Map"]}),t.jsxs("p",{className:"text-sm text-blue-700 dark:text-blue-300",children:[v.length," location",v.length!==1?"s":""," •",p.length," marker",p.length!==1?"s":""," •",k.length," device",k.length!==1?"s":""]})]})]})}),!o&&t.jsx("div",{className:"flex items-center justify-between",children:t.jsxs("div",{children:[t.jsx("h1",{className:"bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-slate-300",children:c("maps.title")}),t.jsx("p",{className:"mt-2 text-sm text-slate-600 dark:text-slate-400",children:c("maps.subtitle")})]})}),!o&&t.jsxs("div",{className:"flex flex-wrap items-center gap-4 rounded-xl border border-slate-200/50 bg-white p-4 shadow-lg dark:border-slate-700/50 dark:bg-slate-800",children:[t.jsxs("div",{className:"relative flex-1 min-w-[200px]",children:[t.jsx(Y,{className:"absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"}),t.jsx("input",{type:"text",placeholder:c("maps.search"),value:L,onChange:e=>D(e.target.value),className:"w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"})]}),t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx(se,{className:"size-4 text-slate-600 dark:text-slate-400"}),t.jsxs("span",{className:"text-sm font-medium text-slate-700 dark:text-slate-300",children:[c("maps.filter"),":"]}),["all","online","warning","offline"].map(e=>t.jsx("button",{onClick:()=>G(e),className:`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${N===e?"bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md":"bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"}`,children:e.charAt(0).toUpperCase()+e.slice(1)},e))]}),t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx(re,{className:"size-4 text-slate-600 dark:text-slate-400"}),t.jsxs("span",{className:"text-sm font-medium text-slate-700 dark:text-slate-300",children:[c("maps.style"),":"]}),[{value:"street",label:c("maps.street")},{value:"satellite",label:c("maps.satellite")},{value:"dark",label:c("maps.dark")}].map(e=>t.jsx("button",{onClick:()=>U(e.value),className:`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${w===e.value?"bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md":"bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"}`,children:e.label},e.value))]})]}),t.jsxs("div",{className:`transition-all ${o?"fixed inset-0 z-50 bg-slate-900/95 p-4":"grid gap-6 lg:grid-cols-3"}`,children:[t.jsx("div",{className:`${o?"h-full":"lg:col-span-2"}`,children:t.jsxs("div",{className:`rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50/50 shadow-2xl backdrop-blur-sm dark:border-slate-700/50 dark:from-slate-800 dark:to-slate-900/50 ${o?"h-full":""}`,style:{height:o?"100%":"600px"},children:[t.jsxs("div",{className:"flex items-center justify-between border-b border-slate-200/50 p-4 dark:border-slate-700/50",children:[t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx("div",{className:"rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg",children:t.jsx(_,{className:"size-5 text-white"})}),t.jsxs("div",{children:[t.jsx("h2",{className:"text-lg font-bold text-slate-900 dark:text-white",children:"Network Topology"}),t.jsxs("p",{className:"text-xs text-slate-600 dark:text-slate-400",children:[m.length," location",m.length!==1?"s":""," • ",m.reduce((e,s)=>e+s.count,0)," devices"]})]})]}),t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsxs("div",{className:"flex gap-2",children:[t.jsxs("div",{className:"flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 dark:bg-emerald-900/30",children:[t.jsx("div",{className:"size-2 animate-pulse rounded-full bg-emerald-500"}),t.jsxs("span",{className:"text-xs font-medium text-emerald-700 dark:text-emerald-400",children:[p.filter(e=>e.status==="online").length," Online"]})]}),t.jsxs("div",{className:"flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 dark:bg-amber-900/30",children:[t.jsx("div",{className:"size-2 animate-pulse rounded-full bg-amber-500"}),t.jsxs("span",{className:"text-xs font-medium text-amber-700 dark:text-amber-400",children:[p.filter(e=>e.status==="warning").length," Warning"]})]}),t.jsxs("div",{className:"flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 dark:bg-red-900/30",children:[t.jsx("div",{className:"size-2 animate-pulse rounded-full bg-red-500"}),t.jsxs("span",{className:"text-xs font-medium text-red-700 dark:text-red-400",children:[p.filter(e=>e.status==="offline").length," Offline"]})]})]}),t.jsx("button",{onClick:Q,className:"rounded-lg bg-slate-100 p-2 transition-all hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600",title:o?"Exit Fullscreen":"Enter Fullscreen",children:o?t.jsx(oe,{className:"size-4"}):t.jsx(ne,{className:"size-4"})})]})]}),t.jsx("div",{ref:C,className:"relative overflow-hidden rounded-b-2xl",style:{height:o?"calc(100% - 73px)":"524px"}})]})}),!o&&t.jsx("div",{className:"space-y-4",children:t.jsxs("div",{className:"rounded-2xl border border-slate-200/50 bg-white shadow-lg dark:border-slate-700/50 dark:bg-slate-800",children:[t.jsx("div",{className:"border-b border-slate-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-slate-700/50 dark:from-blue-950/30 dark:to-indigo-950/30",children:t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx("div",{className:"rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg",children:t.jsx(_,{className:"size-4 text-white"})}),t.jsxs("div",{children:[t.jsx("h3",{className:"font-bold text-slate-900 dark:text-white",children:"Locations"}),t.jsx("p",{className:"text-xs text-slate-600 dark:text-slate-400",children:"Click to navigate"})]})]})}),t.jsx("div",{className:"max-h-[520px] divide-y divide-slate-200/50 overflow-y-auto dark:divide-slate-700/50",children:m.map((e,s)=>{const a=P?.name===e.name;return t.jsxs("div",{onClick:()=>{M(e),r.current&&r.current.flyTo([e.lat,e.lng],17,{duration:1.5,easeLinearity:.25})},className:`cursor-pointer p-4 transition-all ${a?"bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20":"hover:bg-slate-50 dark:hover:bg-slate-700/50"}`,children:[t.jsxs("div",{className:"flex items-start gap-3",children:[t.jsx("div",{className:`mt-1 size-3 animate-pulse rounded-full ${e.status==="online"?"bg-emerald-500 shadow-lg shadow-emerald-500/50":e.status==="warning"?"bg-amber-500 shadow-lg shadow-amber-500/50":"bg-red-500 shadow-lg shadow-red-500/50"}`}),t.jsxs("div",{className:"flex-1",children:[t.jsx("h4",{className:"font-bold text-slate-900 dark:text-white",children:e.name}),t.jsxs("div",{className:"mt-2 space-y-1 text-xs",children:[t.jsxs("p",{className:"flex items-center justify-between text-slate-600 dark:text-slate-400",children:[t.jsx("span",{children:"Category:"}),t.jsx("span",{className:"font-semibold",children:e.category})]}),t.jsxs("p",{className:"flex items-center justify-between text-slate-600 dark:text-slate-400",children:[t.jsx("span",{children:"Devices:"}),t.jsx("span",{className:"font-semibold",children:e.count})]}),t.jsxs("p",{className:"flex items-center justify-between text-slate-600 dark:text-slate-400",children:[t.jsx("span",{children:"Uptime:"}),t.jsx("span",{className:"font-semibold text-green-600 dark:text-green-400",children:e.uptime})]})]})]})]}),a&&t.jsx("div",{className:"mt-3 max-h-[280px] space-y-1 overflow-y-auto border-t border-slate-200/50 pt-3 dark:border-slate-700/50",children:e.devices.map((n,i)=>t.jsxs("div",{className:"flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-900",children:[t.jsx(ee,{className:"size-3 text-blue-600 dark:text-blue-400"}),t.jsx("span",{className:"font-medium text-slate-700 dark:text-slate-300",children:n})]},i))})]},s)})})]})})]})]}),t.jsx("style",{children:`
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
            `})]})}export{ke as default};
