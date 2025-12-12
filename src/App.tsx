import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import SidebarButton from "./components/SidebarButton";
import "./App.css";
import Calendar from "./components/Calender";
import TaskPanel from "./components/TaskPanel";

export type TaskDifficulty = "Less" | "Moderate" | "Important";

export interface Task {
  id: string;
  name: string;
  subject: string;
  difficulty: TaskDifficulty;
  date: string;
  completed: boolean;
}

function App() {
  const [activeTab, setActiveTab] = useState<
    "pending" | "calendar" | "upcoming"
  >("calendar");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const json = await invoke<string>("load_tasks");
        const loaded = JSON.parse(json) as Task[];
        setTasks(loaded);
      } catch (e) {
        console.error("Failed to load tasks:", e);
      }
    };
    load();
  }, []);

  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();

  const pendingTasks = tasks.filter((t) => {
    const d = new Date(t.date);
    const time = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return time < todayMidnight && !t.completed;
  });

  const upcomingTasks = tasks.filter((t) => {
    const d = new Date(t.date);
    const time = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return time > todayMidnight && !t.completed;
  });

  const panelTasks =
    activeTab === "pending"
      ? pendingTasks
      : activeTab === "upcoming"
      ? upcomingTasks
      : selectedDate
      ? tasks.filter((t) => t.date === selectedDate.toDateString())
      : [];

  const effectiveSelectedDate = activeTab === "calendar" ? selectedDate : null;

  return (
    <div className="flex w-screen h-screen m-0 overflow-hidden bg-[#1e1e2e]">
      <div className="w-[200px] bg-[#181825] p-4">
        <div
          className="handwriting-title text-3xl text-[#cdd6f4] text-center"
          style={{ paddingTop: "24px", paddingBottom: "40px" }}
        >
          YEET
        </div>
        <nav className="flex flex-col gap-1" style={{ paddingTop: "60px" }}>
          <SidebarButton
            label="Pending"
            isActive={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
          />
          <SidebarButton
            label="Calendar"
            isActive={activeTab === "calendar"}
            onClick={() => setActiveTab("calendar")}
          />
          <SidebarButton
            label="Upcoming"
            isActive={activeTab === "upcoming"}
            onClick={() => setActiveTab("upcoming")}
          />
        </nav>
      </div>

      <div className="flex-1 bg-[#1e1e2e] overflow-y-auto">
        <Calendar onDateSelect={setSelectedDate} tasks={tasks} />
      </div>

      <TaskPanel
        mode={activeTab}
        selectedDate={effectiveSelectedDate}
        tasks={panelTasks}
        allTasks={tasks}
        setTasks={setTasks}
      />
    </div>
  );
}

export default App;
