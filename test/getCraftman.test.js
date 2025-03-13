const request = require("supertest");
const express = require("express");

const craftsmenRouter = require("../routes/craftsmen");
const Constructor = require("../models/constructors");

jest.mock("../models/connection", () => ({}));
jest.mock("../models/constructors");

const app = express();
app.use(express.json());
app.use("/craftsmen", craftsmenRouter);

describe("GET /craftsmen/:token", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("doit retourner les artisans quand un token valide est fourni et que des artisans existent", async () => {
    const token = "validtoken";
    const mockCraftsmen = [
      { craftsmanName: "Craftsman1" },
      { craftsmanName: "Craftsman2" },
    ];

    Constructor.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ craftsmen: mockCraftsmen }),
    });

    const res = await request(app).get(`/craftsmen/${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      result: true,
      data: mockCraftsmen,
    });
  });

  it("doit retourner une erreur 404 quand aucun constructeur n'est trouvé avec le token", async () => {
    const token = "invalidtoken";

    Constructor.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app).get(`/craftsmen/${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      result: false,
      error: "Craftsman not found",
    });
  });

  it("doit retourner une liste vide si aucun artisan n'est associé au constructeur", async () => {
    const token = "validtoken";

    Constructor.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ craftsmen: [] }),
    });

    const res = await request(app).get(`/craftsmen/${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      result: true,
      data: [],
    });
  });
});
