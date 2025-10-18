'use client'
import React from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import "@/styles/global.css";

export function ComponentDisplayer(
    {children, code}: { children: React.ReactNode, code: string }
) {
    return <Tabs defaultValue={"preview"} className={"w-full h-96"}>
        <TabsList>
            <TabsTrigger value={"preview"} asChild>
                <button className={"!mt-0"}>
                    Preview
                </button>

            </TabsTrigger>
            <TabsTrigger value={"code"} asChild>
                <button className={"!mt-0"}>
                    Code
                </button>

            </TabsTrigger>
        </TabsList>
        <TabsContent value={"preview"} className={"w-full h-full"}>
            <div
                className={"w-full h-full flex flex-row items-center justify-center border-[1px] border-foreground/60 rounded-md p-4 gap-4"}>
                <div>
                    {children}
                </div>
            </div>
        </TabsContent>

        {false&&<TabsContent value={"code"} className={"w-full h-full"}>
            <div
                className={"w-full  h-full flex flex-row items-center justify-center border-[1px] border-foreground/60 rounded-md p-4 gap-4"}>
                <pre className={"w-full !border-0 h-full !bg-transparent"}>
                    {code.toString()}
                </pre>
            </div>
        </TabsContent>}
    </Tabs>
}