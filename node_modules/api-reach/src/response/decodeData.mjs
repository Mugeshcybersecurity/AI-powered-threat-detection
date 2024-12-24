const decodeData = async (response, type) => {
    if (type === "json") { // @todo do not hardcode type
        const text = await response.text();
        try {
            const body = JSON.parse(text);
            return {
                body,
                type,
            };
        }
        catch (e) { // eslint-disable-line no-unused-vars
            return {
                body: {},
                rawBody: text,
                type: "text",
            };
        }
    }
    if (type === "text") {
        return {
            body: await response.text(),
            type: type,
        };
    }
    if (type === "raw") {
        return {
            body: await response.buffer(),
            type: type,
        };
    }
    if (type === "stream") {
        return {
            body: await response.buffer(),
            type: type,
        };
    }
    return {
        body: null,
        type: null,
    };
};

export default decodeData;
