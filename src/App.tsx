import { useState } from 'react'

export default function App() {
  const [primeNumbers, setPrimeNumbers] = useState<number[]>([])
  const [offset, setOffset] = useState(0)
  
  const handleFetchPrimeNumber = () => {
    fetch(`https://prime-numbers.toof.workers.dev/?offset=${offset}`)
      .then(response => response.json())
      .then((data: { primes: number[] }) => {
        setPrimeNumbers((prev: number[]) => [...prev, ...data.primes]);
        setOffset((prev: number) => prev + 10);
      });
  }

  return (
    <>
      <h1>Prime Numbers</h1>
      <ul>
        {primeNumbers.map((prime) => (
          <li key={prime}>{prime}</li>
        ))}
      </ul>
      <button onClick={handleFetchPrimeNumber}>Add Prime Number</button>
    </>
  )
}
