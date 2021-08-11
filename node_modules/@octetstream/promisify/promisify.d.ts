declare function promisify(target: Function, ctx?: any): Function

declare namespace promisify {
  declare type Targets {
    [key: string]: Function
  }

  export function all(targets: Targets, ctx?: any): Targets

  export function some(targets: Targets, list: string[], ctx?: any): Targets

  export function except(targets: Targets, list: string[], ctx?: any): Targets
}
