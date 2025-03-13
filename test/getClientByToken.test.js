jest.mock("../models/connection", () => ({}));
jest.mock("../models/clients");

const request = require("supertest");
const express = require("express");

const Client = require("../models/clients");
const clientRouter = require("../routes/clients");

const app = express();
app.use(express.json());
app.use("/clients", clientRouter);

describe("GET /clients/:token", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("doit retourner le client si le token est valide", async () => {
    const token = "validtoken";
    const fakeClient = { firstname: "John", lastname: "Doe", token };

    Client.findOne.mockResolvedValue(fakeClient);

    const res = await request(app).get(`/clients/${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      result: true,
      client: fakeClient,
    });
  });

  it("doit retourner une erreur 404 si aucun client n'est trouvé", async () => {
    const token = "invalidtoken";

    Client.findOne.mockResolvedValue(null);

    const res = await request(app).get(`/clients/${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      result: false,
      error: "Client not found",
    });
  });
});