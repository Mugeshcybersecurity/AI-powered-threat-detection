import fetch from "light-isomorphic-fetch"; // eslint-disable-line max-lines
import qs from "qs";
import urlJoin from "url-join";
import AbortController from "isomorphic-abort-controller";
import { Timeout } from "oop-timers";
const stringify = qs.stringify;

import { ClientHttpError, ServerHttpError, ResponseDataTypeMismatchError, AbortedHttpError, TimeoutHttpError }
    from "./errors.mjs";
import createResponse from "./response/index.mjs";
import { isServerError, isClientError } from "./response/matchStatus.mjs";
import Request from "./request/index.mjs";

// Types:
// text
// json
// raw (binary)
// stream

/**
 * @typedef {Object} ApiOptions
 * @property {string} type - expected data type
 * @property {Object} headers - headers to be send with each request
 * @property {number} retry - how many times should request try to get a successful response. Can be overridden with
 * retryPolicy. 1 = no retry, 2 = one retry, etc.
 * @property {number} retryInterval - time between retries. Can be overriden with retryWaitPolicy
 * @property {function} retryPolicy - function that decides if request should be retried
 * @property {function} retryWaitPolicy - function that decides how much time to wait before next retry
 * @property {number} timeout - timeout for each request
 * @property {number} totalTimeout - total timeout in which all, including retried requests should be fulfilled
 * (this includes wait time between, so timeout=100, wait=200, totalTimeout=350 means that retry will have only 50ms)
 */

const contentTypeMap = {
    json: "application/json; charset=utf-8",
    text: "application/x-www-form-urlencoded",
};

// const optionsWhitelist = [
//     "method",
//     "mode",
//     "cache",
//     "credentials",
//     "headers",
//     "redirect",
//     "referrer",
//     "body",
// ];
let URLParser = URL;

const safeUrlParse = (url) => {
    try {
        return new URLParser(url);
    }
    catch (e) { // eslint-disable-line no-unused-vars
        return null;
    }
};

const globalOptions = { // eslint-disable-line object-shorthand
    retry: 1,
    retryInterval: 100,
    retryPolicy({ count }) {
        return count <= this.retry;
    },
    retryWaitPolicy() {
        return this.retryInterval;
    },
    timeout: 30000,
    totalTimeout: 60000,
};

const wait = time => new Promise(resolve => setTimeout(resolve, time));

const noop = () => undefined;

const createAbortError = ({ isTimeouted, isGlobalTimeouted, lastError, errorDetails }) => {
    const useTimeoutError = isTimeouted || isGlobalTimeouted;
    if (useTimeoutError) {
        return new TimeoutHttpError(`Request aborted because of timeout`, lastError, errorDetails);
    }
    return new AbortedHttpError(`Request aborted`, lastError, errorDetails);
};

class ApiClient {
    /**
     * @class ApiClient
     * @param {ApiOptions} options - options that will override defaults
     */
    constructor(options) {
        // @todo validate them?
        this._options = options || {};
    }

    _getType(options) {
        return options.type || this._options.type || "json"; // @todo do not hardcode type here
    }

    _getContentType(options) {
        const type = this._getType(options);
        return contentTypeMap[type]; // @todo handle unknown type
    }

    _getBody(options, body) {
        const type = this._getType(options);
        if (type === "json") {
            return JSON.stringify(body);
        }
        if (type === "text") {
            if (typeof body === "string") {
                return body;
            }
            return stringify(body);
        }
        return ""; // @todo throw?
    }

    _buildFetchOptions(options, body) {
        const globalHeaders = this._options.headers;
        const localHeaders = options.headers;

        const contentType = {};
        const bodyOptions = {};
        if (body != null) {
            contentType["Content-Type"] = this._getContentType(options);
            bodyOptions.body = this._getBody(options, body);
        }

        return { // @todo filter only known options
            ...globalOptions,
            ...this._options,
            ...options,
            ...bodyOptions,
            headers: {
                ...globalHeaders, // @todo handle same header but with different case
                ...localHeaders, // @todo handle multiple headers
                ...contentType,
            },
        };
    }

    _buildUrlBase(url, base) {
        const parsedBase = safeUrlParse(base);
        if (!parsedBase || !parsedBase.host) { // @todo throw an Error ?
            return url;
        }

        const parsedUrl = safeUrlParse(url);
        if (parsedUrl && parsedUrl.base) { // base is valid full url and given url is also full url
            throw new Error("Cannot use absolute url with base url."); // @todo throw custom type?
        }

        return urlJoin(base, url);
    }

    _buildUrl(originalUrl, queryParams, fetchOptions) {
        const url = this._buildUrlBase(originalUrl, fetchOptions.base);
        if (!queryParams) {
            return url;
        }
        const hasQS = url.includes("?");
        const appendChar = hasQS ? "&" : "?";
        // @todo extract existing query params from string and include for stringify ?
        // @todo add support for string query params

        return url + appendChar + stringify(queryParams);
    }

    /**
     * Sends a GET request
     *
     * @param {string} url - absolute url or relative that will be joined with base url
     * @param {Object|null} [queryParams] - query params that will be added to `url`
     * @param {ApiOptions} [options] - options that will override defaults and options specified in the constructor
     * @returns {Promise<Response>}
     * @throws {ClientHttpError}
     * @throws {ServerHttpError}
     * @throws {ResponseDataTypeMismatchError}
     * @throws {AbortedHttpError}
     * @throws {TimeoutHttpError}
     * @throws {Error}
     */
    get(url, queryParams, options) {
        return this.request("GET", url, queryParams, null, options);
    }

    /**
     * Sends a POST request
     *
     * @param {string} url - absolute url or relative that will be joined with base url
     * @param {Object|null} [queryParams] - query params that will be added to `url`
     * @param {string|Object} [body] - request body. Used as-is when string or stringified according to given data
     * `type` when Object
     * @param {ApiOptions} [options] - options that will override defaults and options specified in the constructor
     * @returns {Promise<Response>}
     * @throws {ClientHttpError}
     * @throws {ServerHttpError}
     * @throws {ResponseDataTypeMismatchError}
     * @throws {AbortedHttpError}
     * @throws {TimeoutHttpError}
     * @throws {Error}
     */
    post(url, queryParams, body, options) {
        return this.request("POST", url, queryParams, body, options);
    }

    /**
     * Sends a PATCH request
     *
     * @param {string} url - absolute url or relative that will be joined with base url
     * @param {Object|null} [queryParams] - query params that will be added to `url`
     * @param {string|Object} [body] - request body. Used as-is when string or stringified according to given data
     * `type` when Object
     * @param {ApiOptions} [options] - options that will override defaults and options specified in the constructor
     * @returns {Promise<Response>}
     * @throws {ClientHttpError}
     * @throws {ServerHttpError}
     * @throws {ResponseDataTypeMismatchError}
     * @throws {AbortedHttpError}
     * @throws {TimeoutHttpError}
     * @throws {Error}
     */
    patch(url, queryParams, body, options) {
        return this.request("PATCH", url, queryParams, body, options);
    }

    /**
     * Sends a DELETE request
     *
     * @param {string} url - absolute url or relative that will be joined with base url
     * @param {Object|null} [queryParams] - query params that will be added to `url`
     * @param {string|Object} [body] - request body. Used as-is when string or stringified according to given data
     * `type` when Object
     * @param {ApiOptions} [options] - options that will override defaults and options specified in the constructor
     * @returns {Promise<Response>}
     * @throws {ClientHttpError}
     * @throws {ServerHttpError}
     * @throws {ResponseDataTypeMismatchError}
     * @throws {AbortedHttpError}
     * @throws {TimeoutHttpError}
     * @throws {Error}
     */
    delete(url, queryParams, body, options) {
        return this.request("DELETE", url, queryParams, body, options);
    }

    /**
     * Sends a HEAD request
     *
     * @param {string} url - absolute url or relative that will be joined with base url
     * @param {Object|null} [queryParams] - query params that will be added to `url`
     * @param {string|Object} [body] - request body. Used as-is when string or stringified according to given data
     * `type` when Object
     * @param {ApiOptions} [options] - options that will override defaults and options specified in the constructor
     * @returns {Promise<Response>}
     * @throws {ClientHttpError}
     * @throws {ServerHttpError}
     * @throws {ResponseDataTypeMismatchError}
     * @throws {AbortedHttpError}
     * @throws {TimeoutHttpError}
     * @throws {Error}
     */
    head(url, queryParams, body, options) {
        return this.request("HEAD", url, queryParams, body, options);
    }

    /**
     * Sends a custom method request
     *
     * @param {string} method - method to use
     * @param {string} url - absolute url or relative that will be joined with base url
     * @param {Object|null} [queryParams] - query params that will be added to `url`
     * @param {string|Object} [body] - request body. Used as-is when string or stringified according to given data
     * `type` when Object
     * @param {ApiOptions} [options] - options that will override defaults and options specified in the constructor
     * @returns {Promise<Response>}
     * @throws {ClientHttpError}
     * @throws {ServerHttpError}
     * @throws {ResponseDataTypeMismatchError}
     * @throws {AbortedHttpError}
     * @throws {TimeoutHttpError}
     * @throws {Error}
     */
    request(method, url, queryParams, body, options = {}) { // eslint-disable-line max-lines-per-function
        const start = Date.now();
        const fineOptions = this._buildFetchOptions(options || {}, body);
        let currentController,
            globalTimeout,
            aborted = false,
            isGlobalTimeouted = false;

        const globalBreak = () => {
            isGlobalTimeouted = true;
            future.abort(); // eslint-disable-line no-use-before-define
        };

        const future = new Promise((resolve, reject) => { // eslint-disable-line max-lines-per-function
            let count = 0,
                lastError = null;

            return (async () => { // eslint-disable-line max-statements, max-lines-per-function
                while (fineOptions.retryPolicy({ count: ++count })) {
                    let isTimeouted = false;
                    currentController = new AbortController();
                    const singleTimeout = new Timeout(() => { // eslint-disable-line no-loop-func
                        isTimeouted = true;
                        currentController.abort();
                    }, fineOptions.timeout);
                    try {
                        if (count > 1) {
                            const waitTime = fineOptions.retryWaitPolicy({ count });
                            if (!globalTimeout || fineOptions.totalTimeout > (Date.now() - start) + waitTime) {
                                await wait(waitTime);
                            }
                            else {
                                globalTimeout.stop();
                                globalBreak();
                            }
                        }
                        if (aborted) {
                            const errorDetails = {
                                tries: count - 1,
                                while: "waiting",
                                timeout: isTimeouted,
                                globalTimeout: isGlobalTimeouted,
                            };

                            lastError = createAbortError({ isTimeouted, isGlobalTimeouted, lastError, errorDetails });
                            break;
                        }
                        singleTimeout.start();
                        return await this._request(
                            method, url, queryParams, fineOptions, currentController.signal,
                        );
                    }
                    catch (e) {
                        if (e.name === "AbortError") {
                            const errorDetails = {
                                tries: count,
                                while: "connection",
                                timeout: isTimeouted,
                                globalTimeout: isGlobalTimeouted,
                            };
                            lastError = createAbortError({ isTimeouted, isGlobalTimeouted, lastError, errorDetails });
                            // it should not try again if:
                            // globally timeouted
                            // aborted by user (abort didn't happened via timeout)
                            if (isGlobalTimeouted || !isTimeouted) {
                                break;
                            }
                            continue;
                        }
                        lastError = e;
                    }
                    finally {
                        singleTimeout.stop();
                    }
                }
                throw lastError ? lastError : new Error("No error thrown"); // @todo what to do if no error saved?
            })().then(resolve, reject);
        });
        future.finally(() => {
            globalTimeout && globalTimeout.stop();
        }).catch(noop); // noop is required here, as finally is creating new promise branch and throws if errors occurs
        // and each branch should handle error separately (even if that is the same error)

        future.abort = () => {
            aborted = true;
            currentController && currentController.abort();
        };

        if (fineOptions.totalTimeout > 0 && Number.isFinite(fineOptions.totalTimeout)) {
            globalTimeout = new Timeout(globalBreak, fineOptions.totalTimeout, true);
        }

        return future;
    }

    async _request(method, originalUrl, queryParams, options, signal) {
        const fetchOptions = {
            ...options,
            method: method.toUpperCase(),
        };

        const url = this._buildUrl(originalUrl, queryParams, fetchOptions);

        const request = new Request(url, fetchOptions, originalUrl, queryParams);

        const result = await fetch(request.url, {
            ...request.options,
            signal,
        });

        const type = this._getType(options || {});
        const response = await createResponse(result, type, request);
        if ("rawBody" in response) {
            throw new ResponseDataTypeMismatchError("Unexpected type of data received", {
                response: response,
                expectedType: type,
            });
        }

        if (isClientError(result.status)) {
            throw new ClientHttpError(result.statusText, {
                response,
            });
        }

        if (isServerError(result.status)) {
            throw new ServerHttpError(result.statusText, {
                response,
            });
        }
        return response;
    }
}

/**
 * Sets global ApiClient configuration that is shared between instances
 *
 * @param {Object} options
 * @param {function} options.URL - `URL`-compatible URL parser, see: https://is.gd/Wbyu4k and https://is.gd/FziUWo
 */
ApiClient.configure = options => {
    URLParser = options.URL;
};

export default ApiClient;
