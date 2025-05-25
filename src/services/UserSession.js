export class UserSession {
  static getToken() {
    return localStorage.getItem('authToken')
  }

  static getUserName() {
    return localStorage.getItem('userName')
  }

  static isAuthenticated() {
    return !!this.getToken()
  }

  static login(token, userName) {
    localStorage.setItem('authToken', token)
    localStorage.setItem('userName', userName)
  }

  static logout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userName')
  }
}