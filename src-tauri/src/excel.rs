use std::{borrow::Cow, sync::{Arc, Mutex}};

use rust_xlsxwriter::{Format, Workbook};
use tauri::{Manager, ResourceId, Resource, ResourceTable, Runtime, WebviewWindow};

struct ExcelWorkbookResource(Mutex<Workbook>);

impl Resource for ExcelWorkbookResource {
    fn name(&self) -> Cow<'_, str> {
        "excelWorkbook".into()
    }
}


#[tauri::command]
pub fn excel_open<R: Runtime>(window: WebviewWindow<R>) -> Result<ResourceId, String> {
    let mut resources: std::sync::MutexGuard<'_, ResourceTable> = window.resources_table();

    let workbook = Workbook::new();

    let rid = resources.add(ExcelWorkbookResource(Mutex::new(workbook)));

    Ok(rid)
}

#[tauri::command]
pub fn excel_write_cell<R: Runtime>(
    window: WebviewWindow<R>,
    rid: ResourceId,
    sheet_name: String,
    row: u32,
    col: u16,
    value: String,
    format_str: String
) -> Result<(), String> {
    let resources = window.resources_table();

    let resource = resources.get::<ExcelWorkbookResource>(rid)
        .map_err(|e| e.to_string() )?;

    let mut workbook = resource.0.lock().map_err(|e| e.to_string())?;

    let worksheet = match workbook.worksheet_from_name(&sheet_name) {
        Ok(ws) => ws,
        Err(_) => workbook.add_worksheet().set_name(&sheet_name).map_err(|e| e.to_string())?,
    };

    let format = Format::new().set_num_format(&format_str);
    
    worksheet.write_with_format(row, col, value, &format).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn excel_save<R: Runtime>(window: WebviewWindow<R>, rid: ResourceId, path: String) -> Result<(), String> {
    let mut resources = window.resources_table();

    let resource = resources
        .take::<ExcelWorkbookResource>(rid)
        .map_err(|er| format!("Recurso invalido {}", er))?;

    let mutex = Arc::try_unwrap(resource)
        .map_err(|_| "Recurso ainda nao esta no lugar".to_string())?.0;

    let mut workbook = mutex.into_inner().map_err(|e| e.to_string())?;

    workbook.save(&path).map_err(|e| e.to_string())?;

    Ok(())
}
