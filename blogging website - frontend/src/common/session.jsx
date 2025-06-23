const storeInSession = (key, value) => {
    // If storing user data, ensure it's stringified
    if (key === "user" && typeof value !== "string") {
        value = JSON.stringify(value);
    }
    return sessionStorage.setItem(key, value);
}

const lookInSession = (key) => {
    const value = sessionStorage.getItem(key);
    // If getting user data, parse it automatically
    if (key === "user" && value) {
        try {
            return JSON.parse(value);
        } catch {
            return value; // fallback to raw value if parsing fails
        }
    }
    return value;
}

const removeFromSession = (key) => {
    return sessionStorage.removeItem(key);
}

export { storeInSession, lookInSession, removeFromSession };