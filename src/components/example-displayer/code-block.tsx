'use client';
import React, {useEffect, useMemo, useState} from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import ghcolors from 'react-syntax-highlighter/dist/esm/styles/prism/ghcolors';
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';

SyntaxHighlighter.registerLanguage('tsx', tsx);

export default function CodeBlock({code}: { code: string }) {
    const [copied, setCopied] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const html = document.documentElement;

        function updateTheme() {
            const currentTheme = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            setTheme(currentTheme);
        }

        updateTheme();

        const observer = new MutationObserver(updateTheme);
        observer.observe(html, {attributes: true, attributeFilter: ['data-theme']});

        return () => observer.disconnect();
    }, []);

    const backgroundColor = theme === 'dark' ? '#1e2030' : '#e4e7ed';
    const style = useMemo(() => {
        const baseStyle = theme === 'dark' ? oneDark : ghcolors;

        return {
            ...baseStyle,
            'pre[class*="language-"]': {
                ...baseStyle['pre[class*="language-"]'],
                background: backgroundColor,
            },
            'code[class*="language-"]': {
                ...baseStyle['code[class*="language-"]'],
                background: backgroundColor,
            },
        };
    }, [backgroundColor, theme]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <div className="relative w-full h-96 group" style={{background: backgroundColor}}>
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
