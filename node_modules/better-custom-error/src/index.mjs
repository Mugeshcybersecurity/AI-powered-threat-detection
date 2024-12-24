const getPrototypesNames = obj => {
    const MAX_DEPTH = 100;
    const result = [];

    let i, currentPrototype;

    i = 0;
    currentPrototype = obj;

    while (currentPrototype && i++ < MAX_DEPTH) {
        const proto = Object.getPrototypeOf(currentPrototype);
        if (proto && proto.name) {
            const repeatedPrototypeName = result[result.length - 1] === proto.name;
            if (!repeatedPrototypeName) { // hide side effect of this library
                result.push(proto.name);
            }
        }
        currentPrototype = proto;
    }
    return result;
};

const getMessage = (error, message) => {
    return message || (error && error.message) || "";
};

const getDetails = (error, details) => {
    return details || (error && error.details) || null;
};

const MAX_ARGUMENTS = 3;

const parseArguments = (...args) => { // eslint-disable-line max-statements
    let sourceError, message, details;
    const invalidArguments = () => {
        throw new TypeError("Invalid arguments passed into error");
    };

    if (args.length > MAX_ARGUMENTS) {
        invalidArguments();
    }

    const useArgs = args.filter(a => a != null); // get rid of nulls and undefined

    const errors = useArgs.filter(a => a instanceof Error);
    const errorsLength = errors.length;
    if (errorsLength > 1) {
        invalidArguments();
    }

    const strings = useArgs.filter(a => typeof a === "string");
    const stringsLength = strings.length;
    if (stringsLength > 1) {
        invalidArguments();
    }

    const objects = useArgs.filter(a => typeof a === "object" && !(a instanceof Error));
    const objectsLength = objects.length;
    if (objectsLength > 1) {
        invalidArguments();
    }

    if (errorsLength) {
        sourceError = errors[0]; // accessing non-existing property is slower than this if
    }
    if (stringsLength) {
        message = strings[0];
    }
    if (objectsLength) {
        details = objects[0];
    }

    return {
        sourceError, message, details,
    };
};

const enhanceToString = array => {
    Object.defineProperty(array, "toString", {
        configurable: true,
        enumerable: false,
        value: function toStringCustom() {
            return "(" + Array.prototype.toString.call(this) + ")";
        },
        writable: true,
    });
    return array;
};

/**
 * @param {string} stack
 * @param {string} name
 * @param {string} message
 * @param {ErrorOptions} options
 * @private
 * @returns {string} new stack trace
 */
const cleanUpStack = (stack, name, message, { cleanStackTraces }) => {
    let newLines;

    const lines = stack.split("\n");
    const newFirstLine = name + (message ? ": " + message : "");

    lines.shift(); // remove name/message line
    lines.shift(); // remove first line of stack as it contains internal call we don't need
    if (cleanStackTraces) {
        newLines = lines.filter((line) => {
            return !(/at .* \(internal.*:\d+:\d+\)/.test(line));
        });
    }
    else {
        newLines = lines;
    }

    return newFirstLine + "\n" + newLines.join("\n");
};

/**
 * @typedef {Object} ErrorOptions
 * @property {boolean} cleanStackTraces - should stack trace be cleaned up from node internals
 */

/**
 * @typedef {Error} CustomError
 * @property {string} name - error name
 * @property {string} message - error message
 * @property {string} stack - error stack trace
 * @property {Object} details - error details
 * @property {Array.<Array|string>} names - hierarchy of extended/parent error names
 */

const defaultOptions = {
    cleanStackTraces: true,
};

/**
 * Creates new custom Error constructor.
 *
 * @param {string} name - error name
 * @param {Error} ParentError - Error to inherit from (built-in or custom error)
 * @param {ErrorOptions} options - options to override global options
 * @returns {CustomError}
 */
const createError = (name, ParentError = Error, options) => { // eslint-disable-line max-lines-per-function
    const useOptions = Object.assign( // eslint-disable-line prefer-object-spread
        {},
        defaultOptions,
        createError.defaultOptions,
        options,
    );

    /**
     * Creates custom error object instance. Arguments order doesn't matter.
     *
     * @param {Error|Object|string|void|null} arg1 - parent error instance or error message or error details object
     * @param {Error|Object|string|void|null} arg2 - parent error instance or error message or error details object
     * @param {Error|Object|string|void|null} arg3 - parent error instance or error message or error details object
     * @returns {CustomError}
     * @constructor
     */
    const CustomError = function CustomError(arg1, arg2, arg3) {
        if (!(this instanceof CustomError)) {
            return new CustomError(arg1, arg2, arg3);
        }

        const { sourceError, message, details } = parseArguments(arg1, arg2, arg3);

        const names = enhanceToString([name]);
        if (sourceError) {
            if (sourceError.names) {
                names.push(sourceError.names);
            }
            else {
                names.push(enhanceToString(getPrototypesNames(sourceError)));
            }
        }
        names.push(...getPrototypesNames(this));

        const useMessage = getMessage(sourceError, message);

        Object.defineProperties(this, {
            name: {
                configurable: true,
                enumerable: false,
                value: name,
                writable: true,
            },
            names: {
                configurable: true,
                enumerable: false,
                value: names,
                writable: true,
            },
            message: {
                configurable: true,
                enumerable: false,
                value: useMessage,
                writable: true,
            },
            details: {
                configurable: true,
                enumerable: false,
                value: getDetails(sourceError, details),
                writable: true,
            },
            stack: {
                configurable: true,
                enumerable: false,
                value: cleanUpStack(new Error().stack, name, useMessage, useOptions),
                writable: true,
            },
        });
    };

    CustomError.prototype = new ParentError();
    return CustomError;
};

export default createError;
