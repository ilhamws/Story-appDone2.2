import{N as i,F as a}from"./NotificationService-7rmGgoGp.js";import"./index-DVtLjEjI.js";class u{render(e){return`
      <div class="auth-container fade-in">
        <div class="auth-form slide-up">
          <h2 class="text-center mb-4">${e==="login"?"Login":"Register"}</h2>
          <form id="${e}-form" class="flex flex-col gap-4">
            ${e==="register"?`
                  <div class="form-group">
                    <label for="register-name">Name</label>
                    <div class="input-wrapper">
                      <span class="input-icon">👤</span>
                      <input 
                        id="register-name" 
                        type="text" 
                        name="name" 
                        placeholder="Enter your name" 
                        required 
                        aria-describedby="name-error"
                      />
                    </div>
                  </div>
                `:""}
            <div class="form-group">
              <label for="${e}-email">Email</label>
              <div class="input-wrapper">
                <span class="input-icon">✉️</span>
                <input 
                  id="${e}-email" 
                  type="email" 
                  name="email" 
                  placeholder="Enter your email" 
                  required 
                  aria-describedby="email-error"
                />
              </div>
            </div>
            <div class="form-group">
              <label for="${e}-password">Password</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input 
                  id="${e}-password" 
                  type="password" 
                  name="password" 
                  placeholder="Enter your password" 
                  required 
                  aria-describedby="password-error"
                />
              </div>
            </div>
            <button type="submit" class="button">${e==="login"?"Login":"Register"}</button>
          </form>
          <div class="auth-switch text-center mt-4">
            <p class="text-muted">
              ${e==="login"?"Don't have an account?":"Already have an account?"}
              <a href="#/${e==="login"?"register":"login"}" class="auth-switch-link">
                ${e==="login"?"Register here":"Login here"}
              </a>
            </p>
          </div>
        </div>
      </div>
    `}setupLoginForm(e,t){const r=document.getElementById("login-form");r.addEventListener("submit",o=>{o.preventDefault();const s=new FormData(r);e(s)}),this.focusError=t}setupRegisterForm(e,t){const r=document.getElementById("register-form");r.addEventListener("submit",o=>{o.preventDefault();const s=new FormData(r);e(s)}),this.focusError=t}showError(e,t){i.showError(e);const r=document.getElementById(t);if(r){const o=r.querySelector(".form-error");o&&o.remove();const s=document.createElement("div");s.className="form-error fade-in",s.textContent=e,r.prepend(s)}this.focusError&&this.focusError(e)}showSuccess(e){i.showSuccess(e)}goToPage(e){window.location.hash=e}focusErrorElement(e,t){a.moveFocusToElement(document.getElementById(e)),this.showError(t)}focusFirstInteractiveElement(){a.focusFirstInteractiveElement(document.getElementById("app"))}}export{u as AuthView};
