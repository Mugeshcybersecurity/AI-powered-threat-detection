## How to use this library with React Native

This library is built on web standards. React Native however isn't fully compatible with web standards.

### URL incompatibility

One big difference is that `URL` class is available in global scope, but it differs in implementation from web `URL`.
See [bug report][1]. Fix is required to make it work.

### AbortController incompatibility

Another thing - while `fetch` was available in React Native since beginning - aborting the request (using
AbortController) is pretty new thing in React Native. Fix is required for older versions (< 0.60.0) of React Native.

### The fix

I've prepared ready-to-use fix for you. It is available as separate npm package [api-reach-react-native-fix][2].

How to use it? Put one line on the top of your main js file of your React Native application.

```javascript
import "api-reach-react-native-fix";
```

Use this is above fails (for even older React Native versions):

```javascript
import "api-reach-react-native-fix/dist";
```

### What does it do?

The fix:

- feeds `api-reach` with custom `URL` implementation. It does not change global `URL` for full compatibility with
React Native!
- polyfills `AbortController` if needed and stores it in global. This won't do any harm for compatibility.

[1]: https://github.com/facebook/react-native/issues/16434
[2]: https://www.npmjs.com/package/api-reach-react-native-fix
