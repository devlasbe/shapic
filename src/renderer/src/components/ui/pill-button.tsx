import { cn } from "../../utils/cn";

type PillButtonPropsType = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

const PillButton = ({ active, onClick, children }: PillButtonPropsType) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 px-4 py-1.5 text-xs font-medium rounded-full border transition-all duration-150 cursor-pointer",
        active
          ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
          : "bg-card text-text-secondary border-border hover:border-primary/40 hover:text-primary",
      )}
    >
      {children}
    </button>
  );
};

export default PillButton;
