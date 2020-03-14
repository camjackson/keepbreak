# keepbreak

It's never made sense to me that JavaScript promises are resolved or rejected.
In the real world, we don't resolve or reject promises. We keep (or break) them!

This package brings that reality to the world of JavaScript.

## Installation

```sh
npm i -D keepbreak

# OR

yarn add -D keepbreak
```

## Usage

Don't.

## Ok seriously though

You shouldn't use this package, it's plainly stupid. But if you really want to, here's how:

### `install()`

Preserves 'normal' JavaScript behaviour, but adds extra methods to `Promise`.

```js
const keepbreak = require('keepbreak');

keepbreak.install();

Promise.keep().then(() => {
  console.log('Hey this works now!')
});

Promise.break().catch(() => {
  console.log('So does this!');
});

Promise.resolve().then(() => {
  console.log('This still works.');
});

Promise.reject().catch(() => {
  console.log('As does this.');
});
```

### `installStrict()`

Adds the new methods but also deletes the default ones, ensuring that no one ever
forgets to `keep` instead of `resolve`.

```js
const keepbreak = require('keepbreak');

keepbreak.installStrict();

Promise.keep().then(() => {
  return Promise.resolve();
  // -> Uncaught TypeError: Promise.resolve is not a function
});

Promise.break().then(
  () => {},
  () => {
    return Promise.reject();
    // -> Uncaught TypeError: Promise.reject is not a function
  }
)
```

For added fun, when constructing a `new Promise()`, keepbreak will ensure that
the executor function's parameters are named `keep` and `braek` (note the
spelling - we can't call it `break` because that's a reserved word 😔):

```js
const keepbreak = require('keepbreak');

keepbreak.installStrict();

// Ok (can be arrow- or non-arrow functions, anonymous or named):
new Promise((keep, braek) => { keep(); });
new Promise((keep) => { keep(); });
new Promise((_, braek) => { braek(); });

// Not ok:
new Promise((resolve, reject) => { resolve() });
// -> Uncaught Error: Parameters to `new Promise()` must be called 'keep' and 'braek'
```

In case it's not clear, this mutates the global `Promise` object, so if anything
(your own code, your dependencies, or even Node.js builtins) tries to `Promise.resolve()`, it will explode. So you should definitely use this in production.

### `uninstall()`

Puts things back to so-called 'normal'. Boooriiing!
