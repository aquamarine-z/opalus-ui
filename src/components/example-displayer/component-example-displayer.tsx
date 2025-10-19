'use client';
import React, {useEffect, useState} from 'react';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs.tsx';
import CodeBlock from '@/components/example-displayer/code-block.tsx';

// 动态导入示例组件
const componentModules = import.meta.glob('../examples/**/*.tsx');
// 以 raw 形式导入源码
const componentSources = import.meta.glob('../examples/**/*.tsx', {as: 'raw'});

// 提取源码中 export default 的部分
function extractDefaultExport(code: string): string {
    const match =
        code.match(/export\s+default\s+function[\s\S]*$/) ||
        code.match(/export\s+default\s+class[\s\S]*$/) ||
        code.match(/export\s+default\s+\([\s\S]*$/) ||
        code.match(/export\s+default\s+\w+[\s\S]*$/);

    if (!match) return '// export default not found';
    return match[0].trim();
}

// 预览容器，背景跟 CodeBlock 保持一致
function PreviewWrapper({children}: { children: React.ReactNode }) {
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

    return (
        <div
            className={`
        w-full h-96 flex flex-row items-center justify-center border rounded-md p-8 gap-4
      `}
        >
            {children}
        </div>
    );
}

export function ComponentExampleDisplayer({
                                              componentName,
                                              exampleName,
                                          }: {
    componentName: string;
    exampleName: string;
}) {
    const [Comp, setComp] = useState<React.ComponentType | null>(null);
    const [code, setCode] = useState<string>('');

    useEffect(() => {
        const path = `../examples/${componentName}/${exampleName}.tsx`;
        const mod = componentModules[path];
        const raw = componentSources[path];

        if (!mod || !raw) {
            console.warn(`⚠️ Example not found: ${path}`);
            setCode('// Example not found');
            return;
        }

        Promise.all([mod(), raw()]).then(([m, txt]) => {
            // @ts-ignore
            setComp(() => m.default);
            setCode(extractDefaultExport(txt));
            //console.log(m, txt)
        });

    }, [componentName, exampleName]);

    return (
        <Tabs defaultValue="preview" className="w-full h-fit">
            <TabsList>
                <TabsTrigger value="preview" asChild>
                    <button className="!mt-0">Preview</button>
                </TabsTrigger>
                <TabsTrigger value="code" asChild>
                    <button className="!mt-0">Code</button>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="w-full h-fit">
                <PreviewWrapper>
                    {Comp ? <Comp/> : <p>Loading...</p>}
                </PreviewWrapper>
            </TabsContent>

            <TabsContent value="code" className="w-full h-fit">
                <div
                    className="w-full h-96 flex items-center overflow-hidden justify-center border rounded-md p-0"
                >
                    <CodeBlock code={code}/>
                </div>
            </TabsContent>
        </Tabs>
    );
}
