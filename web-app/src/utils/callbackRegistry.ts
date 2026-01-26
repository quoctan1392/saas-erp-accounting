type Callback = (payload?: any) => void;

const registry = new Map<string, Callback>();
let counter = 0;

export function registerCallback(cb: Callback) {
  const id = `cb_${Date.now()}_${counter++}`;
  registry.set(id, cb);
  return id;
}

export function consumeCallback(id: string): Callback | undefined {
  const cb = registry.get(id);
  if (cb) registry.delete(id);
  return cb;
}

export function hasCallback(id: string): boolean {
  return registry.has(id);
}
