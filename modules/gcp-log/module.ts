import { defineNuxtModule, addServerPlugin, createResolver } from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * GOOGLE_CLOUD_PROJECT
   */
  projectId?: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'gcp-log',
    configKey: 'gcpLog',
  },
  defaults: {},
  setup (options, nuxt) {
    const resolver = createResolver(import.meta.url);
    addServerPlugin(resolver.resolve('./server/plugins/gcp-log'));
  }
});
