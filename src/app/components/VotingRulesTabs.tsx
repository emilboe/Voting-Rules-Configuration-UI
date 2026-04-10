import { NavLink } from "react-router-dom";
import { cn } from "./ui/utils";

type VotingRulesTabsProps = {
  className?: string;
};

export function VotingRulesTabs({ className }: VotingRulesTabsProps) {
  return (
    <div
      className={cn(
        "flex shadow-sm rounded-md overflow-hidden w-fit",
        className,
      )}
    >
      <NavLink
        to="/voting-rules"
        className={({ isActive }) =>
          cn(
            "px-5 py-2.5 text-sm font-medium border border-gray-300 min-w-[7rem] text-center transition-colors rounded-l-md",
            isActive
              ? "border-blue-500 bg-blue-500 text-white z-[1]"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50",
          )
        }
      >
        Rules
      </NavLink>
      <NavLink
        to="/licensee-interest"
        className={({ isActive }) =>
          cn(
            "px-5 py-2.5 text-sm font-medium border border-gray-300 min-w-[7rem] text-center -ml-px transition-colors rounded-r-md",
            isActive
              ? "border-blue-500 bg-blue-500 text-white"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50",
          )
        }
      >
        Shares
      </NavLink>
    </div>
  );
}
