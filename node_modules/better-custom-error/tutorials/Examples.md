# better-custom-error

Some examples.

> Imporant: creating two errors with the same name will create two different errors references anyway! Export them and
import where needed or make your errors global.

## Native solution doesn't work as expected

```javascript
const MyError = createError("MyError");
const MyOtherError = createError("MyOtherError", MyError);

const error = new MyOtherError();
console.log(error instanceof MyError); // true

// vs native:

class MyError extends Error {}
class MyOtherError extends Error {}

const error = new MyOtherError();
console.log(error instanceof MyError); // false
```

## Custom error details object simplifies passing custom data 

```javascript
throw new MyCustomError("Cannot do stuff", { debugStats: databaseEngine.stats() });

// vs native:

const error = new Error("Cannot do stuff");
error.details = { debugStats: databaseEngine.stats() };
throw error;
```

## Create instance basing on another instance

```javascript
try {
    db.query("SELECT ..."); // it throws QueryError for example with a message
}
catch (error) {
    throw new DatabaseError(error, { debugStats: db.stats() }); // this will inherit message and add stats
}
```

## Pass data in any order, pass null or undefined for simplicity

```javascript
let customData = LOGGING_LEVEL === "ALL" ? { time: db.time(), query: query } : null;
throw new DatabaseError(customData, "Query cannot run");
```

## Advanced usage and `names` property

This shows advanced usage of custom errors. I tried to show most features in tiny part of code, so it's a little messy.
In this example `TypeError` will be thrown from `getProduct`, but in `renderProductPage` it will be caught and wrapped
by `DatabaseError`. `DatabaseError` inherits from `InternalServerError` and this is finally used for deciding which
error page to show.

`e.names` will contain array which describe errors hierarchy - `DatabaseError` was created from `TypeError` instance,
which inherits from `Error` and `DatabaseError` itself inherits from `InternalServerError` which inherits from `Error`).
```javascript
[
    "DatabaseError",
    ["TypeError", "Error"],
    "InternalServerError",
    "Error",
]
```
For logging purposes we're casting it to string and still be able to see hierarchy, we will get:

`"(DatabaseError,(TypeError,Error),InternalServerError,Error)"`

The code:
```javascript
const NotFoundError = createError("NotFoundError");
const InternalServerError = createError("InternalServerError");
const DatabaseError = createError("DatabaseError", InternalServerError);

const getProduct = id => {
    if (!id) {
        throw new TypeError("Product id is missing");
    }
    const data = db.query(/* query here */);
    if (!data) {
        throw new NotFoundError("Product cannot be found", { id });
    }
    return data;
};

const renderProductPage = (id) => {
    try {
        const product = getProduct(id);
        return renderProduct(); // can throw RenderError which inherits from InternalServerError too
    }
    catch (error) {
        if (error instanceof NotFoundError) {
            throw error; // just re-throw
        }
        
        throw new DatabaseError(error);
    }
}

try {
    const render = router.getRenderMethodForUrl(url); // let's assume we are on product page url
    const html = render(); // calls renderProductPage
    res.send(html);
}
catch (e) {
    // text-based log service
    loggingService.log(e.name, e.message, JSON.stringify(e.details), String(e.names), e.stack);
    
    if (e instanceof NotFoundError) {
        res.send(router.renderError(404));
    }
    if (e instanceof InternalServerError) {
        res.send(router.renderError(500));
    }
}
```