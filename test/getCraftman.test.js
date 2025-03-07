// On évite la connexion réelle à la base de données en mockant le module de connexion
jest.mock("../models/connection", () => ({}));
// On mocke le modèle Project pour simuler les appels à la BDD
jest.mock("../models/projects");

const request = require("supertest");
const express = require("express");

const Project = require("../models/projects");
// Supposons que la route soit définie dans le routeur du module projects
const projectRouter = require("../routes/projects");

const app = express();
app.use(express.json());
app.use("/", projectRouter);

describe("GET /craftsmen/:constructorId", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("devrait retourner les données quand un constructorId valide est fourni et que des données existent", async () => {
    const constructorId = "12345";
    const fakeData = [
      { Craftsmen: [{ name: "Craftsman1" }], _id: "projectId1" },
    ];

    // Simuler la chaîne find().populate() pour renvoyer fakeData
    Project.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(fakeData),
    });

    const res = await request(app).get(`/craftsmen/${constructorId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      result: true,
      data: fakeData,
    });
  });

  it("devrait retourner une erreur quand aucune donnée n'est trouvée pour le constructorId fourni", async () => {
    const constructorId = "12345";

    // Simuler find().populate() qui renvoie null
    Project.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app).get(`/craftsmen/${constructorId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      result: false,
      error: "Craftsman not found !",
    });
  });
});
