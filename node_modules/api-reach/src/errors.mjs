import createError from "better-custom-error";

/**
 * Base/generic error type
 *
 * @class Error
 * @property {string} message - error message
 * @property {Object} details - error details
 * @property {string} stack - stack trace
 */

/**
 * Non-success response custom error
 *
 * @class HttpError
 * @extends Error
 */
const HttpError = createError("HttpError");
/**
 * Response 4xx error
 *
 * @class ClientHttpError
 * @extends HttpError
 * @extends Error
 */
const ClientHttpError = createError("ClientHttpError", HttpError);
/**
 * Response 5xx error
 *
 * @class ServerHttpError
 * @extends HttpError
 * @extends Error
 */
const ServerHttpError = createError("ServerHttpError", HttpError);
/**
 * Response timeout error
 *
 * @class TimeoutHttpError
 * @extends ServerHttpError
 * @extends HttpError
 * @extends Error
 */
const TimeoutHttpError = createError("TimeoutHttpError", ServerHttpError);
/**
 * Response aborted error
 *
 * @class AbortedHttpError
 * @extends ServerHttpError
 * @extends HttpError
 * @extends Error
 */
const AbortedHttpError = createError("AbortedHttpError", ClientHttpError);
/**
 * Response data type was different than expected
 *
 * @class ResponseDataTypeMismatchError
 * @extends Error
 */
const ResponseDataTypeMismatchError = createError("ResponseDataTypeMismatchError");

export {
    HttpError,
    ClientHttpError,
    ServerHttpError,
    TimeoutHttpError,
    AbortedHttpError,
    ResponseDataTypeMismatchError,
};
