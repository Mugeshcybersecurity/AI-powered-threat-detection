# Importing

## ESModules

```javascript
import { Interval } from "oop-timers";
```

## CommonJS
```javascript
const { Interval } = require("oop-timers");
```

Replace `Interval` with `Timeout` if you need to import timeout type timer.

# Real-world examples

These may not be the perfect examples. I'm no good at examples. Feel free to submit PR with better examples :)

## Timeout

Imagine an Countdown timer app, where there is a Play button and Stop button. When timer is started we will replace Play button icon with icon representing restart action. Pressing it should restart the timer.

### "Classic" code example

```javascript
let timeout;
const startTimeout = () => {
    if (timeout) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(onTimeEnd, 15 * 60 * 1000);
};

playButton.on("click", startTimeout);
stopButton.on("click", () => clearTimeout(timeout));
```

### `oop-timers` code example:
```javascript
const { Timeout } = require("oop-timers");
const timer = new Timeout(onTimeEnd, 15 * 60 * 1000);

playButton.on("click", () => timer.start());
stopButton.on("click", timer.stop);
```

## Interval

We want to update the previous app to see how many seconds are left. Time to switch to Interval.

### "Classic" code example

```javascript
let interval;
let left;

const onTick = () => {
    left--;
    updateView(left);
    if (left === 0) {
        clearInterval(interval);
    }
};

const startInterval = () => {
    if (interval) {
        clearInterval(interval);
    }
    left = 15 * 60;
    interval = setInterval(onTick, 1000);
};

playButton.on("click", startInterval);
stopButton.on("click", () => clearInterval(interval));
```

### `oop-timers` code example:
```javascript
const { Interval } = require("oop-timers");

let left;

const onTick = () => {
    left--;
    updateView(left);
    if (left === 0) {
        clearInterval(interval);
    }
};

const timer = new Interval(onTick, 1000);

const startInterval = () => {
    left = 15 * 60;
    timer.start();
}

playButton.on("click", startInterval);
stopButton.on("click", timer.stop);
```

# Important difference from setTimeout and setInterval

A `timer.start()` method has to be run in order to start the timeout/interval, as opposed to using native
`setTimeout`/`setInterval`. This however can be changed with 3rd constructor argument, which defines if timer should
start on constructing.

- `new Timeout(callback, 1000, true)`
- `new Interval(callback, 1000, true)`

# Additional feature of Interval

One thing missing in native interval is an option to call the callback instantly, then wait specified time and call the
callback and wait and call and wait ...
It's not uncommon to find a code like that:

```javascript
setInterval(checkForNotification, 5000);
checkForNotification();
```

With `oop-timers` you can use 4th constructor argument:
```javascript
new Interval(checkForNotification, 5000, true, true);
```

3rd argument can still be false. Your callback will be instantly called on start and each restart.

# Additional feature when restarting the timers

Both `Timeout` and `Interval` supports defining new time when (re)starting the timer.

```javascript
let interval = 1000;
const increaseInterval = () => { interval -= 100; return interval; }
const decreaseInterval = () => { interval -= 100; return interval; }

const timer = new Interval(tick, interval, true);

plusButton.on("click", () => timer.start(increaseInterval()))
minusButton.on("click", () => timer.start(decreaseInterval()))
```

New time will be stored so next time you stop and start the timer without argument - last used time will be used for the timer.

# Additional feature of Interval when restarting the timer

You can also override (this will be stored too) the `call instantly on (re)start` option when calling `start` method:

```javascript
const timer = new Interval(tick, 1000, true, false);
// timer started without instant call
timer.start(undefined, true);
// callback will be instantly called then after each 1000ms
```

New time argument is skipped when `undefined` or `null` is passed (using `undefined` is preferred).

# Methods and arguments list

## Timeout

See {@link Timeout}

## Interval

See {@link Interval}
