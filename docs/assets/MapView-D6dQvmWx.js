import{M as n}from"./MapService-CBrZrlTV.js";class h{constructor(){this.styleControl=null,this.map=null}async renderMap(t,e={}){const l=await n.initMap(t,e);return this.map=l,l?(e.interactive!==!1&&this.addStyleControl(l),l):(this.showMapError(t),null)}showMapError(t){const e=document.getElementById(t);e&&(e.innerHTML=`
        <div class="map-fallback" role="alert">
          Failed to load map. Please check your internet connection.
        </div>
      `)}addStyleControl(t){this.styleControl&&this.styleControl.parentNode&&this.styleControl.parentNode.removeChild(this.styleControl),this.styleControl=document.createElement("div"),this.styleControl.className="map-style-control",this.styleControl.setAttribute("aria-label","Map style selector");const e=document.createElement("div"),l=n.getAvailableMapStyles(),s=n.getCurrentStyle();e.innerHTML=`
      <fieldset>
        <legend>Map Style</legend>
        ${l.map(o=>`
          <label>
            <input type="radio" name="mapStyle" value="${o}" 
                  ${o===s?"checked":""}>
            ${o}
          </label>
        `).join("")}
      </fieldset>
    `,e.querySelectorAll("input").forEach(o=>{o.addEventListener("change",i=>{const p=i.target.value,y=n.setMapStyle(p);t.setStyle(y)})}),this.styleControl.appendChild(e);const a=t.getContainer().getBoundingClientRect();this.styleControl.style.position="absolute",this.styleControl.style.top=`${a.top+10}px`,this.styleControl.style.right=`${window.innerWidth-a.right+10}px`,this.styleControl.style.zIndex="1000",this.styleControl.style.background="white",this.styleControl.style.padding="10px",this.styleControl.style.borderRadius="8px",this.styleControl.style.boxShadow="0 2px 4px rgba(0,0,0,0.1)",document.body.appendChild(this.styleControl),t.on("remove",()=>{this.cleanupStyleControl()})}cleanupStyleControl(){this.styleControl&&this.styleControl.parentNode&&(this.styleControl.parentNode.removeChild(this.styleControl),this.styleControl=null)}createPopupContent(t){return`
      <div class="map-popup">
        ${t}
        <button class="popup-close" aria-label="Close popup">×</button>
      </div>
    `}async renderMarker(t,e,l,s=""){const r=s?this.createPopupContent(s):"";return await n.addMarker(t,e,l,r)}cleanupMap(){this.cleanupStyleControl(),this.map}}export{h as M};
