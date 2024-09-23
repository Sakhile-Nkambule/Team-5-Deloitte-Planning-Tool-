import React from 'react'
import ProjectMetricsCard from '../componets/ProjectMetricsCard'
import { faArrowUp, faPercent, faTasks, faUser } from '@fortawesome/free-solid-svg-icons'
import { faMoneyBill } from '@fortawesome/free-solid-svg-icons/faMoneyBill'
import { FaPercent } from 'react-icons/fa'
import { faClock } from '@fortawesome/free-solid-svg-icons/faClock'
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
const DashboardHearder = () => {
  return (
    <>
      {/* Header */}
      <div className="relative bg-lime-400 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div>
            {/* Card stats */}
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <ProjectMetricsCard
                  statSubtitle="Total Hours"
                  statTitle="23"
                  statArrow="up"
                  statPercent="3.48"
                  statPercentColor="text-emerald-500"
                  statDescription="Of Total Hours"
                  statIconName={faClock}
                  statIconColor="bg-red-500"
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <ProjectMetricsCard
                  statSubtitle="Task's Outstanding"
                  statTitle="10"
                  statArrow="down"
                  statPercent="3.48"
                  statPercentColor="text-red-500"
                  statDescription="Of Total Task's"
                  statIconName={faTasks}
                  statIconColor="bg-orange-500"
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <ProjectMetricsCard
                  statSubtitle="Task's Completed"
                  statTitle="12"
                  statArrow="down"
                  statPercent="1.10"
                  statPercentColor="text-orange-500"
                  statDescription="Of Total Task's"
                  statIconName={faCheck}
                  statIconColor="bg-lime-500"
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <ProjectMetricsCard
                  statSubtitle="PERFORMANCE"
                  statTitle="49,65%"
                  statArrow="up"
                  statPercent="12"
                  statPercentColor="text-emerald-500"
                  statDescription="Since last month"
                  statIconName={faPercent}
                  statIconColor="bg-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardHearder