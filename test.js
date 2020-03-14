const keepbreak = require('.');

describe('keepbreak', () => {
  afterEach(() => {
    keepbreak.uninstall();
  })

  describe('install', () => {
    it('adds the keep method', () => {
      expect(Promise.keep).toBeUndefined()

      keepbreak.install();
      expect(Promise.keep).not.toBeUndefined()

      return Promise.keep('hey').then(
        value => {
          expect(value).toEqual('hey')
        },
        () => {
          throw new Error('Should not be here');
        }
      );
    });

    it('adds the break method', () => {
      expect(Promise.break).toBeUndefined()

      keepbreak.install();
      expect(Promise.break).not.toBeUndefined()

      return Promise.break('oh no').then(
        value => {
          throw new Error('Should not be here');
        },
        (err) => {
          expect(err).toEqual('oh no')
        }
      );
    });
  });

  describe('installStrict', () => {
    it('removes the resolve method', () => {
      keepbreak.installStrict();

      expect(() => {
        Promise.resolve();
      }).toThrowError('Promise.resolve is not a function');
    });

    it('removes the reject method', () => {
      keepbreak.installStrict();

      expect(() => {
        Promise.reject();
      }).toThrowError('Promise.reject is not a function');
    });

    it('allows the constructor executor parameter names to be "keep" & "braek", or be unspecified', () => {
      keepbreak.installStrict();

      const breakCheck = err => {
        expect(err).toEqual('err');
      }

      const promises = [
        new Promise((keep, braek) => keep()),
        new Promise((keep) => keep()),
        new Promise(keep => keep()),
        new Promise((keep, braek) => braek('err')).then(() => {}, breakCheck),
        new Promise((_, braek) => braek('err')).then(() => {}, breakCheck),

        new Promise(function(keep, braek) { keep() }),
        new Promise(function(keep) { keep() }),
        new Promise(function(keep) { keep() }),
        new Promise(function(keep, braek) { braek('err') }).then(() => {}, breakCheck),
        new Promise(function(_, braek) { braek('err') }).then(() => {}, breakCheck),

        new Promise(function fn(keep, braek) { keep() }),
        new Promise(function fn(keep) { keep() }),
        new Promise(function fn(keep) { keep() }),
        new Promise(function fn(keep, braek) { braek('err') }).then(() => {}, breakCheck),
        new Promise(function fn(_, braek) { braek('err') }).then(() => {}, breakCheck),
      ];

      // We have to reduce the promises sequentially because `installStrict` breaks `Promise.all` lol
      return promises.reduce((result, nextPromise) => result.then(nextPromise), Promise.keep());
    });

    it('throws an error if the first parameter is not called "keep"', () => {
      const badExecutors = [
        function(resolve, reject) {},
        function(resolve, braek) {},
        function(resolve) {},
        (resolve, braek) => {},
        (resolve) => {},
        resolve => {},
      ];
      keepbreak.installStrict();
      badExecutors.forEach(badExecutor => {
        expect(
          () => new Promise(badExecutor)
        ).toThrowError("must be called 'keep'")
      })
    });

    it('throws an error if the second parameter is not called "braek"', () => {
      // It can't be 'break' because that's a reserved word 😫
      const badExecutors = [
        function(keep, reject) {},
        function(keep, _) {},
        function(_, reject) {},
      ];
      keepbreak.installStrict();
      badExecutors.forEach(badExecutor => {
        expect(
          () => new Promise(badExecutor)
        ).toThrowError("and 'braek'")
      })
    });
  });

  describe('uninstall', () => {
    it('puts things back', () => {
      const originalResolve = Promise.resolve;
      const originalReject = Promise.reject;

      keepbreak.installStrict();
      keepbreak.uninstall();

      expect(Promise.resolve).toEqual(originalResolve);
      expect(Promise.reject).toEqual(originalReject);

      const promises = [
        Promise.resolve(),
        Promise.reject().then(() => {}, () => {}),
        new Promise(resolve => resolve()),
        new Promise((resolve, reject) => reject()).then(() => {}, () => {}),
      ]

      return Promise.all(promises);
    });
  });
});
