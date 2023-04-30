const app = require("../../src/app");
const request = require("supertest");
const Prisma = require("@prisma/client");
const prisma = new Prisma.PrismaClient();

describe("Métodos da API de Usuários", ()=>{
  it("Testando criação de um novo usuário", async () => {
    const res = await request(app).post("/users/register").send({
      name: "Breno Henrique",
      email: "sfudkhjfjdsg@gmail.com",
      cpf: "4342314344",
      password: "testestes",
    });
    expect(res.body.message).toBe("Usuário criado com sucesso!");
  });

  it("Testando criação de um usuário existente", async () => {
    const res = await request(app).post("/users/register").send({
      name: "Breno Henrique",
      email: "sfudkhjfjdsg@gmail.com",
      cpf: "4342314344",
      password: "testestes",
    });
    expect(res.body.message).toBe("Usuário com E-mail ou CPF já cadastrado!");
  });

  afterAll(async () => {
    await prisma.user.delete({
      where: {
        email: "sfudkhjfjdsg@gmail.com"
      }
    })
  })
})
