import dayjs from "dayjs";
import React, { useState } from "react";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";

export default function Calendar({occupiedDates}) {
  
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const currentDate = dayjs();
  const [today, setToday] = useState(currentDate);
  const [selectDate, setSelectDate] = useState(currentDate);
  

  // Utility function to generate the dates for the calendar
  const generateDate = (month = dayjs().month(), year = dayjs().year()) => {
    const firstDateOfMonth = dayjs().year(year).month(month).startOf("month");
    const lastDateOfMonth = dayjs().year(year).month(month).endOf("month");
    const arrayOfDate = [];

    // Create prefix date (for days from the previous month)
    for (let i = 0; i < firstDateOfMonth.day(); i++) {
      const date = firstDateOfMonth.day(i);
      arrayOfDate.push({
        currentMonth: false,
        date,
      });
    }

    // Generate dates for the current month
    for (let i = firstDateOfMonth.date(); i <= lastDateOfMonth.date(); i++) {
      arrayOfDate.push({
        currentMonth: true,
        date: firstDateOfMonth.date(i),
        today: firstDateOfMonth.date(i).toDate().toDateString() === dayjs().toDate().toDateString(),
      });
    }

    // Fill remaining spaces with dates from the next month
    const remaining = 42 - arrayOfDate.length;
    for (let i = lastDateOfMonth.date() + 1; i <= lastDateOfMonth.date() + remaining; i++) {
      arrayOfDate.push({
        currentMonth: false,
        date: lastDateOfMonth.date(i),
      });
    }

    return arrayOfDate;
  };

  // Utility function to handle conditional class names
  const cn = (...classes) => {
    return classes.filter(Boolean).join(" ");
  };

  // Month names
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

  return (
    <div className="flex flex-col justify-center mx-auto h-screen">
      <div className="w-96 ">
        <div className="flex justify-between items-center">
          <h1 className="select-none font-semibold">
            {months[today.month()]}, {today.year()}
          </h1>
          <div className="flex gap-10 items-center">
            <GrFormPrevious
              className="w-5 h-5 cursor-pointer hover:scale-105 transition-all"
              onClick={() => {
                setToday(today.subtract(1, "month"));
              }}
            />
            <h1
              className="cursor-pointer hover:scale-105 transition-all"
              onClick={() => {
                setToday(currentDate);
              }}
            >
              Today
            </h1>
            <GrFormNext
              className="w-5 h-5 cursor-pointer hover:scale-105 transition-all"
              onClick={() => {
                setToday(today.add(1, "month"));
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, index) => (
            <h1
              key={index}
              className="text-sm text-center h-14 w-14 grid place-content-center text-gray-500 select-none"
            >
              {day}
            </h1>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {generateDate(today.month(), today.year()).map(({ date, currentMonth, today }, index) => (
            <div key={index} className="p-2 text-center h-14 grid place-content-center text-sm border-t">
              <h1
                className={cn(
                  currentMonth ? "" : "text-gray-400",
                  today ? "bg-lime-500 text-white" : "",
                  occupiedDates.some(occDate => new Date(occDate).toDateString() === date.toDate().toDateString())? "bg-red-500 text-white" : "",
                  selectDate.toDate().toDateString() === date.toDate().toDateString()
                    ? "bg-black text-white"
                    : "",
                  "h-10 w-10 rounded-full grid place-content-center hover:bg-black hover:text-white transition-all cursor-pointer select-none"
                )}
                onClick={() => {
                  setSelectDate(date);
                }}
              >
                {date.date()}
              </h1>
            </div>
          ))}
        </div>
      </div>
      <div className="h-96 w-96 sm:px-5 mt-5">
        <h1 className="font-semibold">
          Schedule for {selectDate.toDate().toDateString()}
        </h1>
        <p className="text-gray-400">No meetings for today.</p>
      </div>
    </div>
  );
}