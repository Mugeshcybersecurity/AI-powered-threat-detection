import ApiClient from "api-reach";
import { mapValues } from "bottom-line-utils";
const { REMOVE } = mapValues;

class AbuseIPDB {
    /**
     * @param {string} apiKey - AbuseIPDB api key
     */
    constructor(apiKey) {
        this._api = new ApiClient({
            base: "https://api.abuseipdb.com/api/v2/",
            headers: {
                Key: apiKey,
                Accept: "application/json",
            },
        });
    }

    /**
     * @param {string} ipAddress - ipv4 or ipv6 to check
     * @param {number} [maxAgeInDays] - how far back in time to fetch reports
     * @param {boolean} [verbose] - if reports array should be returned as well with basic data
     * @returns {Promise}
     */
    check(ipAddress, maxAgeInDays, verbose) {
        const params = mapValues({ ipAddress, maxAgeInDays, verbose }, (value) => {
            if (!value) {
                return REMOVE;
            }
            return value;
        });
        return this._api.get("/check", params).then(r => r.body.data);
    }
}

export default AbuseIPDB;
