if (typeof window === "undefined") {
    module.exports = require("abort-controller");
}
else {
    module.exports = window.AbortController;
}
