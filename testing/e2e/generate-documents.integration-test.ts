import axios from "axios";

const SECONDS = 1000;
jest.setTimeout(600 * SECONDS);

const endpoint =
  " https://d2ecpkrcmf.execute-api.us-east-2.amazonaws.com/generateDocument";
const requestBody = {
  actorName: "Aethen",
  color: "brown",
  liquid: "mop-waters",
};
const templateId = "d192e487-d55f-447b-85d9-d2aad3e4fd5e";

describe("generateDocuments endpoint", () => {
  it("should generate documents - blast many requests simultaneously", async () => {
    const numberOfTests = 60;
    let results;
    try {
      results = await Promise.all(
        Array(numberOfTests)
          .fill(0)
          .map(() => axios.post([endpoint, templateId].join("/"), requestBody)),
      );
    } catch (error) {
      console.log(error);
    }

    expect(results.length).toBe(numberOfTests);
    expect(
      results.map((result) => result.status).every((status) => status === 200),
    ).toBe(true);
  });
  it("should generate documents - blast requests in rapid succession", async () => {
    const numberOfTests = 240;
    const requests = [];
    const successes = [];
    const failures = [];
    for (let i = 0; i < numberOfTests; i++) {
      try {
        requests.push(
          axios
            .post([endpoint, templateId].join("/"), requestBody, {
              timeout: 60 * 1000,
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

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    await Promise.allSettled(requests);

    console.log("successes.length: ", successes.length);
    console.log("failures.length: ", failures.length);

    expect(failures.length).toBe(0);
    expect(successes.length).toBe(numberOfTests);
  });
});
