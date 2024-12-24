import createError from "./index.mjs";

describe("createError", () => {
    it("createError should return a function", () => {
        const MyError = createError("MyError");
        MyError.must.be.a.function();
    });

    it("should set corrent name", () => {
        const MyCustomError = createError("MyError");
        const err = new MyCustomError();
        err.name.must.equal("MyError");
    });

    it("instanceof should detect parent `class`", () => {
        const MyError = createError("MyError");
        const my = new MyError();
        my.must.be.instanceOf(Error);

        const MySyntaxError = createError("MyError", SyntaxError);
        const syntax = new MySyntaxError();
        syntax.must.be.instanceOf(SyntaxError);
        syntax.name.must.equal("MyError");
    });

    it("instanceof should detect parent `class` which was extended by createError", () => {
        const MyError = createError("MyError");
        const YourError = createError("YourError", MyError);
        const your = new YourError();
        your.must.be.instanceOf(Error);
        your.must.be.instanceOf(MyError);
        your.must.be.instanceOf(YourError);
    });

    it("should store names hierarchy with error", () => {
        const MyError = createError("MyError", TypeError);
        const YourError = createError("YourError", MyError);
        const HerError = createError("HerError", YourError);
        const your = new HerError();
        your.names.must.be.eql([
            "HerError",
            "YourError",
            "MyError",
            "TypeError",
            "Error",
        ]);
    });

    it("allows invoking created error as function (just like standard error allows)", () => {
        const MyError = createError("MyError", TypeError);
        const error = MyError("Hi"); // eslint-disable-line new-cap

        error.must.be.instanceOf(MyError);
        error.must.be.instanceOf(TypeError);
        error.must.be.instanceOf(Error);
        error.names.must.be.eql([
            "MyError",
            "TypeError",
            "Error",
        ]);

        error.message.must.equal("Hi");
    });

    it("sets message", () => {
        const MyError = createError("MyError", TypeError);

        {
            const error = new MyError("Something is wrong");
            error.message.must.equal("Something is wrong");
        }

        {
            const error = new MyError(null, null, "Something is wrong");
            error.message.must.equal("Something is wrong");
        }

        {
            const error = new MyError(null, "Something is wrong", null);
            error.message.must.equal("Something is wrong");
        }
    });

    it("sets details", () => {
        const MyError = createError("MyError", TypeError);

        {
            const details = { a: 5 };
            const error = new MyError("Something is wrong", details);
            error.details.must.equal(details);
        }

        {
            const details = { b: 5 };
            const error = new MyError(details);
            error.details.must.equal(details);
        }

        {
            const details = { c: 5 };
            const error = new MyError(null, details);
            error.message.must.equal("");
            error.details.must.equal(details);
        }

        {
            const details = { d: 5 };
            const error = new MyError(null, null, details);
            error.message.must.equal("");
            error.details.must.equal(details);
        }

        {
            const details = { e: 5 };
            const error = new MyError(details, null, null);
            error.message.must.equal("");
            error.details.must.equal(details);
        }

        {
            const details = { e: 5 };
            const error = new MyError(null, details, null);
            error.message.must.equal("");
            error.details.must.equal(details);
        }
    });

    it("allows to creating error from another error instance, without extending", () => {
        {
            const DatabaseError = createError("DatabaseError");
            const InternalServerError = createError("InternalServerError");

            const dbError = new DatabaseError("DB connection lost.");
            const error = new InternalServerError(dbError, "Cannot get articles");

            error.message.must.equal("Cannot get articles");
            error.must.be.instanceOf(InternalServerError);
            error.must.not.be.instanceOf(DatabaseError);
            error.names.must.eql([
                "InternalServerError",
                [
                    "DatabaseError", "Error",
                ],
                "Error",
            ]);
            String(error.names).must.equal("(InternalServerError,(DatabaseError,Error),Error)");
        }

        {
            const InternalServerError = createError("InternalServerError");

            const dbError = new TypeError("DB connection lost.");
            const error = new InternalServerError(dbError, "Cannot get articles");

            error.message.must.equal("Cannot get articles");
            error.must.be.instanceOf(InternalServerError);
            error.must.not.be.instanceOf(TypeError);
            error.names.must.eql([
                "InternalServerError",
                [
                    "TypeError", "Error",
                ],
                "Error",
            ]);
            String(error.names).must.equal("(InternalServerError,(TypeError,Error),Error)");
        }
    });

    it("allows mixing arguments order and omitting any with null/undefined", () => {
        /* eslint-disable new-cap */
        {
            const MyError = createError("MyError", TypeError);
            const YourError = createError("YourError", MyError);
            const HerError = createError("HerError");

            {
                const exampleMyError = MyError("This is my error", { data: true, x: 5 });
                const error = YourError(exampleMyError, { data: "overridden" }, "Message overridden");

                error.must.be.instanceOf(YourError);
                error.must.be.instanceOf(MyError);
                error.message.must.equal("Message overridden");
                error.details.must.eql({ data: "overridden" });
                error.names.must.eql([
                    "YourError",
                    ["MyError", "TypeError", "Error"],
                    "MyError",
                    "TypeError",
                    "Error",
                ]);
            }

            {
                const exampleMyError = MyError("This is my error", null, { data: true, x: 5 });
                const error = YourError(exampleMyError);

                error.must.be.instanceOf(YourError);
                error.must.be.instanceOf(MyError);
                error.message.must.equal("This is my error");
                error.details.must.eql({ data: true, x: 5 });
                error.names.must.eql([
                    "YourError",
                    ["MyError", "TypeError", "Error"],
                    "MyError",
                    "TypeError",
                    "Error",
                ]);
            }

            {
                const exampleMyError = MyError({ data: false, x: 5 }, new SyntaxError("Wrong syntax"), "This is ERROR");
                const error = new HerError(null, "I don't blame people, but this is her error", exampleMyError);

                error.must.be.instanceOf(HerError);
                error.must.not.be.instanceOf(MyError);
                error.message.must.equal("I don't blame people, but this is her error");
                error.details.must.eql({ data: false, x: 5 });
                error.names.must.eql([
                    "HerError",
                    [
                        "MyError",
                        [
                            "SyntaxError",
                            "Error",
                        ],
                        "TypeError", "Error",
                    ],
                    "Error",
                ]);
            }

            {
                const exampleMyError = MyError({ data: false, x: 5 }, new SyntaxError("Wrong syntax"));
                const error = new HerError({}, undefined, exampleMyError);

                error.must.be.instanceOf(HerError);
                error.must.not.be.instanceOf(MyError);
                error.message.must.equal("Wrong syntax");
                error.details.must.eql({});
                error.names.must.eql([
                    "HerError",
                    [
                        "MyError",
                        [
                            "SyntaxError",
                            "Error",
                        ],
                        "TypeError", "Error",
                    ],
                    "Error",
                ]);
            }
        }
        /* eslint-enable new-cap */
    });

    it("has non-enumerable properties", () => {
        const MyError = createError("MyError", SyntaxError);
        const error = new MyError("abc", { a: 5 }, new TypeError("xxx"));

        Object.keys(error).must.eql([]);
    });
});
