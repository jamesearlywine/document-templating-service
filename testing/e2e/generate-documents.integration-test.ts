import axios from "axios";

const endpoint =
  " https://d2ecpkrcmf.execute-api.us-east-2.amazonaws.com/generateDocument";
const requestBody = {
  actorName: "Aethen",
  color: "brown",
  liquid: "mop-waters",
};
const templateId = "d192e487-d55f-447b-85d9-d2aad3e4fd5e";

describe("generateDocuments endpoint", () => {
  it("should generate documents", async () => {
    const numberOfTests = 60;
    let resultsPromise;
    try {
      resultsPromise = Promise.all(
        Array(numberOfTests)
          .fill(0)
          .map(() => axios.post([endpoint, templateId].join("/"), requestBody)),
      );
    } catch (error) {
      console.log(error);
    }

    // await new Promise((resolve) => setTimeout(resolve, 20 * 1000)); // wait 10 seconds
    //
    // let results2Promise;
    // try {
    //   results2Promise = await Promise.all(
    //     Array(numberOfTests)
    //       .fill(0)
    //       .map(() => axios.post([endpoint, templateId].join("/"), requestBody)),
    //   );
    // } catch (error) {
    //   console.log(error);
    // }

    const results = await resultsPromise;
    expect(results.length).toBe(numberOfTests);
    expect(
      results.map((result) => result.status).every((status) => status === 200),
    ).toBe(true);

    // const results2 = await results2Promise;
    // expect(results2.length).toBe(numberOfTests);
    // expect(
    //   results2.map((result) => result.status).every((status) => status === 200),
    // ).toBe(true);
  });
});
