All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2020-03-14
### Fixed
- support for both native ESM and CommonJS fallback

## [0.6.0] - 2020-03-01
### Added
- binary/buffer/raw mode
- stream mode

## [0.5.0] - 2020-02-19
### Added
- HEAD request shorthand method
### Fixed
- empty response when expecting JSON was not considered an error
- vulnerable libraries (upgraded versions)

## [0.4.1] - 2019-10-15
### Fixed
- when data type is set to JSON, 204 No Content response without the content isn't treated as an data type mismatch

## [0.4.0] - 2019-05-09
### Changed
- throwing Timeout error on timeout instead of Aborted error
### Added
- a lot of documentation
### Fixed
- vulnerable libraries (upgraded versions in lockfile)

## [0.3.1] - 2019-04-02
### Fixed
- unhandled rejections even when they are handled from user code

## [0.3.0] - 2019-03-21
### Changed
- using native fetch and AbortController in browser
- node-fetch peer dependency version set to any
### Fixed
- in browser miscompatibility between abort-controller package and node-fetch

## [0.2.1] - 2019-02-17
### Fixed
- resolving with undefined with some unofficial Promises implementations due to `finally` differences

## [0.2.0] - 2019-02-16
### Fixed
- `base` parameter not working, probably other unnoticed bugs

### Changed
- babel settings, making it much more less compatible with old browsers (requires es6 + async/await)

## [0.1.1] - 2019-02-16
### Added
- possibility not to use totalTimeout (define as Infinity)

## [0.1.0] - 2019-02-16
### Added
- (auto) retry support
- abort support
- timeout and totalTimeout support

### Changed
- updated eslint, babel versions and config

## [0.0.1-alpha.4] - 2019-02-04
### Added
- `post`, `patch`, `delete` helpers

### Fixed
- non-GET request sending

## [0.0.1-alpha.3] - 2019-01-03
### Added
- support for custom URL parser (to allow polyfills or environments where global URL is already taken by something else,
like React Native)

### Changed
- updated eslint config

## [0.0.1-alpha.2] - 2019-01-03
### Added
- base url support

### Fixed
- eslint not actually linting because of `mjs` extension

## [0.0.1-alpha.1] - 2018-12-01
### Added
- first version with working basics

## [0.0.0] - 2018-11-29
### Added
- npm name reserved
