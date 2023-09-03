import { handler } from "./mergeDocumentAndData";

const logSpy = jest.spyOn(console, "log");

describe("mergeDocumentAndData", () => {
    describe("handler", () => {
        it("should console.log('mergeDocumentAndData')", () => {
            handler();
            expect(logSpy).toHaveBeenCalledWith("mergeDocumentAndData");
        })
    })
})