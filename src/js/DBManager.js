export default class DatabaseManager {
    constructor(databaseName) {
        this.databaseName = databaseName;
    }

    async openDB() {
        return new Promise((resolve, reject) => {
            const openRequest = indexedDB.open(this.databaseName, 1);

            openRequest.onupgradeneeded = event => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('tracks')) {
                    db.createObjectStore('tracks', { autoIncrement: true });
                }
            };

            openRequest.onsuccess = event => {
                resolve(event.target.result);
            };

            openRequest.onerror = event => {
                reject(`Error opening indexedDB: ${event.target.error}`);
            };
        });
    }

    async saveTrack(track) {
        const db = await this.openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['tracks'], 'readwrite');
            const store = transaction.objectStore('tracks');
            const request = store.add(track);

            request.onsuccess = event => {
                resolve(event.target.result);
            };

            request.onerror = event => {
                reject(`Error saving track to DB: ${event.target.error}`);
            };
        });
    }

    async getTracks() {
        const db = await this.openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['tracks'], 'readonly');
            const store = transaction.objectStore('tracks');
            const request = store.getAll();

            request.onsuccess = event => {
                resolve(event.target.result);
            };

            request.onerror = event => {
                reject(`Error getting tracks from DB: ${event.target.error}`);
            };
        });
    }

    async deleteTrack(trackId) {
        const db = await this.openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['tracks'], 'readwrite');
            const store = transaction.objectStore('tracks');
            const request = store.delete(trackId);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = event => {
                reject(`Error deleting track from DB: ${event.target.error}`);
            };
        });
    }
}