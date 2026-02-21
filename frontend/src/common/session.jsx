const storeInSession = (key, value) => {
  try {
    sessionStorage.setItem(
      key,
      typeof value === "string" ? value : JSON.stringify(value),
    );
  } catch (err) {
    console.error("SessionStorage set error:", err);
  }
};

const lookInSession = (key) => {
  try {
    const value = sessionStorage.getItem(key);
    if (value === null) return null;

    try {
      return JSON.parse(value);
    } catch {
      return value; // plain string
    }
  } catch (err) {
    console.error("SessionStorage get error:", err);
    return null;
  }
};

const removeFromSession = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (err) {
    console.error("SessionStorage remove error:", err);
  }
};

export { storeInSession, lookInSession, removeFromSession };
