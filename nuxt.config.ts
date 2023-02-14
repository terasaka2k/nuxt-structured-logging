export default defineNuxtConfig({
  ssr: false,

  modules: [
    './modules/gcp-log/module',
  ],

  gcpLog: {
    enable: process.env.NODE_ENV === 'production',
  },
});
