import{M as i}from"./MapService-CBrZrlTV.js";import"./index-DVtLjEjI.js";class n{constructor(){this.map=null,this.marker=null}render(t){return`
      <section class="story-detail view-transition" aria-labelledby="story-heading">
        <h1 id="story-heading">${t.name}</h1>
        <img src="${t.photoUrl}" alt="${t.name}'s story" loading="lazy" class="story-image">
        <p class="story-description">${t.description}</p>
        <time datetime="${t.createdAt}">${new Date(t.createdAt).toLocaleDateString()}</time>
        <div id="story-map" style="height: 400px; width: 100%; border-radius: 8px; margin: 20px 0;"></div>
        <p id="story-address" aria-live="polite">Loading location...</p>
        <a href="#/stories" class="button secondary">Back to Stories</a>
      </section>
    `}renderStory(t){const e=document.getElementById("app");e&&(e.innerHTML=this.render(t))}async initMap(t,e){if(this.map=await i.initMap("story-map",{center:[e,t],zoom:14,interactive:!0}),!this.map)throw new Error("Map initialization failed")}async addMarker(t,e,a){this.marker=await i.addMarker(this.map,t,e,a)}async getAddress(t,e){return await i.getAddress(t,e)}updateAddress(t){const e=document.getElementById("story-address");e&&(e.textContent=t)}showMapError(t,e){const a=document.getElementById("story-map");a&&(a.innerHTML=`
        <div class="map-fallback">
          <p>Location: ${t.toFixed(4)}, ${e.toFixed(4)}</p>
        </div>
      `)}showError(t){const e=document.getElementById("app");e&&(e.innerHTML=`
        <div class="error-state">
          <h1>Failed to Load Story</h1>
          <p>${t}</p>
          <a href="#/stories" class="button">Back to Stories</a>
        </div>
      `)}}export{n as StoryDetailView};
