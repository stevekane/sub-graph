const m = new Map([
  [ 1, (d: number) => d > 5 ? 2 : 0 ],
  [ 2, (d: number) => d > 5 ? 1 : 3 ],
  [ 3, (d: number) => 1 ]
])

function next (m: Map<number, (d: number) => number>, state: number, current: number): number | null{
  const conn = m.get(current)

  return conn == null ? null : conn(state)
}

console.log(next(m, 3, 1))
