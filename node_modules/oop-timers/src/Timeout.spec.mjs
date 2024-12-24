import Timeout from "./Timeout.mjs";

import { spy, wait } from "../test/utils.mjs";

describe("Timeout", () => {
    it("waits proper time before firing the callback", async () => {
        const callback = spy();
        const timer = new Timeout(callback, 300);
        timer.start();

        await wait(200);
        callback.__spy.calls.must.have.length(0);
        await wait(50);
        callback.__spy.calls.must.have.length(0);
        await wait(50);
        callback.__spy.calls.must.have.length(1);
    });

    it("doesn't fire the callback by defualt", async () => {
        const callback = spy();
        new Timeout(callback, 250);

        await wait(200);
        callback.__spy.calls.must.have.length(0);
        await wait(50);
        callback.__spy.calls.must.have.length(0);
        await wait(50);
        callback.__spy.calls.must.have.length(0);
    });

    it("allows to fire the callback on constructing", async () => {
        const callback = spy();
        new Timeout(callback, 300, true);

        await wait(200);
        callback.__spy.calls.must.have.length(0);
        await wait(50);
        callback.__spy.calls.must.have.length(0);
        await wait(50);
        callback.__spy.calls.must.have.length(1);
    });

    it("allows to restart the timer before callback fires", async () => {
        const callback = spy();
        const timer = new Timeout(callback, 300);
        timer.start();

        await wait(200);
        callback.__spy.calls.must.have.length(0);
        timer.start();

        await wait(200);
        callback.__spy.calls.must.have.length(0);
        await wait(200);
        callback.__spy.calls.must.have.length(1);
    });

    it("allows to restart the timer after callback fires", async () => {
        const callback = spy();
        const timer = new Timeout(callback, 300);
        timer.start();

        await wait(300);
        callback.__spy.calls.must.have.length(1);
        timer.start();

        await wait(200);
        callback.__spy.calls.must.have.length(1);
        await wait(100);
        callback.__spy.calls.must.have.length(2);
    });

    it("allows to change the time while restarting the timer", async () => {
        const callback = spy();
        const timer = new Timeout(callback, 300);
        timer.start();

        await wait(300);
        callback.__spy.calls.must.have.length(1);
        timer.start(50);

        await wait(50);
        callback.__spy.calls.must.have.length(2);
    });

    it("remembers changed time on restart", async () => {
        const callback = spy();
        const timer = new Timeout(callback, 300);
        timer.start();
        timer.start(50);

        callback.__spy.calls.must.have.length(0);
        await wait(50);
        callback.__spy.calls.must.have.length(1);

        timer.stop();
        await wait(50);
        callback.__spy.calls.must.have.length(1);
        await wait(200);
        callback.__spy.calls.must.have.length(1);

        timer.start();
        callback.__spy.calls.must.have.length(1);
        await wait(50);
        callback.__spy.calls.must.have.length(2);
    });

    it("allows to stop the timer", async () => {
        const callback = spy();
        const timer = new Timeout(callback, 300);
        timer.start();

        await wait(300);
        callback.__spy.calls.must.have.length(1);
        timer.stop();

        await wait(600);
        callback.__spy.calls.must.have.length(1);
    });

    it("ignores multiple stop calls", () => {
        const callback = spy();
        const timer = new Timeout(callback, 300);
        (() => {
            timer.stop();
            timer.stop();
            timer.stop();
        }).must.not.throw();
    });

    it("calls the callback with null as context", async () => {
        const callback = spy();
        const timer = new Timeout(callback, 100);
        timer.start();

        await wait(100);
        callback.__spy.calls.must.have.length(1);
        (callback.__spy.calls[0].context === null).must.be.true();
    });

    it("calls the callback without arguments", async () => {
        const callback = spy();
        const timer = new Timeout(callback, 100);
        timer.start();

        await wait(100);
        callback.__spy.calls.must.have.length(1);
        callback.__spy.calls[0].must.have.length(0);
    });

    describe("should crash when time isn't a number", () => {
        const callback = spy();

        it("in constructor", () => {
            (() => {
                new Timeout(callback, "100");
            }).must.throw(TypeError, "Time must be a number");
            (() => {
                new Timeout(callback, null);
            }).must.throw(TypeError, "Time must be a number");
            (() => {
                new Timeout(callback);
            }).must.throw(TypeError, "Time must be a number");
            (() => {
                new Timeout(callback, [100]);
            }).must.throw(TypeError, "Time must be a number");
        });

        it("on start method", () => {
            const timeout = new Timeout(callback, 100);
            (() => {
                timeout.start("100");
            }).must.throw(TypeError, "Time must be a number");
            (() => {
                timeout.start(() => {}); // null is simply ignored on `start` to match Interval behavior
            }).must.throw(TypeError, "Time must be a number");
            (() => {
                timeout.start([100]);
            }).must.throw(TypeError, "Time must be a number");
        });
    });

    describe("should crash when time is lower than zero", () => {
        const callback = spy();

        it("in constructor", () => {
            (() => {
                new Timeout(callback, -1);
            }).must.throw(TypeError, "Time must be a positive number");
            (() => {
                new Timeout(callback, -600);
            }).must.throw(TypeError, "Time must be a positive number");
            (() => {
                new Timeout(callback, 0);
            }).must.not.throw();
        });

        it("on start method", () => {
            const timeout = new Timeout(callback, 100);
            (() => {
                timeout.start(-1);
            }).must.throw(TypeError, "Time must be a positive number");
            (() => {
                timeout.start(-600);
            }).must.throw(TypeError, "Time must be a positive number");
            (() => {
                timeout.start(0);
            }).must.not.throw();
        });
    });

    describe("should crash when time is higher than max supported value for setTimeout", () => {
        const callback = spy();

        const MAX_VALUE = 2147483647;

        it("in constructor", () => {
            (() => {
                new Timeout(callback, MAX_VALUE + 1);
            }).must.throw(TypeError, "Time must not be greater than 2147483647");
            (() => {
                new Timeout(callback, MAX_VALUE);
            }).must.not.throw();
        });

        it("on start method", () => {
            const timeout = new Timeout(callback, 100);
            (() => {
                timeout.start(MAX_VALUE + 1);
            }).must.throw(TypeError, "Time must not be greater than 2147483647");
            (() => {
                timeout.start(MAX_VALUE);
                timeout.stop();
            }).must.not.throw();
        });
    });

    it("should allow Infinity but should just do nothing", async () => {
        const callback = spy();
        const timeout = new Timeout(callback, Infinity, true);
        const timeout2 = new Timeout(callback, 100);
        timeout2.start(Infinity);

        await wait(200); // we can't wait forever so let's wait for a while at least to see if it was not started with 0
        callback.__spy.calls.must.have.length(0);

        timeout.stop();
        timeout2.stop();
    });
});
