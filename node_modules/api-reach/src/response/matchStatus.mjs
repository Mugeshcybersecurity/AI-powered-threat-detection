/* eslint-disable no-magic-numbers */

const TYPE_ABORTED = "aborted";
const TYPE_INFORMATIONAL = "informational";
const TYPE_SUCCESS = "success";
const TYPE_REDIRECT = "redirect";
const TYPE_CLIENT_ERROR = "clientError";
const TYPE_SERVER_ERROR = "serverError";

const types = {
    // @todo >= 600 as unknown type?
    [TYPE_ABORTED]: status => !status || status === 499 || status >= 600,
    [TYPE_INFORMATIONAL]: status => status >= 100 && status < 200,
    [TYPE_SUCCESS]: status => status >= 200 && status < 300,
    [TYPE_REDIRECT]: status => status >= 300 && status < 400,
    [TYPE_CLIENT_ERROR]: status => status >= 400 && status < 499, // 499 is intentional here
    [TYPE_SERVER_ERROR]: status => status >= 500 && status < 600,
};

const checkOrder = [
    TYPE_SUCCESS,
    TYPE_CLIENT_ERROR,
    TYPE_SERVER_ERROR,
    TYPE_REDIRECT,
    TYPE_ABORTED,
    TYPE_INFORMATIONAL,
];
const typesCount = checkOrder.length;

const isAborted = status => types[TYPE_ABORTED](status);
const isInformational = status => types[TYPE_INFORMATIONAL](status);
const isSuccess = status => types[TYPE_SUCCESS](status);
const isRedirect = status => types[TYPE_REDIRECT](status);
const isClientError = status => types[TYPE_CLIENT_ERROR](status);
const isServerError = status => types[TYPE_SERVER_ERROR](status);

const getStatusType = (status) => {
    for (let i = 0; i < typesCount; i++) {
        const type = checkOrder[i];
        const fn = types[type];
        if (fn(status)) {
            return type;
        }
    }
    // @todo throw ?
};

export default getStatusType;

export {
    isAborted,
    isInformational,
    isSuccess,
    isRedirect,
    isClientError,
    isServerError,
    TYPE_ABORTED,
    TYPE_INFORMATIONAL,
    TYPE_SUCCESS,
    TYPE_REDIRECT,
    TYPE_CLIENT_ERROR,
    TYPE_SERVER_ERROR,
};
