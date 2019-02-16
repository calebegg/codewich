export namespace availablePlugins { }
export namespace availablePresets {
  namespace es2015 {
    function buildPreset(context: any, ...args: any[]): any;
    const plugins: any[][];
  }
  const es2016: {
    plugins: Function[];
  };
  const es2017: {
    plugins: Function[];
  };
  function latest(context: any, ...args: any[]): any;
  const react: {
    env: {
      development: {
        plugins: any;
      };
    };
    plugins: Function[];
    presets: {
      plugins: any;
    }[];
  };
}
export function buildExternalHelpers(whitelist: any, ...args: any[]): any;
export function disableScriptTags(): void;
export function registerPlugin(name: any, plugin: any): void;
export function registerPlugins(newPlugins: any): void;
export function registerPreset(name: any, preset: any): void;
export function registerPresets(newPresets: any): void;
export function transform(code: any, options: any): any;
export function transformFromAst(ast: any, code: any, options: any): any;
export function transformScriptTags(scriptTags: any): void;
export const version: string;
