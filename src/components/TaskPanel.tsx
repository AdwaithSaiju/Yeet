import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { Task, TaskDifficulty } from "../App";

interface TaskPanelProps {
  mode: "pending" | "calendar" | "upcoming";
  selectedDate: Date | null;
  tasks: Task[];
  allTasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export default function TaskPanel({
  mode,
  selectedDate,
  tasks,
  setTasks,
}: TaskPanelProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskSubject, setTaskSubject] = useState("");
  const [taskDifficulty, setTaskDifficulty] =
    useState<TaskDifficulty>("Moderate");

  const getDifficultyStyle = (difficulty: TaskDifficulty) => {
    switch (difficulty) {
      case "Less":
        return { background: "#a6e3a1", color: "#1e1e2e", label: "Less" };
      case "Moderate":
        return { background: "#f9e2af", color: "#1e1e2e", label: "Moderate" };
      case "Important":
        return { background: "#f38ba8", color: "#1e1e2e", label: "Important" };
      default:
        return { background: "#6c7086", color: "#cdd6f4", label: difficulty };
    }
  };

  const formatDate = (date: Date) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${
      months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatTaskDate = (dateString: string) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return formatDate(d);
  };

  const canAddTask = mode === "calendar" && selectedDate;

  const handleAddTaskClick = () => {
    if (!canAddTask) return;
    setIsFormOpen(true);
  };

  const handleSubmitTask = async () => {
    if (!canAddTask) return;
    if (!taskName.trim() || !taskSubject.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      name: taskName,
      subject: taskSubject,
      difficulty: taskDifficulty,
      date: selectedDate!.toDateString(),
      completed: false,
    };

    setTasks((prev) => [...prev, newTask]);

    const taskJson = JSON.stringify(newTask);
    try {
      await invoke("save_task", { taskJson });
    } catch (err) {
      console.error("Failed to save task in Rust:", err);
    }

    setTaskName("");
    setTaskSubject("");
    setTaskDifficulty("Moderate");
    setIsFormOpen(false);
  };

  const handleCancel = () => {
    setTaskName("");
    setTaskSubject("");
    setTaskDifficulty("Moderate");
    setIsFormOpen(false);
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await invoke("delete_task", { taskId });
    } catch (err) {
      console.error("Failed to delete task from DB:", err);
    }
  };

  const headerTitle =
    mode === "pending"
      ? "Pending Tasks"
      : mode === "upcoming"
      ? "Upcoming Tasks"
      : selectedDate
      ? formatDate(selectedDate)
      : "Tasks";

  return (
    <div
      className="w-[320px] bg-[#181825] overflow-y-auto"
      style={{
        paddingTop: "20px",
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingBottom: "20px",
      }}
    >
      <div className="flex flex-col gap-4">
        <h3 className="text-[#cdd6f4] text-lg font-semibold">{headerTitle}</h3>

        {mode === "calendar" && (
          <>
            <button
              onClick={handleAddTaskClick}
              disabled={!selectedDate}
              style={{
                background: selectedDate ? "#45475a" : "#313244",
                border: "none",
                color: "#cdd6f4",
                padding: "12px 16px",
                borderRadius: "6px",
                cursor: selectedDate ? "pointer" : "not-allowed",
                fontWeight: "500",
                fontSize: "15px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: selectedDate ? 1 : 0.6,
              }}
            >
              <span style={{ fontSize: "18px" }}>+</span>
              Add Task
            </button>

            {isFormOpen && (
              <div
                className="flex flex-col gap-3"
                style={{
                  background: "#1e1e2e",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #313244",
                }}
              >
                <h4 className="text-[#cdd6f4] font-semibold">New Task</h4>

                <div className="flex flex-col gap-1">
                  <label className="text-[#cdd6f4] text-sm">Task Name</label>
                  <input
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Enter task name"
                    style={{
                      background: "#313244",
                      border: "1px solid #45475a",
                      color: "#cdd6f4",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#cdd6f4] text-sm">Subject</label>
                  <input
                    type="text"
                    value={taskSubject}
                    onChange={(e) => setTaskSubject(e.target.value)}
                    placeholder="e.g., Math, Physics"
                    style={{
                      background: "#313244",
                      border: "1px solid #45475a",
                      color: "#cdd6f4",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#cdd6f4] text-sm">Priority</label>
                  <select
                    value={taskDifficulty}
                    onChange={(e) =>
                      setTaskDifficulty(e.target.value as TaskDifficulty)
                    }
                    style={{
                      background: "#313244",
                      border: "1px solid #45475a",
                      color: "#cdd6f4",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="Less">Less</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Important">Important</option>
                  </select>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSubmitTask}
                    style={{
                      background: "#89b4fa",
                      border: "none",
                      color: "#1e1e2e",
                      padding: "10px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                      flex: 1,
                    }}
                  >
                    Add Task
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      background: "#45475a",
                      border: "none",
                      color: "#cdd6f4",
                      padding: "10px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500",
                      fontSize: "14px",
                      flex: 1,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex flex-col gap-2">
          {tasks.length > 0 ? (
            tasks.map((task) => {
              const difficultyStyle = getDifficultyStyle(task.difficulty);
              const showDate = mode === "upcoming" || mode === "pending";

              return (
                <div
                  key={task.id}
                  style={{
                    background: "#1e1e2e",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #313244",
                    opacity: task.completed ? 0.6 : 1,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task.id)}
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                        accentColor: "#89b4fa",
                        marginTop: "2px",
                      }}
                    />

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4
                          className="text-[#cdd6f4] font-semibold text-sm"
                          style={{
                            textDecoration: task.completed
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {task.name}
                        </h4>
                        <span
                          style={{
                            background: difficultyStyle.background,
                            color: difficultyStyle.color,
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "600",
                          }}
                        >
                          {difficultyStyle.label}
                        </span>
                      </div>

                      {showDate && (
                        <p className="text-[#6c7086] text-[11px] mb-1">
                          {formatTaskDate(task.date)}
                        </p>
                      )}

                      <p
                        className="text-[#89b4fa] text-xs"
                        style={{
                          textDecoration: task.completed
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {task.subject}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#f38ba8",
                        cursor: "pointer",
                        fontSize: "18px",
                        padding: "0",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Delete task"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-[#6c7086] text-sm text-center mt-4">
              {mode === "pending"
                ? "No pending tasks"
                : mode === "upcoming"
                ? "No upcoming tasks"
                : "No tasks yet"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
