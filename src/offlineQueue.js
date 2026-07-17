const DB_NAME = "fasal-doctor-offline";
const STORE = "pending-scans";

function database() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore(STORE, {
        keyPath: "id",
        autoIncrement: true,
      });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueScan(scan) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const request = db
      .transaction(STORE, "readwrite")
      .objectStore(STORE)
      .add(scan);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function takeQueuedScans() {
  const db = await database();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function removeQueuedScan(id) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const request = db
      .transaction(STORE, "readwrite")
      .objectStore(STORE)
      .delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
