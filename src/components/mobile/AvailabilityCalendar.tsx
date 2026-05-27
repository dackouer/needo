import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";

const weekLabels = ["日", "月", "火", "水", "木", "金", "土"];

function isAvailableDay(year: number, month: number, day: number) {
  const isPastInitialDate = year > 2026 || month > 3 || day >= 14;

  return isPastInitialDate && (day + month) % 5 !== 0;
}

function formatDateLabel(year: number, month: number, selectedDay: number) {
  const week = weekLabels[new Date(year, month, selectedDay).getDay()];

  return `${month + 1} 月 ${selectedDay} 日（${week}）`;
}

export function AvailabilityCalendar({
  title,
  selectedDay,
  onSelectDay,
  selectedDate,
  onSelectDate,
  people,
  onPeopleChange,
  time,
  onTimeChange,
  timeOptions
}: {
  title: string;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  people: string;
  onPeopleChange: (people: string) => void;
  time: string;
  onTimeChange: (time: string) => void;
  timeOptions: string[];
}) {
  const [viewDate, setViewDate] = useState(() => new Date(2026, 3, 1));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const selectedYear = selectedDate?.getFullYear() ?? year;
  const selectedMonth = selectedDate?.getMonth() ?? month;
  const currentSelectedDay = selectedDate?.getDate() ?? selectedDay;
  const selectedDaysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const safeSelectedDay = Math.min(currentSelectedDay, selectedDaysInMonth);
  const monthCells = useMemo(
    () => [
      ...Array.from({ length: firstWeekday }, () => ({ day: 0, ghost: true })),
      ...Array.from({ length: daysInMonth }, (_, index) => ({ day: index + 1, ghost: false }))
    ],
    [daysInMonth, firstWeekday]
  );

  return (
    <div className="availability-calendar text-ink">
      <div className="grid grid-cols-[96px,1fr] items-center gap-3">
        <h3 className="text-lg font-black text-ink/72">{title}</h3>
        <button className="focus-ring flex h-12 items-center justify-between border border-line bg-white px-5 text-left text-xl font-black" type="button">
          <span>{formatDateLabel(selectedYear, selectedMonth, safeSelectedDay)}</span>
          <span className="text-xs text-ink/35">▲</span>
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between px-1">
        <button
          className="grid h-10 w-10 place-items-center text-3xl font-black text-ink/35"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          type="button"
          aria-label="上个月"
        >
          ‹
        </button>
        <h4 className="text-2xl font-black text-ink/72">{year} 年 {month + 1} 月</h4>
        <button
          className="grid h-10 w-10 place-items-center text-3xl font-black text-ink/35"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          type="button"
          aria-label="下个月"
        >
          ›
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 text-center text-base font-black">
        {weekLabels.map((label, index) => (
          <span className={cn(index === 0 && "text-coral", index === 6 && "text-[#3a91df]", index !== 0 && index !== 6 && "text-ink/65")} key={label}>
            {label}
          </span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-y-2 text-center">
        {monthCells.map((cell, index) => {
          const weekday = index % 7;
          const selectable = !cell.ghost && isAvailableDay(year, month, cell.day);
          const selected = selectable && cell.day === currentSelectedDay && year === selectedYear && month === selectedMonth;

          return (
            <button
              className={cn(
                "focus-ring mx-auto flex h-[70px] w-[54px] flex-col items-center justify-start pt-1 font-black transition",
                selected && "bg-lemon/30 ring-1 ring-lemon",
                cell.ghost && "pointer-events-none opacity-35",
                !selectable && !cell.ghost && "text-ink/30",
                weekday === 0 && !cell.ghost && "text-coral",
                weekday === 6 && !cell.ghost && "text-[#3a91df]"
              )}
              disabled={!selectable}
              key={`${cell.day}-${index}`}
              onClick={() => {
                onSelectDay(cell.day);
                onSelectDate?.(new Date(year, month, cell.day));
              }}
              type="button"
            >
              <span className={cn("text-2xl leading-none", cell.ghost ? "text-ink/28" : "text-current")}>{cell.ghost ? "" : cell.day}</span>
              {cell.day === 13 && !cell.ghost ? <span className="mt-2 text-sm text-ink/35">TEL</span> : null}
              {selectable ? <span className="mt-2 h-6 w-6 rounded-full border-[5px] border-[#f08a00]" /> : <span className="mt-2 text-xl text-ink/20">－</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3 border-t border-line pt-4">
        <label className="grid grid-cols-[96px,1fr] items-center gap-3">
          <span className="text-lg font-black text-ink/72">人数</span>
          <span className="flex h-12 items-center justify-between border border-line bg-white px-5 text-lg font-black">
            <select className="min-w-0 flex-1 appearance-none bg-transparent outline-none" onChange={(event) => onPeopleChange(event.target.value)} value={people}>
              {["1名", "2名", "3名", "4名"].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <span className="text-xs text-ink/35">▼</span>
          </span>
        </label>
        <label className="grid grid-cols-[96px,1fr] items-center gap-3">
          <span className="text-lg font-black text-ink/72">时间</span>
          <span className="flex h-12 items-center justify-between border border-line bg-white px-5 text-lg font-black">
            <select className="min-w-0 flex-1 appearance-none bg-transparent outline-none" onChange={(event) => onTimeChange(event.target.value)} value={time}>
              {timeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <span className="text-xs text-ink/35">▼</span>
          </span>
        </label>
      </div>
    </div>
  );
}
