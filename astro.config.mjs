// @ts-check
import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';
import catppuccin from "@catppuccin/starlight";
import react from '@astrojs/react';
import tailwindcss from "@tailwindcss/vite";
import mdx from '@astrojs/mdx';
import {unified} from '@astrojs/markdown-remark';
import remarkCaptureComponent from './plugins/remark-capture-component.js';
// https://astro.build/config
export default defineConfig({
    site: 'https://opalus-ui.aquamarinez.com',
    markdown: {
        processor: unified({remarkPlugins: [remarkCaptureComponent]}),
    },
    integrations: [starlight({
        components: {
            // 重写默认的 `PageFrame` 组件。
            PageFrame: './src/components/override-components/PageFrame.astro',
        },
        title: 'Opalus UI',
        customCss: ["./src/styles/global.css"], // 💡 直接写路径
        social: [{icon: 'github', label: 'GitHub', href: 'https://github.com/aquamarine-z/opalus-ui'}],
        sidebar: [
            {label: 'Getting Started', items: [{autogenerate: {directory: 'get-started'}}]},
            {
                label: 'Components',
                items: [
                    {
                        label: 'Surface',
                        autogenerate: {directory: 'components/surface'}
                    }
                ]
            },
        ],
        plugins: [catppuccin({
            dark: {flavor: "macchiato", accent: "sky"},
            light: {flavor: "latte", accent: "sky"}
        })],
    }), react(), mdx()],
    vite: {
        plugins: [tailwindcss()]
    },
});
