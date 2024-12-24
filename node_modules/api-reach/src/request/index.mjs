/**
 * @class Request
 * @property {string} url - parsed URL
 * @property {Object} queryParams - given query params
 * @property {string} originalUrl - original URL as was given
 * @property {Object} options - merged options (for `fetch`) that was given for the request
 */
class Request {
    constructor(url, options, originalUrl, queryParams) {
        this.options = options;
        this.url = url;
        this.originalUrl = originalUrl;
        this.queryParams = queryParams;
    }
}

export default Request;
