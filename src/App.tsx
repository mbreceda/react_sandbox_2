import "./App.css";

const twoFer = (person: string = 'you'): string => {
  return `one for ${person}, one for me`;
}

const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0)|| year % 400 === 0 
}

const printName = (name: { first: string, last: string }): string => {
  return `${name.first} ${name.last}`
}

// Creating a primitive type
type myNum = number;
const myNum: myNum = 5;

// Interception type
type Circle = {
  radius: number;
}

type Colorful = {
  color: string;
}

type ColorfuelCircle = Circle & Colorful;

const happyFace: ColorfuelCircle = {
  radius: 42,
  color: 'yellow'
}

// Union Types
type Point = {
  x: number;
  y: number;
}

type Loc = {
  lat: number;
  long: number;
}

let coordinates: Point | Loc = { x: 12, y: 34 };
coordinates = { lat: 12, long: 34 };

// Type narrowing
function calculateTax(price: number | string, tax: number): number { 
  if (typeof price === 'string') {
    price = parseFloat(price);
  }
  return price * tax;
}

// Union types and Arrays
const stuff: (number | string)[] = [1, 'hello', 2, 'world'];

// Literal types
const literalTypes: 'foo' | 'bar' = 'foo';

// Tuples
const tuple: [number, number, string] = [1, 2, '3'];

function App() {


  return (
    <>
      {twoFer()}
      <br />
      {twoFer('Alice')}
      <br />
      {String(isLeapYear(2012))}
      <br />
      {String(isLeapYear(2013))}
      <br />
      {printName({ first: 'John', last: 'Doe' })}
      <br />
      <pre>{JSON.stringify(happyFace)}
      </pre>
      <pre>{JSON.stringify(coordinates)}</pre>
      {calculateTax(10, 0.2)}
      <br />
      {stuff}
      <br />
      {literalTypes}
      <br />
      {tuple}
    </>
  );
}

export default App;
