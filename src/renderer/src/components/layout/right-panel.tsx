import Settings from "../settings";

const RightPanel = () => {
  return (
    <div className="flex flex-col w-66 bg-card border-l border-border shrink-0">
      <Settings />
    </div>
  );
};

export default RightPanel;
