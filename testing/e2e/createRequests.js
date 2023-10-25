var axios = require("axios");

const endpoint =
  " https://d2ecpkrcmf.execute-api.us-east-2.amazonaws.com/generateDocument";
const requestBody = {
  actorName: "Aethen",
  color: "brown",
  liquid: "mop-waters",
};
const templateId = "d192e487-d55f-447b-85d9-d2aad3e4fd5e";

go = async () => {
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

  console.log(`Results: ${results?.length}`);
  console.log(
    `Successes: ${results?.filter((result) => result.status === 200).length}`,
  );
};

go();
