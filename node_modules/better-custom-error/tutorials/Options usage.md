# better-custom-error

## Available options

- (boolean) `cleanStackTraces` - defines if stack traces from this error instance should be cleaned from node-specific
internal calls. 

## Defaults

Currently by default this library defines following options:
```javascript
{
    cleanStackTraces: true
}
```

## Overriding defaults

You can override defaults just for single Error constructor when creating it:
```javascript
createError(name, ParentError, options);
```

You can also override defaults for all created errors by overriding `createError.defaultOptions` (this is not defined by
default).

```javascript
createError.defaultOptions = {
    cleanStackTraces: false,
};
```


> Note: Overriding `createError.defaultOptions` does NOT change behavior of already created instances. 