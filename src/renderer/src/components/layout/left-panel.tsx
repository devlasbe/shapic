import ImageList from "../image-list";
import appIcon from "../../../../../resources/icon.png";

const LeftPanel = () => {
  return (
    <div className="flex flex-col w-47.5 bg-card border-r border-border shrink-0">
      <div className="flex items-center h-11 px-3 border-b border-border">
        <div className="flex items-center gap-2">
          <img src={appIcon} alt="Shapic" className="w-5 h-5 rounded-md" />
          <span className="text-xs font-semibold text-text-primary tracking-tight">Shapic</span>
        </div>
      </div>
      <ImageList />
    </div>
  );
};

export default LeftPanel;
