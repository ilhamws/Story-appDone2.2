import{M as l}from"./MapService-CBrZrlTV.js";import{M as m}from"./MapView-D6dQvmWx.js";import"./index-DVtLjEjI.js";class y{constructor(){this.map=null,this.marker=null,this.cameraStream=null,this.mapView=new m}render(){return`
      <section class="add-story view-transition" aria-labelledby="add-story-heading">
        <h1 id="add-story-heading">Add New Story</h1>
        
        <form id="add-story-form" class="add-story-form" enctype="multipart/form-data">
          <div class="form-group">
            <label for="story-description">Description</label>
            <textarea id="story-description" name="description" required minlength="10" maxlength="1000" aria-describedby="description-help"></textarea>
            <small id="description-help" class="text-muted">Enter a description between 10 and 1000 characters.</small>
          </div>
          
          <div class="form-group">
            <label for="photo">Upload Photo (max 1MB)</label>
            <input type="file" id="photo" name="photo" accept="image/jpeg,image/png" aria-describedby="photo-help">
            <small id="photo-help" class="text-muted">Only JPEG or PNG, max size 1MB.</small>
            <div id="photo-preview-container" class="photo-preview">
              <img id="photo-preview" style="display: none;" alt="Photo preview">
            </div>
            <button type="button" id="use-camera" class="button secondary" aria-label="Open camera">
              <i class="fas fa-camera"></i> Use Camera
            </button>
          </div>
          
          <div class="form-group">
            <label>Location (click on map to select)</label>
            <div id="add-story-map" style="height: 400px; width: 100%; border-radius: 8px; margin-bottom: 20px;"></div>
            <p id="location-info" aria-live="polite">No location selected</p>
            <input type="hidden" id="lat" name="lat">
            <input type="hidden" id="lon" name="lon">
          </div>
          
          <button type="submit" class="button">Submit Story</button>
        </form>
      </section>
      
      <div id="camera-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <video id="camera-feed" autoplay playsinline></video>
          <div class="flex gap-4">
            <button id="capture-photo" class="button">
              <i class="fas fa-camera"></i> Capture
            </button>
            <button id="close-camera" class="button secondary">
              <i class="fas fa-times"></i> Close
            </button>
          </div>
          <canvas id="photo-canvas" style="display: none;"></canvas>
        </div>
      </div>
    `}async init(){try{if(this.map=await this.mapView.renderMap("add-story-map",{center:[106.8456,-6.2088],zoom:12,interactive:!0}),!this.map)throw new Error("Map initialization failed")}catch(t){throw console.error("Map initialization failed:",t),this.showMapError(),t}}async getAddress(t,e){return await l.getAddress(t,e)}setupEventListeners(t,e,a,o){const i=document.getElementById("add-story-form");i&&i.addEventListener("submit",r=>{r.preventDefault();const d=new FormData(i);t(d)});const n=document.getElementById("photo");n&&n.addEventListener("change",r=>{e(r.target.files[0])});const s=document.getElementById("use-camera");s&&s.addEventListener("click",a),this.map?this.map.on("click",async r=>{this.marker&&this.marker.remove(),this.marker=await this.mapView.renderMarker(this.map,r.lngLat.lat,r.lngLat.lng,"Story location"),o(r)}):console.error("Map is not initialized. Cannot set up click event listener.")}setupNavigationListener(t){const e=()=>{this.stopCamera(),t()};this.navigationHandler=e,window.addEventListener("hashchange",this.navigationHandler)}removeNavigationListener(){this.navigationHandler&&(window.removeEventListener("hashchange",this.navigationHandler),this.navigationHandler=null)}goToHomePage(){window.location.hash="/"}async startCamera(t){try{await this.ensureCameraStopped();const e=await Promise.race([navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}}}),new Promise((a,o)=>setTimeout(()=>o(new Error("Camera access timeout")),1e4))]);this.cameraStream=e,await this.initializeCamera(e,t)}catch(e){throw console.error("Camera error:",e),new Error(e.name==="NotAllowedError"?"Akses kamera ditolak. Mohon izinkan akses kamera di browser Anda.":e.name==="NotFoundError"?"Tidak dapat menemukan kamera. Pastikan perangkat Anda memiliki kamera.":e.name==="NotReadableError"?"Kamera sedang digunakan oleh aplikasi lain.":e.message==="Camera access timeout"?"Waktu permintaan akses kamera habis. Silakan coba lagi.":"Gagal memulai kamera. Silakan coba lagi.")}}async ensureCameraStopped(){if(this.cameraStream){const t=this.cameraStream.getTracks();await Promise.all(t.map(e=>new Promise(a=>{e.stop(),e.onended=a,setTimeout(a,1e3)}))),this.cameraStream=null,this.hideCamera()}}async initializeCamera(t,e){const a=document.getElementById("camera-modal"),o=document.getElementById("camera-feed");if(!a||!o)throw new Error("Camera elements not found");a.style.display="flex",o.srcObject=t,await new Promise((i,n)=>{const s=setTimeout(()=>{n(new Error("Video initialization timeout"))},1e4);o.onloadedmetadata=()=>{clearTimeout(s),o.play().then(i).catch(n)},o.onerror=()=>{clearTimeout(s),n(new Error("Failed to initialize video stream"))}}),this.setupCameraControls(o,e)}setupCameraControls(t,e){const a=document.getElementById("capture-photo"),o=document.getElementById("close-camera");a&&(a.replaceWith(a.cloneNode(!0)),document.getElementById("capture-photo").onclick=()=>this.capturePhoto(t,e)),o&&(o.replaceWith(o.cloneNode(!0)),document.getElementById("close-camera").onclick=()=>this.ensureCameraStopped())}async capturePhoto(t,e){try{if(t.readyState!==t.HAVE_ENOUGH_DATA)throw new Error("Video stream not ready");const a=document.getElementById("photo-canvas"),o=a.getContext("2d");a.width=t.videoWidth,a.height=t.videoHeight,o.drawImage(t,0,0);const i=await new Promise(n=>a.toBlob(n,"image/jpeg",.9));if(!i)throw new Error("Failed to capture photo");e(i),await this.ensureCameraStopped()}catch(a){console.error("Error capturing photo:",a),this.showError("Gagal mengambil foto. Silakan coba lagi.")}}stopCamera(){return this.ensureCameraStopped()}hideCamera(){const t=document.getElementById("camera-modal"),e=document.getElementById("camera-feed");t&&e&&(t.style.display="none",e.srcObject=null)}showPhotoPreview(t){const e=document.getElementById("photo-preview");e&&(e.src=t,e.style.display="block")}updatePhotoInput(t){const e=document.getElementById("photo");if(e){const a=new DataTransfer;a.items.add(t),e.files=a.files;const o=new Event("change");e.dispatchEvent(o)}}showError(t){const e=document.getElementById("add-story-form");if(e){let a=e.querySelector(".form-error");a||(a=document.createElement("div"),a.className="form-error",e.prepend(a)),a.textContent=t,a.focus()}}showSuccess(t){const e=document.getElementById("add-story-form");if(e){let a=e.querySelector(".form-success");a||(a=document.createElement("div"),a.className="form-success",e.prepend(a)),a.textContent=t,a.focus()}}showMapError(){const t=document.getElementById("add-story-map");t&&(t.innerHTML=`
        <div class="map-fallback" style="height: 400px; display: flex; align-items: center; justify-content: center;">
          <p>Map failed to load. Please enable JavaScript and refresh the page.</p>
        </div>
      `)}updateLocation(t,e,a){const o=document.getElementById("lat"),i=document.getElementById("lon"),n=document.getElementById("location-info");o&&i&&n&&(o.value=t,i.value=e,n.textContent=a||`Latitude: ${t.toFixed(6)}, Longitude: ${e.toFixed(6)}`)}cleanup(){this.stopCamera(),this.removeNavigationListener(),this.map&&(this.map.remove(),this.map=null)}}export{y as AddStoryView};
