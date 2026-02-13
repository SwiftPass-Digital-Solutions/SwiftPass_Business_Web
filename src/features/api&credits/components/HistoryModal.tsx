import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useAppSelector } from "@/store";

interface Column {
  key: string;
  label: string;
}

type HistoryItem = {
  id?: number;
  credits: number;
  amount?: number;
  balanceAfter: number;
  transactionType: string;
  description?: string;
  createdAt: string;
  [k: string]: any;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenBuyCredits?: () => void;
  history: HistoryItem[];
  columns: Column[];
  pageSize?: number;
};

// Move formatCell outside component to avoid recreation on every render
const formatCell = (row: HistoryItem, key: string) => {
  if (key === "date") {
    return new Date(row.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  if (key === "action") return row.transactionType;
  if (key === "credits") return `+${row.credits}`;
  if (key === "balance") return row.balanceAfter?.toLocaleString?.() ?? row.balanceAfter;
  return row[key as keyof HistoryItem] ?? "";
};

// Mobile Transaction Card Component
const TransactionCard = React.memo(({ row }: { row: HistoryItem }) => {
  const date = new Date(row.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="text-sm font-medium text-gray-900 mb-3 [font-family:'Archivo',Helvetica]">
        {date}
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 [font-family:'Archivo',Helvetica]">Action</span>
          <span className="text-sm text-gray-900 [font-family:'Archivo',Helvetica]">{row.transactionType}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 [font-family:'Archivo',Helvetica]">Credits</span>
          <span className="text-sm text-gray-900 [font-family:'Archivo',Helvetica]">+{row.credits}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 [font-family:'Archivo',Helvetica]">Balance</span>
          <span className="text-sm text-gray-900 [font-family:'Archivo',Helvetica]">{row.balanceAfter?.toLocaleString?.() ?? row.balanceAfter}</span>
        </div>
      </div>
    </div>
  );
});

TransactionCard.displayName = "TransactionCard";

// Pagination component with proper typing
interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = useMemo(() => {
    const result: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
    } else {
      result.push(1);
      if (page > 3) result.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) result.push(i);
      if (page < totalPages - 2) result.push("...");
      result.push(totalPages);
    }
    return result;
  }, [page, totalPages]);

  // Memoize button click handlers
  const handlePrevious = useCallback(() => {
    onChange(page - 1);
  }, [onChange, page]);

  const handleNext = useCallback(() => {
    onChange(page + 1);
  }, [onChange, page]);

  return (
    <div className="mt-6 sm:mt-8 flex items-center justify-between gap-4">
      <button
        onClick={handlePrevious}
        disabled={page <= 1}
        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        aria-label="Previous page"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <button
              key={idx}
              onClick={() => onChange(p)}
              className={`min-w-[40px] sm:min-w-[48px] h-10 sm:h-12 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm [font-family:'Archivo',Helvetica] transition-all active:scale-95 ${
                p === page ? "bg-blue-600 text-white shadow-sm" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ) : (
            <div key={idx} className="w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center text-gray-400 [font-family:'Archivo',Helvetica] text-xs sm:text-sm">
              {p}
            </div>
          )
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={page >= totalPages}
        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
        aria-label="Next page"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};

const PaginationMemo = React.memo(Pagination);
PaginationMemo.displayName = "Pagination";

// Memoized Table Row Component
const TableRow = React.memo(({ 
  row, 
  columns 
}: { 
  row: HistoryItem; 
  columns: Column[];
}) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
    {columns.map((column) => (
      <td key={column.key} className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-normal text-gray-700 [font-family:'Archivo',Helvetica] tracking-[-0.42px]">
        {formatCell(row, column.key)}
      </td>
    ))}
  </tr>
));

TableRow.displayName = "TableRow";

const HistoryModal: React.FC<Props> = ({ open, onClose, onOpenBuyCredits, history = [], columns = [], pageSize = 12 }) => {
  const [page, setPage] = useState(1);
  const [isLarge, setIsLarge] = useState(false);
  const { sidebarOpen } = useAppSelector((state) => state.app);
  const sideBarWidth = useMemo(() => (sidebarOpen ? 303 : 80), [sidebarOpen]);

  // Debounced resize handler
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    const onResize = () => {
      // Clear existing timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      // Set new timeout to debounce resize events
      resizeTimeoutRef.current = setTimeout(() => {
        setIsLarge(window.innerWidth >= 1024);
      }, 150);
    };
    
    // Initial check
    onResize();
    
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((history?.length || 0) / pageSize)), [history?.length, pageSize]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return history?.slice(start, start + pageSize) || [];
  }, [history, page, pageSize]);

  const goToPage = useCallback(
    (p: number) => {
      if (p < 1) p = 1;
      if (p > totalPages) p = totalPages;
      setPage(p);
    },
    [totalPages]
  );

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(totalPages);
  }, [totalPages, page]);

  const handleBuyCreditsClick = useCallback(() => {
    if (onOpenBuyCredits) {
      onOpenBuyCredits();
    }
  }, [onOpenBuyCredits]);

  // Memoize table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => {
    return paged.map((row, index) => (
      <TableRow key={row.id || index} row={row} columns={columns} />
    ));
  }, [paged, columns]);

  // Memoize mobile cards
  const mobileCards = useMemo(() => {
    return paged.map((row, index) => (
      <TransactionCard key={row.id || index} row={row} />
    ));
  }, [paged]);

  if (!open) return null;

  const sidebarOffset = `${sideBarWidth}px`;
  const wrapperStyle: React.CSSProperties = isLarge && sidebarOffset ? { marginLeft: sidebarOffset, maxWidth: `calc(100% - ${sidebarOffset})` } : {};

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 transition-opacity duration-200"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { 
              opacity: 0;
              transform: translateY(-10px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <div 
        className="w-full h-full bg-white lg:bg-white overflow-y-auto" 
        style={{ ...wrapperStyle, animation: 'slideIn 0.3s ease-out' }}
      >
        {/* Desktop Header */}
        <div className="hidden lg:block sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 active:scale-95 transition-all"
                  aria-label="Go back"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 [font-family:'Archivo',Helvetica]">Billing & History</h2>
                  <p className="text-sm text-gray-500 [font-family:'Archivo',Helvetica]">View your full billing history</p>
                </div>
              </div>

              <button 
                onClick={handleBuyCreditsClick}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-blue-600 rounded-xl border border-solid border-blue-400 shadow-[0px_2px_0px_#dcdcdc] hover:bg-blue-700 active:scale-95 transition-all"
              >
                <span className="font-medium text-white text-sm tracking-[-0.42px] leading-[20.3px] [font-family:'Archivo',Helvetica]">Buy more credits</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 bg-white z-10 px-4 py-4">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white hover:bg-gray-50 active:scale-95 transition-all"
              aria-label="Go back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          
          <p className="text-sm text-gray-400 [font-family:'Archivo',Helvetica] mb-4 px-1">
            View your full billing history
          </p>

          <button 
            onClick={handleBuyCreditsClick}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
          >
            <span className="font-medium text-white text-base [font-family:'Archivo',Helvetica]">Buy more credits</span>
          </button>
        </div>

        {/* Desktop Content */}
        <div className="hidden lg:block max-w-7xl mx-auto px-6 py-8">
          <div className="w-full overflow-x-auto bg-white rounded-2xl sm:rounded-[28px] border border-solid border-[#efefef] shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-[#fbfbfb] border-b border-gray-200">
                  {columns.map((column) => (
                    <th key={column.key} className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-normal text-gray-500 [font-family:'Archivo',Helvetica] tracking-[-0.42px]">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <img className="w-20 h-20 sm:w-24 sm:h-24" alt="Receipt icon indicating no billing history" src="https://c.animaapp.com/0yfnJNzQ/img/fluent-color-receipt-32.svg" loading="lazy" />
                        <p className="[font-family:'Archivo',Helvetica] font-medium text-gray-900 text-base sm:text-lg tracking-[-0.54px]">No billing history</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tableRows
                )}
              </tbody>
            </table>
          </div>

          {paged.length > 0 && <PaginationMemo page={page} totalPages={totalPages} onChange={goToPage} />}
        </div>

        {/* Mobile Content */}
        <div className="lg:hidden px-4 py-4 min-h-screen">
          {paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <img className="w-20 h-20" alt="Receipt icon indicating no billing history" src="https://c.animaapp.com/0yfnJNzQ/img/fluent-color-receipt-32.svg" loading="lazy" />
              <p className="[font-family:'Archivo',Helvetica] font-medium text-white text-base tracking-[-0.54px]">No billing history</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {mobileCards}
            </div>
          )}

          {paged.length > 0 && <PaginationMemo page={page} totalPages={totalPages} onChange={goToPage} />}
        </div>
      </div>
    </div>
  );
};

const HistoryModalMemo = React.memo(HistoryModal);
export default HistoryModalMemo;