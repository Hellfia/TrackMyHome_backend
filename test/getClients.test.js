const request = require("supertest");
const express = require("express");

const projectRouter = require("../routes/projects");
const Constructor = require("../models/constructors");
const Project = require("../models/projects");

jest.mock("../models/constructors");
jest.mock("../models/projects");

const app = express();
app.use(express.json());
app.use("/projects", projectRouter);

describe("GET /projects/clients/:constructorId/:token", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("doit retourner les données client quand constructorId et token valides sont fournis", async () => {
    const constructorId = "12345";
    const token = "validtoken";
    const mockConstructor = { _id: constructorId, token };
    const mockProjects = [{ client: { firstname: "John", lastname: "Doe" } }];

    Constructor.findOne.mockResolvedValue(mockConstructor);
    Project.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockProjects),
    });

    const res = await request(app).get(
      `/projects/clients/${constructorId}/${token}`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      result: true,
      data: mockProjects,
    });
  });

  it("doit retourner une erreur quand le constructorId ou le token sont invalides", async () => {
    const constructorId = "12345";
    const token = "invalidtoken";

    Constructor.findOne.mockResolvedValue(null);

    const res = await request(app).get(
      `/projects/clients/${constructorId}/${token}`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      result: false,
      error: "Constructeur non trouvé ou token invalide.",
    });
  });

  it("doit retourner une erreur quand aucun client n'est trouvé", async () => {
    const constructorId = "12345";
    const token = "validtoken";

    const mockConstructor = { _id: constructorId, token };

    Constructor.findOne.mockResolvedValue(mockConstructor);
    Project.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    });

    const res = await request(app).get(
      `/projects/clients/${constructorId}/${token}`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      result: false,
      error: "Aucun client trouvé pour ce constructeur.",
    });
  });
});
