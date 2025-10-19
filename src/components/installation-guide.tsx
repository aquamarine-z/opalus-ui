import {useState} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

export function InstallationGuide({componentName}: { componentName: string }) {
    const pnpmCode = `pnpm dlx shadcn add @opalus-ui/${componentName}`;
    const npxCode = `npx shadcn add @opalus-ui/${componentName}`;
    const yarnCode = `yarn dlx shadcn add @opalus-ui/${componentName}`;
    const bunCode = `bunx shadcn add @opalus-ui/${componentName}`;

    // 私有单行 Code 组件
    function InlineCode({code}: { code: string }) {
        const [copied, setCopied] = useState(false);

        const handleCopy = () => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        };

        return (
            <div className="w-full rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* 标题 */}
                <div
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-1 font-mono text-sm">
                    bash
                </div>

                {/* 代码区 */}
                <div
                    className="flex justify-between gap-0 !mt-0 items-center bg-gray-100 dark:bg-gray-800 px-4 py-2 transition-all">
                    <code className="font-mono !bg-transparent text-md text-gray-800 dark:text-gray-100 break-all">
                        {code}
                    </code>
                    <button
                        onClick={handleCopy}
                        className="ml-4 px-3 py-1 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
            </div>
        );
    }


    return (
        <Tabs defaultValue="pnpm">
            <TabsList>
                <TabsTrigger className="!mt-0" value="pnpm">pnpm</TabsTrigger>
                <TabsTrigger className="!mt-0" value="npx">npx</TabsTrigger>
                <TabsTrigger className="!mt-0" value="yarn">yarn</TabsTrigger>
                <TabsTrigger className="!mt-0" value="bun">bun</TabsTrigger>
            </TabsList>

            <TabsContent value="pnpm">
                <InlineCode code={pnpmCode}/>
            </TabsContent>
            <TabsContent value="npx">
                <InlineCode code={npxCode}/>
            </TabsContent>
            <TabsContent value="yarn">
                <InlineCode code={yarnCode}/>
            </TabsContent>
            <TabsContent value="bun">
                <InlineCode code={bunCode}/>
            </TabsContent>
        </Tabs>
    );
}
