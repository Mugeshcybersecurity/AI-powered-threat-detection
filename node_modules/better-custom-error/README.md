# better-custom-error

Helper for creating Error subclass with bonus features.
It fully works with Babel (as opposed to native ES6 `class`), allows to pass custom data to errors and it contains
features useful for logging/debugging.

## Reasons to use

- Cleaner code.
    - Custom error types makes code more readable and easier to maintenance. They can inherit from built-in or other
    custom types and `instanceof` works as expected with multi level inheritance.
    - A lot of developers uses custom properties for storing additional data. But usually it not uniform and requires
    three lines of code to create, extend and throw your error. With this library you're guided on the details object
    property name and it's easy to throw with details on single line.
    - Ability to throw new error type basing on already created instance of another error. Did you get an error with
    details from inner method, want to handle it and pass more generic error outside? You can do that!

- Easy to use
    - Custom errors behaves just like standard errors when used without extra features.
    - No more painstaking building error message string with multiple variables. Just throw meaningful message and pass
    details as an object.
    - No more JSON serializing data into error message. - Yeah, I've seen that.
    - Custom error doesn't care about arguments order. It will figure it out. Pass parent error instance, message and
    details object in any order. Pass `null` or `undefined` and it won't crash so you don't need to care about
    variable/property existence/initialization check.

- Enables better logging and bug tracking:
    - You can access inheritance tree from your error.
    - Node.js internal stack trace lines are removed, focus on the code itself (you can disable this feature).

## Usage

> Full documentation available here: [documentation](https://dzek69.github.io/better-custom-error/).

`yarn add better-custom-error` or `npm i better-custom-error --save`

```javascript
import createError from "better-custom-error";
// or const createError = require("better-custom-error");

const MyError = createError("MyError");
const AnotherError = createError("AnotherError", MyError); // it extends `Error` by default, but you can pass another error
const YetAnotherError = createError("YetAnotherError", Error, options);
```

For `options` see: [Options Usage](https://dzek69.github.io/better-custom-error/tutorial-Options%20usage.html).

> Imporant: creating two errors with the same name will create two different errors references anyway! Export them and
import where needed or make your errors global.

## TODO

- Further memory optimization:
    - create and extend one Custom Error instance
    - use getters to delay some calculations from error creation to actual read place
- Ability to override Error prototype so some `better-custom-error` features will be available on native errors too
- `extend` method for easier extending

## License

MIT
