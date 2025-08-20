type InputProps = {
  label: string;
  name: string;
  showLabel?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tabIndex?: number;
};

const Input: React.FC<InputProps> = ({
  label,
  name,
  showLabel = true,
  onChange,
  tabIndex,
}) => {
  return (
    <div className="flex flex-row w-full">
      {showLabel && (
        <label htmlFor={name} className="text-lg font-semibold mb-1 mr-6">
          {label}
        </label>
      )}
      <input
        type="text"
        id={name}
        className="border border-gray-300 rounded-md text-center text-xl"
        onChange={onChange}
        tabIndex={tabIndex}
      />
    </div>
  );
};

export default Input;
