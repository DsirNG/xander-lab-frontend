import { authService } from "./services/authService";

/** Public auth capabilities for consumers outside the auth feature. */
export const logout = () => authService.logout();
export const updateProfile = (data) => authService.updateProfile(data);
export const getLocalUserInfo = () => authService.getLocalUserInfo();
export const isLoggedIn = () => authService.isLoggedIn();
