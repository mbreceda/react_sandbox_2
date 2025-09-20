interface ProgressBarProps {
  progress: number;
}

const ProgressBar = ({ progress = 0 }: ProgressBarProps) => {
  return (
    <div className="h-[20px] w-[90%] bg-gray-300 rounded-full overflow-hidden">
      <div
        className="bg-blue-600 h-full rounded-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
