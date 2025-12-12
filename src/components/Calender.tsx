import { useState } from "react";
import type { Task } from "../App";

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  date: Date;
}

interface CalendarProps {
  onDateSelect: (date: Date) => void;
  tasks: Task[];
}

export default function Calendar({ onDateSelect, tasks }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const today = new Date();

  const monthNames = [
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

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const generateCalendarDays = (): CalendarDay[] => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: CalendarDay[] = [];

    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const isToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date): boolean => {
    return selectedDate
      ? date.toDateString() === selectedDate.toDateString()
      : false;
  };

  const handleDayClick = (item: CalendarDay) => {
    setSelectedDate(item.date);
    onDateSelect(item.date);
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const getDayTaskInfo = (date: Date) => {
    const dayTasks = tasks.filter((t) => t.date === date.toDateString());

    if (dayTasks.length === 0) return { count: 0, color: "" };

    let color = "#a6e3a1"; // Less
    if (dayTasks.some((t) => t.difficulty === "Important")) {
      color = "#f38ba8";
    } else if (dayTasks.some((t) => t.difficulty === "Moderate")) {
      color = "#f9e2af";
    }

    return { count: dayTasks.length, color };
  };

  return (
    <div
      className="h-full flex flex-col text-[#cdd6f4]"
      style={{
        paddingLeft: "10px",
        paddingRight: "10px",
        paddingTop: "10px",
        paddingBottom: "10px",
      }}
    >
      {/* Header */}
      <div
        className="flex justify-between items-center mb-5"
        style={{ paddingLeft: "30px", paddingBottom: "20px" }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="bg-transparent border-none text-[#cdd6f4] text-xl cursor-pointer px-2 hover:text-[#f5c2e7] transition-colors"
          >
            ←
          </button>
          <h2
            className="text-lg font-semibold text-[#cdd6f4]"
            style={{ minWidth: "200px", textAlign: "center" }}
          >
            {monthNames[month]}, {year}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="bg-transparent border-none text-[#cdd6f4] text-xl cursor-pointer px-2 hover:text-[#f5c2e7] transition-colors"
          >
            →
          </button>
        </div>
        <button
          onClick={() => {
            const now = new Date();
            setCurrentDate(now);
            setSelectedDate(now);
            onDateSelect(now);
          }}
          style={{
            background: "#45475a",
            border: "none",
            color: "#cdd6f4",
            padding: "12px 24px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "16px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#585b70")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#45475a")}
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-rows-[auto_1fr] gap-[1px] bg-[#45475a] border border-[#45475a] rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-[1px] bg-[#45475a]">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="bg-[#1e1e2e] p-3 text-center text-[#89b4fa] text-sm font-semibold"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-6 gap-[1px] bg-[#45475a]">
          {generateCalendarDays().map((item, index) => {
            const taskInfo = getDayTaskInfo(item.date);
            const hasTasks = taskInfo.count > 0;
            return (
              <div
                key={index}
                onClick={() => handleDayClick(item)}
                className={`
                  bg-[#1e1e2e] p-5 text-center
                  flex items-start justify-center cursor-pointer
                  hover:bg-[#313244] transition-colors relative
                  ${!item.isCurrentMonth && "text-[#6c7086]"}
                  ${item.isCurrentMonth && "text-[#cdd6f4]"}
                  ${
                    isToday(item.date) &&
                    item.isCurrentMonth &&
                    "bg-[#89b4fa] text-[#1e1e2e] font-bold"
                  }
                  ${
                    isSelected(item.date) &&
                    !isToday(item.date) &&
                    item.isCurrentMonth &&
                    "ring-2 ring-[#f5c2e7]"
                  }
                `}
              >
                {item.day}
                {hasTasks && (
                  <div
                    style={{
                      position: "absolute",
                      right: "6px",
                      bottom: "6px",
                      minWidth: "20px",
                      height: "20px",
                      borderRadius: "999px",
                      background: taskInfo.color,
                      color: "#1e1e2e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "0 6px",
                    }}
                    title={`${taskInfo.count} task(s)`}
                  >
                    {taskInfo.count}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
