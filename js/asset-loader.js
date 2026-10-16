const pending = new Map();
export function preloadImages(paths) {
  return Promise.all(paths.map(path => {
    if (pending.has(path)) return pending.get(path);
    const promise = new Promise(resolve => {
      const img = new Image();
      const finish = ok => resolve({ path, ok });
      img.onload = () => finish(true); img.onerror = () => finish(false); img.src = path;
      setTimeout(() => finish(false), 4500);
    });
    pending.set(path, promise); return promise;
  }));
}
