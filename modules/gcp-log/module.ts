import { defineNuxtModule, addServerPlugin, createResolver } from '@nuxt/kit'

export interface ModuleOptions {
  enable: boolean;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'gcp-log',
    configKey: 'gcpLog',
  },
  defaults: {
    enable: true,
  },
  setup (options, nuxt) {
    if (!options.enable) {
      return;
    }

    const resolver = createResolver(import.meta.url);
    addServerPlugin(resolver.resolve('./server/plugins/gcp-log'));
  }
});
