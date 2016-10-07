type FoldFn<A, B> = (a: A, b: B) => A
type MapFn<A, B> = (a: A) => B
type CatFn<A> = (a: A, b: A) => A

// Typings seem weak here.  but this works as long as an array is passed
function concatList<A> (l1: A[], l2: A[]): A[] {
  return l1.concat(l2)
}

function sum (a: number, b: number): number {
  return a + b
}

export interface ILeaf<A> {
  isLeaf: true
  value: A
}

export interface IBranch<A> {
  isLeaf: false
  trees: Tree<A>[]
}

export class Leaf<A> implements ILeaf<A> {
  isLeaf: true = true
  constructor(public value: A) {}
}

export class Branch<A> implements IBranch<A> {
  isLeaf: false = false
  constructor(public trees: Tree<A>[]) {}
}

export type Tree<A> = ILeaf<A> | IBranch<A>

export function reduce<A, B> (f: FoldFn<B, A>, b: B, t: Tree<A>): B {
  if ( t.isLeaf ) return f(b, t.value)
  else            return t.trees.reduce((acc, et) => reduce(f, acc, et), b)
}

export function reduceMap<A, M> (f: (a: A) => M, catFn: CatFn<M>, m: M, t: Tree<A>): M {
  return reduce((acc, x) => catFn(f(x), acc), m, t)
}

export function map<A, B> (f: MapFn<A, B>, t: Tree<A>): Tree<B> {
  if ( t.isLeaf ) return new Leaf(f(t.value))
  else            return new Branch(t.trees.map(et => map(f, et)))
}

const b = new Branch([
  new Leaf("Cats"),
  new Leaf("Dogs"),
  new Branch([
    new Leaf("Winner")
  ])
])
const sizeTree = map(s => s.length, b)
const sizeList = reduceMap(s => [ s.length ], concatList, [], b)
const totalSize = reduceMap(s => s.length, sum, 0, b)

function printTree<A> (t: Tree<A>) {
  if ( t.isLeaf == true ) console.log(t.value)
  else                    t.trees.forEach(printTree)
}

printTree(sizeTree)
console.log(sizeList)
console.log(totalSize)
