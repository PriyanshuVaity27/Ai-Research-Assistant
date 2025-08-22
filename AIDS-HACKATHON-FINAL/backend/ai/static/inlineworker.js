// Define InlineWorker in a way that supports both ES modules and regular scripts
const InlineWorker = (function() {
    function InlineWorker(func, self) {
        const functionBody = func.toString().trim().match(/^function\s*\w*\s*\([\w\s,]*\)\s*{([\w\W]*)}/)[1];
        const workerUrl = 'data:application/javascript,' + encodeURIComponent(functionBody);
        const worker = new Worker(workerUrl);

        worker.onmessage = function(e) {
            self.onmessage && self.onmessage(e);
        };

        self.postMessage = function(data) {
            worker.postMessage(data);
        };

        return worker;
    }

    return InlineWorker;
})();

// Export for ES modules
export { InlineWorker };

// Also attach to window for non-module scripts
if (typeof window !== 'undefined') {
    window.InlineWorker = InlineWorker;
}