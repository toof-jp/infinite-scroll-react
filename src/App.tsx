import { useCallback, useEffect, useRef, useState } from 'react'

type PrimeResponse = {
  primes: number[]
}

export default function App() {
  const [primeNumbers, setPrimeNumbers] = useState<number[]>([])
  const [isFetching, setIsFetching] = useState(false)

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const offsetRef = useRef(0)
  const isFetchingRef = useRef(false)
  const hasMoreRef = useRef(true)
  const sentinelVisibleRef = useRef(false)

  const fetchPrimeNumbers = useCallback(() => {
    if (!hasMoreRef.current || isFetchingRef.current) {
      return
    }

    isFetchingRef.current = true
    setIsFetching(true)

    const offset = offsetRef.current

    fetch(`https://prime-numbers.toof.workers.dev/?offset=${offset}`)
      .then((response) => response.json() as Promise<PrimeResponse>)
      .then((data) => {
        if (data.primes.length === 0) {
          hasMoreRef.current = false
          return
        }

        setPrimeNumbers((prev) => [...prev, ...data.primes])
        offsetRef.current += data.primes.length
      })
      .catch((error) => {
        console.error('Failed to fetch prime numbers', error)
      })
      .finally(() => {
        isFetchingRef.current = false
        setIsFetching(false)

        if (hasMoreRef.current && sentinelVisibleRef.current) {
          // Sentinel is still on screen, so immediately queue the next page.
          fetchPrimeNumbers()
        }
      })
  }, [])

  useEffect(() => {
    fetchPrimeNumbers()
  }, [fetchPrimeNumbers])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== sentinelRef.current) {
            return
          }

          sentinelVisibleRef.current = entry.isIntersecting

          if (entry.isIntersecting) {
            fetchPrimeNumbers()
          }
        })
      },
      { rootMargin: '0px 0px 200px 0px' }
    )

    const current = sentinelRef.current

    if (current) {
      observer.observe(current)
    }

    return () => {
      sentinelVisibleRef.current = false

      if (current) {
        observer.unobserve(current)
      }

      observer.disconnect()
    }
  }, [fetchPrimeNumbers])

  return (
    <>
      <h1>Prime Numbers</h1>
      <ul>
        {primeNumbers.map((prime) => (
          <li key={prime}>{prime}</li>
        ))}
      </ul>
      <div ref={sentinelRef} style={{ height: 1 }} />
      {isFetching && <p>Loading...</p>}
    </>
  )
}
