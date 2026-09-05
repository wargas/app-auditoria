import { AgGridProvider, AgGridReact, AgGridReactProps } from 'ag-grid-react'
import { AllCommunityModule } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import { useResizeObserver } from 'usehooks-ts';
import { useRef } from 'react';

const modules = [AllCommunityModule];


// to use myTheme in an application, pass it to the theme grid option
export const myTheme = themeQuartz
    .withParams({
        fontSize: 12,
        borderColor: "#95A0A66B",
        columnBorder: false,
        // fontFamily: {
        //     googleFont: "Inter"
        // },
        headerRowBorder: true,
        rowBorder: true,
        wrapperBorder: false,
        wrapperBorderRadius: 0,
        borderRadius: 0
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
                <AgGridReact theme={myTheme} {...props} />
            </div>
        </AgGridProvider>
    </div>
}