if (typeof window === "undefined") {
    module.exports = require("node-fetch");
}
else {
    module.exports = window.fetch;
}
