const Prisma = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const prisma = new Prisma.PrismaClient();

function filled({ name, description, price, image, stock }) {
  if (!name) {
    return { filled: false, message: "O nome não foi preenchido!" };
  }
  if (!description) {
    return { filled: false, message: "A descrição não foi preenchida!" };
  }
  if (!price) {
    return { filled: false, message: "O preço não foi preenchido!" };
  }
  if (!image) {
    return { filled: false, message: "A imagem não foi inserida!" };
  }
  if (!stock) {
    return { filled: false, message: "O stock não foi inserida!" };
  }
  return { filled: true };
}

const controller = {
  getAll: async (req, res) => {
    try {
      const products = await prisma.product.findMany({
        select: {
          id: false,
          name: true,
          description: true,
          price: true,
          stock: true,
          _count: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.status(200).json(products);
    } catch (error) {
      console.log(error);

      return res.status(500).json({ message: "Erro inesperado no serviço!" });
    }
  },
  getById: async (req, res) => {
    try {
      const product = await prisma.product.findUnique({
        select: {
          id: false,
          name: true,
          description: true,
          price: true,
          stock: true,
          _count: true,
          createdAt: true,
          updatedAt: true,
          image: true,
        },
        where: {
          id: req.params.id,
        },
      });

      return res.status(200).json({ product });
    } catch (error) {
      console.log(error);

      return res.status(500).json({ message: "Erro inesperado no serviço!" });
    }
  },
  create: async (req, res) => {
    try {
      let { name, description, price, image, stock } = req.body;

      const completedFields = filled({
        name,
        description,
        price,
        image,
        stock,
      });
      if (!completedFields.filled) {
        return res.status(422).json({ message: fill.message });
      }

      await prisma.product.create({
        data: {
          name: name,
          description: description,
          price: price,
          image: image,
          stock: stock,
        },
      });
      return res.status(201).json({ message: "Produto criado com sucesso!" });
    } catch (error) {
      console.log(error);

      return res.status(500).json({ message: "Erro inesperado no serviço!" });
    }
  },
  update: (req, res) => {},
  delete: (req, res) => {},
};

module.exports = controller;
