// use this to decode a token and get the user's information out of it
import decode from 'jwt-decode';

// create a new class for a user
class AuthService {
  getUser() {
    return decode(this.getToken());
  }

  // check if user's logged in
  loggedIn() { 
    const token = this.getToken();
    // If there is a token and it's not expired, return `true`
    return !!token && !this.isTokenExpired(token);
  }

  // check if token is expired
  isTokenExpired(token) {
    // Decode the token to get its expiration time that was set by the server
    const decoded = decode(token);
    // If the expiration time is less than the current time (in seconds), the token is expired and we return `true`
    if (decoded.exp < Date.now() / 1000) {
      localStorage.removeItem('id_token');
      return true;
    }
    // If token hasn't passed its expiration time, return `false`
    return false;
  }

  getToken() {
    // Retrieves the user token from localStorage
    return localStorage.getItem('id_token');
  }

  login(idToken) {
    // Saves user token to localStorage
    localStorage.setItem('id_token', idToken);
    window.location.assign('/');
  }

  logout() {
    // Clear user token and profile data from localStorage
    localStorage.removeItem('id_token');
    // this will reload the page and reset the state of the application
    window.location.assign('/');
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new AuthService();
