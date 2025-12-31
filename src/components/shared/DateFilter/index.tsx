import { useState } from "react";
import { Calendar } from "lucide-react";

type FilterOption = "today" | "yesterday" | "week" | "month" | "custom";

export default function DateFilter() {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("month");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleFilterClick = (filter: FilterOption) => {
    setSelectedFilter(filter);
    if (filter !== "custom") {
      setShowDatePicker(false);
    }
  };

  const handleCustomDateClick = () => {
    setSelectedFilter("custom");
    setShowDatePicker(!showDatePicker);
  };

  const formatDateRange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const end = new Date(endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return `${start} - ${end}`;
    }
    return "Select date";
  };

  return (
    <div className=" font-bricolage">
      <div className="flex items-center gap-3">
        <span className="text-[#5A5A5A] font-normal text-[15px]">Filter:</span>

        <div className="flex items-center gap-2 bg-transparent border border-[#E5E7EB] rounded-full p-2">
          <button
            onClick={() => handleFilterClick("today")}
            className={`px-3.5 py-1 rounded-full text-[13px] font-normal transition-all ${
              selectedFilter === "today"
                ? "bg-[#072760] text-white"
                : "text-[#6C757D] hover:text-gray-900"
            }`}
          >
            Today
          </button>

          <button
            onClick={() => handleFilterClick("yesterday")}
            className={`px-3.5 py-1 rounded-full text-[13px] font-normal transition-all ${
              selectedFilter === "yesterday"
                ? "bg-[#072760] text-white"
                : "text-[#6C757D] hover:text-gray-900"
            }`}
          >
            Yesterday
          </button>

          <button
            onClick={() => handleFilterClick("week")}
            className={`px-3.5 py-1 rounded-full text-[13px] font-normal transition-all  ${
              selectedFilter === "week"
                ? "bg-[#072760] text-white"
                : "text-[#6C757D] hover:text-gray-900"
            }`}
          >
            This week
          </button>

          <button
            onClick={() => handleFilterClick("month")}
            className={`px-3.5 py-1 rounded-full text-[13px] font-normal transition-all  ${
              selectedFilter === "month"
                ? "bg-[#072760] text-white"
                : "text-[#6C757D] hover:text-gray-900"
            }`}
          >
            This month
          </button>

          <div className="relative">
            <button
              onClick={handleCustomDateClick}
              className={`flex items-center gap-2 px-3.5 py-1 rounded-full text-[13px] font-normal transition-all  ${
                selectedFilter === "custom"
                  ? "bg-[#072760] text-white"
                  : "text-[#6C757D] hover:text-gray-900"
              }`}
            >
              <Calendar size={16} />
              {selectedFilter === "custom" && startDate && endDate
                ? formatDateRange()
                : "Select date"}
            </button>

            {showDatePicker && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10 min-w-[300px]">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="w-full bg-blue-900 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
