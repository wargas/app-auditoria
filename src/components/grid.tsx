import { AgGridProvider, AgGridReact, AgGridReactProps } from 'ag-grid-react'
import { AllCommunityModule } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';

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
        wrapperBorderRadius: 0
    });

export function Grid(props: AgGridReactProps) {
    return <AgGridProvider modules={modules}>
        <AgGridReact theme={myTheme} {...props} />
    </AgGridProvider>
}