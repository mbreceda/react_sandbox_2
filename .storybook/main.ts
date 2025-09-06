import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    const { mergeConfig } = await import("vite");
    // Merge custom configuration into the default Vite config
    return mergeConfig(config, {
      // Add dependencies to pre-bundle
      optimizeDeps: {
        include: ["storybook-dark-mode"],
      },
      resolve: {
        alias: {
          // Add any aliases if needed
        },
      },
      // Explicitly configure SVG handling
      assetsInclude: ["**/*.svg"],
    });
  },
};
export default config;
