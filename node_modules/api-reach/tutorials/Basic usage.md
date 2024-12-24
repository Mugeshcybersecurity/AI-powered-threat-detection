> This section is work in progress. Code should be self-explaining anyway.

## GET request

```javascript
const api = new ApiClient();
const data = await api.get("https://example.org/api/getInfo");
```

## POST request
```javascript
const api = new ApiClient();
const data = await api.post("https://example.com//api/setInfo", null, `{"value": 123}`);
```

## Advanced GET request
with:
- base URL
- query params
- one retry
- timeout per retry
- detecting error type

```javascript
const api = new ApiClient({ base: "https://example.com/" });

try {
    const data = await api.get("/api/getInfo", { page: 2 }, { timeout: 1000, retry: 2 });
    alert(data.body.name);
}
catch (e) {
    if (e instanceof TimeoutHttpError) {
        alert("Timed out!");
    }
    else if (e instanceof ServerHttpError) {
        alert("Server crashed!");
    }
    else if (e instanceof ClientHttpError) {
        alert("You've sent something wrong!");
    }
    else {
        alert("Another error");
    }
}
```

## POST request
with:
- base URL
- non-default data type (body will be sent as `amount=1337` with `application/x-www-form-urlencoded` content type)
- merging URL with query params
- sending body as object (this works for both `json` and `text`)
- aborting request
- detecting error type

```javascript
const api = new ApiClient({ base: "https://example.com/", type: "text" });

const promise = api.post("/api/happiness?hi=hi", { query: "value" }, { amount: 1337 });
promise.then(() => {
    alert("Happiness delivered!");
}).catch((e) => {
    if (e instanceof AbortedHttpError) {
        alert("Happiness aborted!");
        alert(e.details.response.request.url);
        return;
    }
    alert("Happiness delivery failed!");
    alert(e.details.response.statusText);
})
```
