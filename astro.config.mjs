// @ts-check
import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';
import catppuccin from "@catppuccin/starlight";
import react from '@astrojs/react';
import tailwindcss from "@tailwindcss/vite";
import mdx from '@astrojs/mdx';
import remarkCaptureComponent from './plugins/remark-capture-component.js';
// https://astro.build/config
export default defineConfig({
    integrations: [starlight({
        components: {
            // 重写默认的 `SocialIcons` 组件。
            PageFrame: './src/components/override-components/PageFrame.astro',
        },
        title: 'Opalus UI',
        customCss: ["./src/styles/global.css"], // 💡 直接写路径
        social: [{icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight'}],
        sidebar: [
            {label: 'Getting Started', autogenerate: {directory: 'get-started'}},
            {label: 'Components', autogenerate: {directory: 'components'}},
        ],
        plugins: [catppuccin({
            dark: {flavor: "macchiato", accent: "sky"},
            light: {flavor: "latte", accent: "sky"}
        })],
    }),
        react(),
        mdx({
            remarkPlugins: [remarkCaptureComponent],
        }),],
    vite: {
        plugins: [tailwindcss()]
    },
});