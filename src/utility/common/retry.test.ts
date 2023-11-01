import { retry } from "./retry";
import { execSync } from "node:child_process";
import { buildConvertDocxToPdfCommand } from "../../services/document-conversion-service";

describe("retryFactory", () => {
  it("produces expected result and errors", async () => {
    const mockFunction = jest.fn();
    mockFunction.mockImplementationOnce(() => {
      throw new Error("error");
    });
    mockFunction.mockImplementationOnce(() => {
      throw new Error("error");
    });
    mockFunction.mockImplementationOnce(() => {
      return "success";
    });

    const response = retry(mockFunction, { maxRetries: 3 });

    expect(response.result).toBe("success");
    expect(response.errors.length).toBe(2);
  });

  it("produces undefined result and correct errors, when error count increments to maxRetries", async () => {
    const mockFunction = jest.fn();
    mockFunction.mockImplementationOnce(() => {
      throw new Error("error");
    });
    mockFunction.mockImplementationOnce(() => {
      throw new Error("error");
    });
    mockFunction.mockImplementationOnce(() => {
      throw new Error("error");
    });
    mockFunction.mockImplementationOnce(() => {
      return "success";
    });

    const response = retry(mockFunction, { maxRetries: 3 });

    expect(response.result).toBeUndefined();
    expect(response.errors.length).toBe(3);
  });

  it("produces undefined result and correct errors, when error count exceeds maxRetries", async () => {
    const mockFunction = jest.fn();
    mockFunction.mockImplementationOnce(() => {
      throw new Error("error");
    });
    mockFunction.mockImplementationOnce(() => {
      throw new Error("error");
    });
    mockFunction.mockImplementationOnce(() => {
      throw new Error("error");
    });
    mockFunction.mockImplementationOnce(() => {
      throw new Error("error");
    });
    mockFunction.mockImplementationOnce(() => {
      throw new Error("error");
    });
    mockFunction.mockImplementationOnce(() => {
      return "success";
    });

    const response = retry(mockFunction, { maxRetries: 3 });

    expect(response.result).toBeUndefined();
    expect(response.errors.length).toBe(3);
  });

  it("maintains original closure scope", () => {
    let testValue;
    retry(
      () => {
        testValue = "testValue";
      },
      { maxRetries: 10 },
    );

    expect(testValue).toBe("testValue");
  });
});
