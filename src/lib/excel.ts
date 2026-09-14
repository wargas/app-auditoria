import { invoke } from "@tauri-apps/api/core";

export class Excel {

    rid!:number;
    sheetName = 'Sheet1'

    static async Workbook() {
        const instance = new Excel()

        instance.rid = await invoke(`excel_open`)

        return instance
    }

    setSheet(name:string) {
        this.sheetName = name
    }

    async writeCell(row: number, col: number, value: string|number, format = '') {
        await invoke('excel_write_cell', { 
            sheetName: "Sheet1", 
            rid: this.rid, 
            col: col, 
            row: row, 
            value: String(value),
            formatStr: format
         })
    }

    async save(path:string) {
        await invoke('excel_save', {
            rid: this.rid, path: path
        })
    }
}