export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user-info');
    window.location.href = '/login';
}
