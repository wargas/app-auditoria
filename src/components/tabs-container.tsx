import { Code, Plus, X } from "lucide-react";
import { useConsulta } from "./consultas-provider";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { ConsultaTab } from "./consulta-tab";
import { cn } from "#lib/utils";
import { useEffect } from "react";
import { last } from "lodash";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "./ui/context-menu";

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
                        <ContextMenu key={t.id}>
                            <ContextMenuTrigger className="flex gap-2">
                                <Code className="text-pink-600" />
                                Consulta #{i + 1}
                                <Button onClick={() => fecharTab(t.id)} size={`xs`} variant={`ghost`}><X /></Button>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                                <ContextMenuItem onClick={() => fecharTab(t.id)}>Fechar</ContextMenuItem>
                                <ContextMenuItem onClick={() => tabs.filter(tb => t.id != tb.id).forEach(({ id }) => fecharTab(id))}>Fechar outras</ContextMenuItem>
                                <ContextMenuItem onClick={() => tabs.forEach(({ id }) => fecharTab(id))}>Fechar todas</ContextMenuItem>
                                <ContextMenuItem onClick={() => tabs.filter((_, it) => it > i).forEach(({ id }) => fecharTab(id))}>Fechar a direita</ContextMenuItem>
                            </ContextMenuContent>
                        </ContextMenu>
                    </TabsTrigger>


                ))}
                <Button onClick={handleAddTab} size={'xs'} variant={`outline`}><Plus /></Button>
            </TabsList>

        </Tabs>
        {
            tabs.map(t => (
                <div key={t.id} className={cn('h-[calc(100vh-35px)]', { 'hidden': !t.active })}>
                    <ConsultaTab id={t.id} />
                </div>
            ))
        }
    </div >
}