const OriginalPromise = Promise;

const validateExecutorArgs = executor => {
  const fn = executor.toString();

  const happyCases = [
    /^function ?[^(]*? ?\((keep|(keep|_), ?braek)?\)/,
    /^\((keep|(keep|_), ?braek)?\) =>/,
    /^keep ?=>/,
  ];

  if (!happyCases.some(happyCase => fn.match(happyCase))) {
    throw new Error("Parameters to `new Promise()` must be called 'keep' and 'braek'")
  }
}

const install = () => {
  Promise.keep = Promise.resolve;
  Promise.break = Promise.reject;
};

const installStrict = () => {
  Promise = function(executor) {
    validateExecutorArgs(executor);
    return new OriginalPromise(executor);
  };
  Object.getOwnPropertyNames(OriginalPromise).forEach(propertyName => {
    Promise[propertyName] = OriginalPromise[propertyName];
  });

  install();

  delete Promise.resolve;
  delete Promise.reject;
};

const uninstall = () => {
  Promise.resolve = Promise.keep;
  Promise.reject = Promise.break;

  delete Promise.keep;
  delete Promise.break;

  Promise = OriginalPromise;
};

module.exports = { install, installStrict, uninstall }
