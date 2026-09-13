import _, {  } from 'lodash'
import { SidebarProvider, } from '#components/ui/sidebar';
import { SidebarTables } from '#components/sidebar-tables';

import { ConsultasProvider } from '#components/consultas-provider';
import { TabsContainer } from '#components/tabs-container';

export function Component() {
      
    return <ConsultasProvider>
        <SidebarProvider style={{'--sidebar-width': "21rem", "--sidebar-width-icon": "3.5rem"} as any}>
            <SidebarTables />

            <div className='h-screen overflow-hidden flex flex-col relative w-full'>
                <TabsContainer />
            </div>
        </SidebarProvider>
    </ConsultasProvider>
}