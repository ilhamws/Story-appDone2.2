import{M as o}from"./MapView-D6dQvmWx.js";import{M as r}from"./MapService-CBrZrlTV.js";import"./index-DVtLjEjI.js";class p{constructor(){this.app=document.querySelector("#app"),this.mapView=new o,this.markers=[],this.maps=new Map}showLoading(){this.app.innerHTML=`
      <div class="loading-state" role="alert" aria-busy="true">
        <div class="loading-spinner"></div>
        <p>Loading stories...</p>
      </div>
    `}showError(e){this.app.innerHTML=`
      <div class="error-state" role="alert">
        <h2>Error</h2>
        <p>${e}</p>
        <button class="button retry-button">Try Again</button>
      </div>
    `}render(e=[]){if(e.length===0){this.app.innerHTML=`
        <div class="empty-state">
          <h2>No Stories Found</h2>
          <p>Be the first to share your story!</p>
          <a href="#/add-story" class="button">Add Story</a>
        </div>
      `;return}this.app.innerHTML=`
      <div id="stories" class="stories-container">
        <h1>Stories</h1>
        <div class="stories-grid">
          ${e.map(t=>this.createStoryCard(t)).join("")}
        </div>
      </div>
      <div class="stories-location-container">
        <h2>Stories Location</h2>
        <div id="stories-map" class="stories-map"></div>
      </div>
    `,this.setupEventListeners(),this.initializeMaps(e)}createStoryCard(e){return`
      <article class="story-card">
        <div class="story-image-container">
          <img src="${e.photoUrl}" alt="${e.description}" class="story-image">
        </div>
        ${e.lat&&e.lon?`
          <div class="story-map-container">
            <div id="map-${e.id}" class="story-map"></div>
            <p id="address-${e.id}" class="story-address" aria-live="polite">Loading location...</p>
          </div>
        `:""}
        <div class="story-content">
          <h2>${e.name}</h2>
          <p>${e.description}</p>
          <div class="story-meta">
            <span class="story-date">${new Date(e.createdAt).toLocaleDateString()}</span>
            <a href="#/stories/${e.id}" class="button story-detail-button">View Detail</a>
          </div>
        </div>
      </article>
    `}async initializeMaps(e){try{const t=await r.initMap("stories-map",{center:[106.8456,-6.2088],zoom:10,interactive:!0});t&&e.forEach(a=>{a.lat&&a.lon&&r.addMarker(t,a.lat,a.lon,a.name)})}catch(t){console.error("Failed to initialize main map:",t),this.showMapError("stories-map")}for(const t of e)if(t.lat&&t.lon)try{if(document.getElementById(`map-${t.id}`)){const i=await r.initSmallMap(`map-${t.id}`,{center:[t.lon,t.lat],zoom:14,interactive:!1});if(i){await r.addMarker(i,t.lat,t.lon,t.name),this.maps.set(t.id,i);try{const s=await r.getAddress(t.lat,t.lon);this.updateAddress(t.id,s)}catch(s){console.error(`Failed to get address for story ${t.id}:`,s),this.updateAddress(t.id,`Location: ${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`)}}}}catch(a){console.error(`Failed to load map for story ${t.id}:`,a),this.showMapError(`map-${t.id}`,t.lat,t.lon)}}updateAddress(e,t){const a=document.getElementById(`address-${e}`);a&&(a.textContent=t)}showMapError(e,t,a){const i=document.getElementById(e);i&&(i.innerHTML=`
        <div class="map-fallback">
          ${t&&a?`<p>Location: ${t.toFixed(4)}, ${a.toFixed(4)}</p>`:"<p>Failed to load map</p>"}
        </div>
      `)}setupEventListeners(){this.app.querySelectorAll(".story-detail-button").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault();const i=t.getAttribute("href");window.location.hash=i})})}onRetry(e){const t=this.app.querySelector(".retry-button");t&&t.addEventListener("click",e)}cleanup(){this.maps.forEach(e=>{e&&e.remove()}),this.maps.clear()}}export{p as StoryView};
