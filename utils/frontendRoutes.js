const frontend_routes = {
    profile: "/profile",
    user_profile: "/profile/:user_id",
    messages: "/messages/:room_id",
    sessions: "/sessions",
};

const generateFrontendUrl = (routeName, params = {}) => {
    const baseUrl = process.env.APP_URL;
    let path = frontend_routes[routeName];

    if (!path) {
        throw new Error("Invalid route name");
    }

    for (const [key, value] of Object.entries(params)) {
        const placeholder = `:${key}`;
        if (path.includes(placeholder)) {
            path = path.replace(placeholder, value);
        }
    }

    return `${path}`;
};

module.exports = { frontend_routes, generateFrontendUrl };
