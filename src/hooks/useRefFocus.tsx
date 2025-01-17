import { useRef, RefObject } from "react";

function BasicUseRefInput() {
  const inputRef: RefObject<HTMLInputElement> = useRef(null);

  const handleClick = () => {
    // Focus the input element
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <input
        ref={inputRef}
        type="text"
        placeholder="Focus me with the button"
        className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleClick}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Focus Input
      </button>
    </div>
  );
}

export default BasicUseRefInput;
