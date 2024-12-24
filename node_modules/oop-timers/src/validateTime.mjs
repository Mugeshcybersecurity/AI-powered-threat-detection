const MAX_TIMEOUT = (Math.pow(2, 32) / 2) - 1; // eslint-disable-line no-magic-numbers

const validateTime = time => {
    if (time === Infinity) {
        return;
    }
    if (typeof time !== "number") {
        throw new TypeError("Time must be a number");
    }
    if (time < 0) {
        throw new TypeError("Time must be a positive number");
    }
    if (time > MAX_TIMEOUT) {
        throw new TypeError("Time must not be greater than " + MAX_TIMEOUT);
    }
};

export default validateTime;
