// On évite la connexion réelle à la base de données en mockant le module de connexion
jest.mock("../models/connection", () => ({}));
jest.mock("../models/clients");

const request = require("supertest");
const express = require("express");

// Import du modèle et du routeur
const Client = require("../models/clients");
const clientRouter = require("../routes/clients");

const app = express();
app.use(express.json());
app.use("/", clientRouter);

describe("GET /:token", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("devrait retourner le client si le token est valide", async () => {
    const token = "validtoken";
    const fakeClient = { firstname: "John", lastname: "Doe", token };

    // Simuler la méthode findOne pour qu'elle retourne fakeClient
    Client.findOne.mockResolvedValue(fakeClient);

    const res = await request(app).get(`/${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      result: true,
      client: fakeClient,
    });
  });

  it("devrait retourner une erreur 404 si aucun client n'est trouvé", async () => {
    const token = "invalidtoken";

    // Simuler la méthode findOne pour qu'elle retourne null
    Client.findOne.mockResolvedValue(null);

    const res = await request(app).get(`/${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      result: false,
      error: "Client not found",
    });
  });
});
