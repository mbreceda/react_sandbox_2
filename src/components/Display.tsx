import CountdownContainer from "./CountdownContainer";

function Display() {
  const initialCountdown = 15; // Initialize with 15 seconds

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-md mx-auto mt-10 p-4">
      <CountdownContainer
        initialValue={initialCountdown}
        autoStart={false}
        onComplete={() => console.log("Countdown complete!")}
        onDecrement={(value) => console.log("Countdown decremented to:", value)}
      />
    </div>
  );
}

export default Display;
