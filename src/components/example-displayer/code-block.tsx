'use client';
import React, {useEffect, useState} from 'react';

export default function CodeBlock({code}: { code: string }) {
    const [SyntaxHighlighter, setSyntaxHighlighter] = useState<any>(null);
    const [style, setStyle] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // 动态导入 SyntaxHighlighter
    useEffect(() => {
        import('react-syntax-highlighter/dist/esm/prism')
            //@ts-ignore
            .then(mod => setSyntaxHighlighter(() => mod.Prism || mod.default));
    }, []);

    // 根据主题动态加载样式
    useEffect(() => {
        const html = document.documentElement;

        function updateTheme() {
            const currentTheme = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            setTheme(currentTheme);

            if (currentTheme === 'dark') {
                import('react-syntax-highlighter/dist/esm/styles/prism').then(mod => setStyle(mod.oneDark));
            } else {
                import('react-syntax-highlighter/dist/esm/styles/prism').then(mod => setStyle(mod.ghcolors));
            }
        }

        // 初始同步
        updateTheme();

        // 监听 theme 变化
        const observer = new MutationObserver(updateTheme);
        observer.observe(html, {attributes: true, attributeFilter: ['data-theme']});

        return () => observer.disconnect();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    if (!SyntaxHighlighter || !style) return <p>Loading...</p>;

    return (
        <div className="relative w-full h-96 group">
            {/* 复制按钮 */}
            <button
                onClick={handleCopy}
                className="
          absolute top-2 right-7 z-10
          px-2 py-1 text-xs rounded
          bg-black/30 text-white backdrop-blur-sm
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          hover:bg-black/50
        "
            >
                {copied ? 'Copied!' : 'Copy'}
            </button>

            {/* 代码区域 */}
            <SyntaxHighlighter
                className="w-full h-full overflow-auto !m-0 !p-4 rounded-md"
                language="tsx"
                style={style}
                wrapLines
                showLineNumbers
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}
