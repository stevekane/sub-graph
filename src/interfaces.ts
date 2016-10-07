export type FoldFn<A, B> = (a: A, b: B) => A
export type MapFn<A, B> = (a: A) => B
export type PredFn<A> = (a: A) => boolean

export interface Functor<T> {
  map<F>(f: MapFn<T, F>): Functor<F>
}

export interface Foldable<T> {
  reduce<F>(f: FoldFn<T, F>, initial: F): F
}
