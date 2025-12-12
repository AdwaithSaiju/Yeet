use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use tauri::path::BaseDirectory;
use tauri::Manager;

#[derive(Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub name: String,
    pub subject: String,
    pub difficulty: String,
    pub date: String,
    pub completed: bool,
}

fn get_connection(app: &tauri::AppHandle) -> Result<Connection, String> {
    let path = app
        .path()
        .resolve("tasks.db", BaseDirectory::AppData)
        .map_err(|e| e.to_string())?;

    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    eprintln!("DB path: {:?}", path);

    Connection::open(path).map_err(|e| e.to_string())
}

fn init_db(app: &tauri::AppHandle) -> Result<(), String> {
    let conn = get_connection(app)?;
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS tasks (
          id         TEXT PRIMARY KEY,
          name       TEXT NOT NULL,
          subject    TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          date       TEXT NOT NULL,
          completed  INTEGER NOT NULL
        );
        ",
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_tasks(app: tauri::AppHandle) -> Result<String, String> {
    init_db(&app)?;
    let conn = get_connection(&app)?;

    let mut stmt = conn
        .prepare(
            "SELECT id, name, subject, difficulty, date, completed
             FROM tasks",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Task {
                id: row.get(0)?,
                name: row.get(1)?,
                subject: row.get(2)?,
                difficulty: row.get(3)?,
                date: row.get(4)?,
                completed: {
                    let v: i64 = row.get(5)?;
                    v != 0
                },
            })
        })
        .map_err(|e| e.to_string())?;

    let mut tasks: Vec<Task> = Vec::new();
    for t in rows {
        tasks.push(t.map_err(|e| e.to_string())?);
    }

    let json = serde_json::to_string(&tasks).map_err(|e| e.to_string())?;
    Ok(json)
}

#[tauri::command]
pub fn save_task(app: tauri::AppHandle, task_json: String) -> Result<(), String> {
    init_db(&app)?;

    let task: Task =
        serde_json::from_str(&task_json).map_err(|e| format!("JSON parse error: {e}"))?;

    let conn = get_connection(&app)?;
    conn.execute(
        "INSERT OR REPLACE INTO tasks
         (id, name, subject, difficulty, date, completed)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            task.id,
            task.name,
            task.subject,
            task.difficulty,
            task.date,
            if task.completed { 1 } else { 0 },
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_task(app: tauri::AppHandle, task_id: String) -> Result<(), String> {
    if task_id.is_empty() {
        eprintln!("delete_task: empty id");
        return Err("empty id".into());
    }

    let conn = match get_connection(&app) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("delete_task get_connection error: {e}");
            return Err(e);
        }
    };

    if let Err(e) = conn.execute("DELETE FROM tasks WHERE id = ?1", [&task_id]) {
        eprintln!("delete_task SQL error: {e}");
        return Err(e.to_string());
    }

    Ok(())
}
