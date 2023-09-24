import { handler } from "src/handlers/generateDocument/generateDocument";
import axios from "axios";
jest.mock("axios", () => ({
  ...jest.requireActual("axios"),
  get: jest.fn(),
}));

describe("generateDocument", () => {
  describe("handler", () => {
    it("should return a response", async () => {
      const event = { mock: "event" };

      const response = await handler(event);

      expect(response).toBeTruthy();
    });

    it("should call axios.get()", async () => {
      const event = { mock: "event" };

      await handler(event);

      expect(axios.get).toHaveBeenCalled();
    });
  });
});
