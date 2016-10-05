type UUID = number
type FoldFn<A, B> = (a: A, b: B) => A
type MapFn<A, B> = (a: A) => B
type PredFn<A> = (a: A) => boolean

interface IScene { uuid: UUID }

interface Functor<T> {
  map<F>(f: MapFn<T, F>): Functor<F>
}

interface Foldable<T> {
  reduce<F>(f: FoldFn<T, F>, initial: F): F
}

class Module<T> implements Functor<T>, Foldable<T> {
  constructor(public leaves: T[], public modules: Module<T>[], public connections: Map<UUID, UUID>) {}

  reduce<F>(f: FoldFn<F, Module<T>>, initial: F): F {
    return this.modules.reduce((m, c) => c.reduce(f, m), f(initial, this))
  }

  map<F>(f: MapFn<T, F>): Module<F> {
    return new Module(this.leaves.map(f), this.modules.map(m => m.map(f)), this.connections)
  }
}

// // Traverse a sub-graph looking for first satisfying connection
// function findConnection (uuid: UUID, m: Module<IScene>): UUID | null {
//   const connection = m.connections.get(uuid)
// 
//   if ( connection != null ) return connection
// 
//   for ( const cm of m.modules ) {
//     const c = findConnection(uuid, cm)
//     
//     if ( c != null ) return c
//   }
//   return null
// }
// 
// // Traversal is a pruned sub-graph w/ only the modules needed to get to the predicate-satisfying scene
// function findTraversal (f: (s: IScene) => boolean, m: Module<IScene>): Module<IScene> | null {
//   for ( const s of m.scenes ) {
//     if ( f(s) ) return new Module(m.scenes, [], m.connections) 
//   }
//   for ( const cm of m.modules ) {
//     const t = findTraversal(f, cm)
// 
//     if ( t ) return new Module(m.scenes, [ t ], m.connections)
//   }
//   return null
// }
// 
// // Traverse the module looking for next scene given current scene's UUID
// function findNext (uuid: UUID, m: Module<IScene>): IScene | null {
//   const traversal = findTraversal(s => s.uuid == uuid, m)
// 
//   if ( traversal == null ) return null
// 
//   const nextUUID = findConnection(uuid, traversal)
// 
//   return nextUUID ? findWhere(s => s.uuid == nextUUID, m) : null
// }

function leavesWhere<T> (f: (t: T) => boolean, m: Module<T>): T[] {
  return m.reduce((l, m) => m.leaves.filter(f), [] as T[])
}

function connectionsFor (uuid: UUID, m: Module<IScene>): UUID[] {
  return m.reduce((l, m) => l.concat(m.connections.has(uuid) ? m.connections.get(uuid) as UUID : []), [] as UUID[])
}

const m1 = new Module([ { uuid: 2 }, { uuid: 3 } ], [], new Map([ [ 2, 3 ] ]))
const m2 = new Module([ { uuid: 4 }, { uuid: 5 } ], [], new Map([ [ 4, 5 ] ]))
const e = new Module([ { uuid: 0 }, { uuid: 1 }, { uuid: 6 } ], [ m1, m2 ], new Map([ [ 0, 1 ], [ 1, 2 ], [ 3, 4 ], [ 5, 6 ] ]))
const totalLeaves = e.reduce((l, m) => l + m.leaves.length, 0)
const uuids = e.reduce((l, m) => l.concat(m.leaves.map(l => l.uuid)), [] as UUID[])
const consFor1 = connectionsFor(1, e)
const withUUID5 = leavesWhere(l => l.uuid == 5, e)

console.log(totalLeaves)
console.log(uuids)
console.log(consFor1)
console.log(withUUID5)
// 
// var n: IScene | null = e.scenes[0]
// 
// // console.log(findTraversal(x => x.uuid == 3, e))
// // console.log(findTraversal(x => x.uuid == 5, e))
// 
// console.log(e.scenes[0])
// while ( n = findNext(n.uuid, e) ) {
//   console.log(n)
// }
