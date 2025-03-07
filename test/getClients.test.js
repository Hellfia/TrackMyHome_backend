const request = require("supertest");
const express = require("express");

// Import du routeur qui contient la route à tester
const projectRouter = require("../routes/projects");
// Import du modèle Project pour pouvoir le simuler
const Project = require("../models/projects");

// On simule le modèle Project pour éviter d'interroger la BDD réelle
jest.mock("../models/projects");

const app = express();
app.use(express.json());
app.use("/", projectRouter);

describe("GET /clients/:constructorId", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("devrait retourner les données client quand un constructorId est fourni", async () => {
    const constructorId = "12345";
    const mockData = [{ client: { firstname: "John", lastname: "Doe" } }];

    // On simule la chaîne de méthode find().populate() pour qu'elle résolve mockData
    Project.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockData),
    });

    const res = await request(app).get(`/clients/${constructorId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      result: true,
      data: mockData,
    });
  });

  it("devrait retourner une erreur quand aucun client n'est trouvé", async () => {
    const constructorId = "12345";

    // On simule find().populate() qui renvoie null
    Project.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app).get(`/clients/${constructorId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      result: false,
      error: "Client not found !",
    });
  });
});
