"use client";
import {useEffect} from "react";

export function ThemeSync() {
    useEffect(() => {
        const html = document.documentElement;

        //console.log(111)
        function syncTheme() {
            const theme = html.getAttribute("data-theme");
            if (theme === "dark") {
                html.classList.add("dark");
            } else {
                html.classList.remove("dark");
            }
        }

        // 初始化同步
        syncTheme();

        // 监听属性变化
        const observer = new MutationObserver(syncTheme);
        observer.observe(html, {attributes: true, attributeFilter: ["data-theme"]});

        return () => observer.disconnect();
    }, []);

    return null;
}