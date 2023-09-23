import { handler } from "./mergeDocumentAndData";

describe("mergeDocumentAndData", () => {
  describe("handler", () => {
    it("should return event in response)", async () => {
      const event = { mock: "event" };

      const response = await handler(event);

      expect(response).toStrictEqual(
        expect.objectContaining({
          event,
        }),
      );
    });
  });
});
