const Prisma = require("@prisma/client");

const prisma = new Prisma.PrismaClient();

const controller = {
  create: async (req, res) => {
    try {
      const userId = req.params.userId;

      const verifyUserCreated = await prisma.shoppingCart.findUnique({
        where: {
          userId,
        },
      });
      if (verifyUserCreated != null) {
        return res.status(200).json({
          message: "Já existe carrinho de compra criado para este usuário!",
        });
      } else {
        await prisma.shoppingCart.create({
          data: {
            userId,
          },
        });
        return res
          .status(200)
          .json({ message: "Carrinho de compra criado com sucesso!" });
      }
    } catch (error) {
      console.log(error);

      return res.status(500).json({ message: "Erro inesperado no serviço!" });
    }
  },
  delete: async (req, res) => {
    try {
      const userId = req.params.id;
      const verifyUserCreated = await prisma.user.findUnique({
        where: {
          id: userId
        },
      });
      if (verifyUserCreated == null) {
        return res.status(200).json({
          message: "Não existe carrinho de compra criado para este usuário!",
        });
      } else {
        await prisma.shoppingCart.delete({
          where: {
            userId,
          },
        });
        return res
          .status(200)
          .json({ message: "Carrinho de compra deletado com sucesso!" });
      }
    } catch (error) {
      console.log(error);

      return res.status(500).json({ message: "Erro inesperado no serviço!" });
    }
  },
};

module.exports = controller;
