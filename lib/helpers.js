function getAllTests (tests, childSuites) {
  return tests
    .concat(...childSuites.map(childSuite => getAllTests(childSuite.tests, childSuite.childSuites)));
}

function collectSuiteStartData (tests, childSuites) {
  return {
    testCounts: {
      total: getAllTests(tests, childSuites).length
    }
  };
}

function collectSuiteEndData (tests, childSuites) {
  const all = getAllTests(tests, childSuites);

  const testCounts = {
    passed: all.filter((test) => test.status === 'passed').length,
    failed: all.filter((test) => test.status === 'failed').length,
    skipped: all.filter((test) => test.status === 'skipped').length,
    todo: all.filter((test) => test.status === 'todo').length,
    total: all.length
  };

  let status;
  if (testCounts.failed > 0) {
    status = 'failed';
  } else if (testCounts.skipped > 0 && testCounts.passed === 0) {
    status = 'skipped';
  } else if (testCounts.todo > 0 && testCounts.passed === 0) {
    status = 'todo';
  } else {
    status = 'passed';
  }

  let runtime = null;
  if (status !== 'skipped') {
    runtime = all.reduce((sum, test) => {
      return sum + (test.status === 'skipped' ? 0 : test.runtime);
    }, 0);
  }

  return {
    status,
    testCounts,
    runtime
  };
}

function createSuiteStart (suiteEnd) {
  return {
    name: suiteEnd.name,
    fullName: suiteEnd.fullName.slice(),
    tests: suiteEnd.tests.map(createTestStart),
    childSuites: suiteEnd.childSuites.map(createSuiteStart),
    testCounts: {
      total: suiteEnd.testCounts.total
    }
  };
}

function createTestStart (testEnd) {
  return {
    name: testEnd.name,
    suiteName: testEnd.suiteName,
    fullName: testEnd.fullName.slice()
  };
}

module.exports = {
  collectSuiteStartData,
  collectSuiteEndData,
  createSuiteStart,
  createTestStart
};
