import { Code, Plus, X } from "lucide-react";
import { useConsulta } from "./consultas-provider";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { ConsultaTab } from "./consulta-tab";
import { cn } from "#lib/utils";
import { useEffect } from "react";
import { last } from "lodash";

export function TabsContainer() {
    const { tabs, addTab, fecharTab, activeTab } = useConsulta()
    
    useEffect(() => {
        if (!tabs.some(t => t.active)) {
            const lastTab = last(tabs)

            if (lastTab) {
                activeTab(lastTab.id)
            }
        }
    }, [tabs])

    function handleAddTab() {
        const id = addTab()

        activeTab(id)
    }

    return <div>
        <Tabs value={tabs.find(t => t.active)?.id ?? ''} onValueChange={v => activeTab(v)}>
            <TabsList variant={'line'} className="pb-1">
                {tabs.map((t, i) => (
                    <TabsTrigger key={t.id} value={t.id}>
                        <Code className="text-pink-600" />
                        Consulta #{i+1}
                        {tabs.length > 1 && <Button onClick={() => fecharTab(t.id)} size={`xs`} variant={`ghost`}><X /></Button>}
                    </TabsTrigger>
                ))}
                <Button onClick={handleAddTab} size={'xs'} variant={`outline`}><Plus /></Button>
            </TabsList>

        </Tabs>
        {tabs.map(t => (
            <div key={t.id} className={cn('h-[calc(100vh-35px)]', { 'hidden': !t.active })}>
                <ConsultaTab id={t.id} />
            </div>
        ))}
    </div>
}