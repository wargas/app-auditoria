import { AgGridProvider, AgGridReact, AgGridReactProps } from 'ag-grid-react'
import { AllCommunityModule } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import { useResizeObserver } from 'usehooks-ts';
import { useRef } from 'react';

const modules = [AllCommunityModule];


// to use myTheme in an application, pass it to the theme grid option
export const themeLight = themeQuartz
    .withParams({
        fontSize: 12,
        borderColor: "#95A0A66B",
        columnBorder: false,
        // fontFamily: {
        //     googleFont: "Inter"
        // },
        headerVerticalPaddingScale: 0.6,
        headerRowBorder: true,
        rowBorder: true,
        wrapperBorder: false,
        wrapperBorderRadius: 0,
        borderRadius: 0
    });

export const themeDark = themeLight
    .withParams({
        backgroundColor: "#202020",
        browserColorScheme: "dark",
        chromeBackgroundColor: {
            ref: "foregroundColor",
            mix: 0.07,
            onto: "backgroundColor"
        },
        foregroundColor: "#FFF"
    });

export function Grid(props: AgGridReactProps) {
    const ref = useRef<HTMLDivElement>(null!)

    const { height } = useResizeObserver({
        ref: ref,
        box: 'border-box'
    })


    return <div ref={ref} className='h-full'>
        <AgGridProvider modules={modules}>
            <div style={{ height: (height!) - 50 }}>
                <AgGridReact gridOptions={{ enableCellTextSelection: true }} theme={localStorage.getItem('vite-ui-theme') == "dark" ? themeDark : themeLight} {...props} />
            </div>
        </AgGridProvider>
    </div>
}