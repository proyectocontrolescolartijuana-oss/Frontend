export const SESSION_EXPIRED_EVENT = "auth:session-expired";
export const SESSION_EXPIRED_MESSAGE =
  "Tiempo de sesión expirada, vuelva a iniciar sesión";
export const SESSION_EXPIRED_STORAGE_KEY = "sessionExpiredMessage";

export const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const clearSessionExpiredMessage = () => {
  sessionStorage.removeItem(SESSION_EXPIRED_STORAGE_KEY);
};

const normalizeBase64Url = (value) => {
  const padding = value.length % 4 ? "=".repeat(4 - (value.length % 4)) : "";

  return `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
};

export const getTokenExpiration = (token) => {
  try {
    const payload = JSON.parse(atob(normalizeBase64Url(token.split(".")[1])));

    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const markSessionExpired = () => {
  sessionStorage.setItem(
    SESSION_EXPIRED_STORAGE_KEY,
    SESSION_EXPIRED_MESSAGE,
  );
};

export const getStoredToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  const tokenExpiration = getTokenExpiration(token);

  if (tokenExpiration && tokenExpiration <= Date.now()) {
    markSessionExpired();
    clearStoredAuth();

    return null;
  }

  return token;
};

export const consumeSessionExpiredMessage = () => {
  const message = sessionStorage.getItem(SESSION_EXPIRED_STORAGE_KEY);

  if (message) {
    sessionStorage.removeItem(SESSION_EXPIRED_STORAGE_KEY);
  }

  return message || "";
};
