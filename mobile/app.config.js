/**
 * Optional dynamic config. The API base URL is read from EXPO_PUBLIC_BASE_URL
 * (inlined at bundle time by Expo), so this file only needs to forward the
 * static app.json configuration.
 */
module.exports = ({ config }) => config;
