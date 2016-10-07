import { FoldFn, MapFn, Functor, Foldable } from './interfaces'

type UUID = number
type Traversal<A> = Module<A>[]

interface IScene { uuid: UUID }

class Module<T> implements Functor<T>, Foldable<T> {
  constructor(public leaves: T[], public modules: Module<T>[], public connections: Map<UUID, UUID>) {}

  reduce<F>(f: FoldFn<F, Module<T>>, initial: F): F {
    return this.modules.reduce((m, c) => c.reduce(f, m), f(initial, this))
  }

  map<F>(f: MapFn<T, F>): Module<F> {
    return new Module(this.leaves.map(f), this.modules.map(m => m.map(f)), this.connections)
  }
}

function traversalTo<T> (f: (s: T) => boolean, m: Module<T>): Traversal<T> {
  if ( m.leaves.filter(f).length ) return [ m ]
  else { 
    const path = concatMap(cm => traversalTo(f, cm), m.modules)

    if ( path.length == 0 ) return []
    else                    return [ m ].concat(path)
  }
}

function concatMap<A, B> (f: (a: A) => B[], list: A[]): B[] {
  return list.reduce((out, each) => out.concat(f(each)), [] as B[])
}

function leavesWhere<T> (f: (t: T) => boolean, m: Module<T>): T[] {
  return m.reduce((l, em) => l.concat(em.leaves.filter(f)), [] as T[])
}

function connectionsFor (uuid: UUID, m: Module<IScene>): UUID[] {
  return m.reduce((l, em) => l.concat(em.connections.has(uuid) ? em.connections.get(uuid) as UUID : []), [] as UUID[])
}

function findNext (uuid: UUID, m: Module<IScene>): IScene | null {
  const traversal = traversalTo(l => l.uuid == uuid, m)
  const nextUUID = connectionsFor(uuid, m)[0]

  return nextUUID ? leavesWhere(s => s.uuid == nextUUID, m)[0] : null
}

const m1 = new Module([ { uuid: 2 }, { uuid: 3 } ], [], new Map([ [ 2, 3 ] ]))
const m2 = new Module([ { uuid: 4 }, { uuid: 5 } ], [], new Map([ [ 4, 5 ] ]))
const e = new Module([ { uuid: 0 }, { uuid: 1 }, { uuid: 6 } ], [ m1, m2 ], new Map([ [ 0, 1 ], [ 1, 2 ], [ 3, 4 ], [ 5, 6 ] ]))

var uuid = 0
var n: null | IScene = e.leaves[0]
while (console.log(n), n = findNext(uuid++, e)) {}
