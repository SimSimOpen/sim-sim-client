export const EnvironmentTs = {
  production: true,
  URL: 'https://api.simsim.fit',
  // Yandex Maps JavaScript API v3 key. Restricted by HTTP Referer in the Yandex developer cabinet,
  // so every domain this app is served from (including localhost) must be on its allow-list.
  YANDEX_MAPS_API_KEY: 'd274a689-ee61-43ea-83ff-333ac18efed4',
  MEDIA_URL: 'https://api.media.simsim.fit',
  // Where an agent is sent when they tap "Post ad": the admin panel takes over the session.
  ADMIN_URL: 'https://admin.simsim.fit',
  // Firebase web config (Project settings -> Your apps -> Web app). These values are public by design.
  FIREBASE: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    appId: '',
  },
};
