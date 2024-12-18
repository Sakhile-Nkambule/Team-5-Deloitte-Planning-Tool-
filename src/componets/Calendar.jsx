import dayjs from "dayjs";
import React, { useState } from "react";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";

export default function Calendar({ tasks, projectDateRange }) {
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
        today:
          firstDateOfMonth.date(i).toDate().toDateString() ===
          dayjs().toDate().toDateString(),
      });
    }

    // Fill remaining spaces with dates from the next month
    const remaining = 42 - arrayOfDate.length;
    for (
      let i = lastDateOfMonth.date() + 1;
      i <= lastDateOfMonth.date() + remaining;
      i++
    ) {
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

  // Check if a date is within the project date range
  const isDateInRange = (date) => {
    const startDate = dayjs(projectDateRange?.start);
    const endDate = dayjs(projectDateRange?.end);
    return date.isAfter(startDate) && date.isBefore(endDate);
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

  // Calculate the total hours for the selected date
  const getTotalHoursForSelectedDate = (DueDate) => {
    const selectedDateString = DueDate.toDate().toDateString();
    const tasksForSelectedDate = tasks.filter(
      (task) => new Date(task.DueDate).toDateString() === selectedDateString
    );

    const totalHours = tasksForSelectedDate.reduce((acc, task) => {
      const hours = parseFloat(task.Hours); // Ensure hours are parsed as float
      return acc + (isNaN(hours) ? 0 : hours); // Add hours only if they are valid numbers
    }, 0);

    return totalHours;
  };

  // Calculate available hours (8 - total assigned hours)
  const getAvailableHours = (totalHours) => {
    return 8 - totalHours;
  };

  // Determine the color based on available hours
  const getAvailabilityColor = (availableHours) => {
    if (availableHours === 8) {
      return "bg-white-100"; // Fully available
    } else if (availableHours > 0) {
      return "bg-red-200"; // Partially available
    } else {
      return "bg-red-500"; // Not available
    }
  };

  return (
    <div className="flex flex-col justify-center mx-auto h-screen">
      <div className="w-96">
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
          {generateDate(today.month(), today.year()).map(
            ({ date, currentMonth, today }, index) => {
              const totalHours = getTotalHoursForSelectedDate(date);
              const availableHours = getAvailableHours(totalHours);

              const hasTasks = tasks.some(
                (task) =>
                  new Date(task.DueDate).toDateString() ===
                  date.toDate().toDateString()
              );

              return (
                <div
                  key={index}
                  className="p-2 text-center h-14 grid place-content-center text-sm border-t relative border-2 rounded-xl shadow-lg hover:shadow-lg 
             transform hover:scale-105 transition-all "
                >
                  {/* Blue line for project date range */}
                  {isDateInRange(date) && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 "></div>
                  )}
                  <h1
                    className={cn(
                      currentMonth ? "" : "text-gray-400",
                      today ? "bg-lime-500 text-white font-bold" : "",
                      getAvailabilityColor(availableHours), // Apply red or pink color if tasks exist
                      selectDate.toDate().toDateString() ===
                        date.toDate().toDateString()
                        ? "text-black font-bold border border-gray-500" // Add border for selected date
                        : "",
                      "h-10 w-10 rounded-full grid place-content-center hover:bg-black hover:text-white transition-all cursor-pointer select-none relative z-10" // Added z-10 for stacking order
                    )}
                    onClick={() => {
                      setSelectDate(date);
                    }}
                  >
                    {date.date()}
                  </h1>
                </div>
              );
            }
          )}
        </div>
      </div>
      <div className="w-96 sm:px-5">
        <h1 className="font-semibold">
          Schedule for {selectDate.toDate().toDateString()}
        </h1>
        <p className="text-gray-400">
          {tasks.some(
            (task) =>
              new Date(task.DueDate).toDateString() ===
              selectDate.toDate().toDateString()
          )
            ? `Total Assigned hours: ${getTotalHoursForSelectedDate(
                selectDate
              )}`
            : "No tasks for today."}
        </p>
        <p className="text-gray-400">
          {`Available hours: ${getAvailableHours(
            getTotalHoursForSelectedDate(selectDate)
          )}`}
        </p>
      </div>
      {/* Key for colors at the bottom */}
      <div className="pl-5 flex flex-col">
        <h2 className="font-semibold">Key:</h2>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border border-gray-400 bg-gray-50"></div>
          <p>Fully Available</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-red-200"></div>
          <p>Partially Available</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-red-500"></div>
          <p>Unavailable</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-4 bg-blue-500"></div>
          <p>Project Date Range</p>
        </div>
      </div>
    </div>
  );
}
