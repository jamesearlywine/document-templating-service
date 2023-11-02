import axios from "axios";

const SECONDS = 1000;
jest.setTimeout(600 * SECONDS);

const endpoint =
  "https://gp1jdhxmoj.execute-api.us-east-2.amazonaws.com/generatedDocument";
const requestBody = {
  actorName: "Aethen",
  color: "brown",
  liquid: "mop-waters",
};
const templateId = "d192e487-d55f-447b-85d9-d2aad3e4fd5e";

describe("generateDocuments endpoint load tests", () => {
  const testCases = [
    // { numberOfTests: 1, timeBetweenTestsMs: 1000 },
    // { numberOfTests: 2, timeBetweenTestsMs: 1000 },
    // { numberOfTests: 3, timeBetweenTestsMs: 1000 },
    // { numberOfTests: 240, timeBetweenTestsMs: 2000 }, // 1 per 2 seconds, sustained for 480 seconds
    // { numberOfTests: 240, timeBetweenTestsMs: 1000 }, // 1 per second, sustained for 240 seconds
    // { numberOfTests: 60, timeBetweenTestsMs: 500 }, // 2 per second, sustained for 30 seconds
    // { numberOfTests: 60, timeBetweenTestsMs: 100 }, // finished in 19 seconds, 6 per second, sustained for 10 seconds
    // { numberOfTests: 60, timeBetweenTestsMs: 1 }, // blast 60 requests in 1 second
    // { numberOfTests: 120, timeBetweenTestsMs: 1 }, // blast 120 requests in 1 second
    // { numberOfTests: 240, timeBetweenTestsMs: 1 }, // blast 240 requests in 1 second
    // { numberOfTests: 3000, timeBetweenTestsMs: 2 }, // 50 per second sustained for 60 seconds
    { numberOfTests: 1200, timeBetweenTestsMs: 50 }, // 20 per second sustained for 60 seconds
    // { numberOfTests: 1200, timeBetweenTestsMs: 100 }, // 10 per second sustained for 120 seconds
    // { numberOfTests: 360, timeBetweenTestsMs: 166 }, // 6 per second, sustained for 60 seconds
    // { numberOfTests: 240, timeBetweenTestsMs: 250 }, // 4 per second, sustained for 60 seconds
    // { numberOfTests: 480, timeBetweenTestsMs: 250 }, // 4 per second, sustained for 120 seconds
    // { numberOfTests: 360, timeBetweenTestsMs: 333 }, // 3 per second, sustained for 120 seconds
    // { numberOfTests: 720, timeBetweenTestsMs: 333 }, // 3 per second, sustained for 240 seconds
    // { numberOfTests: 480, timeBetweenTestsMs: 500 }, // 2 per second, sustained for 240 seconds
    // { numberOfTests: 960, timeBetweenTestsMs: 500 }, // 2 per second, sustained for 480 seconds
  ];
  test.each(testCases)(
    "should generate documents when %p",
    async (testCase) => {
      const numberOfTests = testCase.numberOfTests;
      const timeBetweenTestsMs = testCase.timeBetweenTestsMs;
      const requests = [];
      const successes = [];
      const failures = [];
      for (let i = 0; i < numberOfTests; i++) {
        try {
          requests.push(
            axios
              .post([endpoint, templateId].join("/"), requestBody, {
                timeout: 10 * 1000,
              })
              .then((response) => {
                if (response.status === 200) successes.push(response);
              })
              .catch((error) => {
                failures.push(error);
              }),
          );
        } catch (error) {
          console.log(error);
        }

        await new Promise((resolve) => setTimeout(resolve, timeBetweenTestsMs));
      }

      await Promise.allSettled(requests);

      console.log("successes.length: ", successes.length);
      console.log("failures.length: ", failures.length);

      expect(failures.length).toBe(0);
      expect(successes.length).toBe(numberOfTests);
    },
  );
});
