import { handler } from "./mergeDocumentAndData";

const logSpy = jest.spyOn(console, "log");

describe("mergeDocumentAndData", () => {
  describe("handler", () => {
    it("should console.log('mergeDocumentAndData')", async () => {
      const event = { mock: "event" };

      await handler(event);

      expect(logSpy).toHaveBeenCalledWith(
        "mergeDocumentAndData",
        expect.objectContaining({ event }),
      );
    });
  });
});
