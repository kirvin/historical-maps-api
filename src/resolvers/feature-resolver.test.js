import FeatureResolver, { parseDateValue } from "./feature-resolver.ts";

describe("FeatureResolver", () => {
  describe("date parsing", () => {
    it("parses an AD date correctly", () => {
      const date = new Date()
      const dateString = "2000-12-12 12:34:56.789"
      const timestamp = 976653296789;
      const parsedDate = parseDateValue(dateString);

      expect(parsedDate.getTime()).toEqual(timestamp);
    });

    it("parses a BC date correctly", () => {
      const date = new Date()
      const dateString = "-002000-12-12 12:34:56.789"
      const timestamp = -125251155125211;
      const parsedDate = parseDateValue(dateString);

      expect(parsedDate.getTime()).toEqual(timestamp);
    });

    it("parses a 3-digit BC date correctly", () => {
      const date = new Date()
      const dateString = "-000400-12-12 12:34:56.789"
      const timestamp = -74760031925211;
      const parsedDate = parseDateValue(dateString);

      expect(parsedDate.getTime()).toEqual(timestamp);
    });
  })
});