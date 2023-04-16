require("dotenv").config();
const Prisma = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const e = require("express");

const prisma = new Prisma.PrismaClient();

function filled({ name, email, cpf, password }) {
  if (!name) {
    return { filled: false, message: "O nome não foi preenchido!" };
  }
  if (!email) {
    return { filled: false, message: "O email não foi preenchido!" };
  }
  if (!cpf) {
    return { filled: false, message: "O cpf não foi preenchido!" };
  }
  if (!password) {
    return { filled: false, message: "A senha não foi preenchido!" };
  }
  return { filled: true };
}
function generateToken(payload) {
  const secret = process.env.SECRET;
  return jwt.sign(payload, secret);
}
async function comparePassword(passNormal, passHash) {
  return await bcrypt.compare(passNormal, passHash);
}
async function valideIfExists({ id, email, cpf }) {
  const codition = [];
  if (id) {
    codition.push({ id });
  }
  if (email) {
    codition.push({ email });
  }
  if (cpf) {
    codition.push({ cpf });
  }

  const userEmailVerify = await prisma.user.findMany({
    where: {
      OR: codition,
    },
  });
  if (userEmailVerify.length > 0) {
    return true;
  }
  return false;
}
async function generatePassHash(password) {
  const salt = await bcrypt.genSalt(12);
  const passHash = await bcrypt.hash(password, salt);
  return passHash;
}

function containsEmailAndPassword({ email, password }) {
  if (!email || email == "") {
    return { contains: false, message: "O email não foi preenchido!" };
  }
  if (!password || password == "") {
    return { contains: false, message: "A senha não foi preenchido!" };
  }
  return { contains: true };
}
async function findByEmail(email) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  return user;
}

function decodeToken(token) {
  return jwt.decode(token);
}

const controller = {
  getAll: async (req, res) => {
    const users = await prisma.user.findMany({
      select: {
        id: false,
        password: false,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        cpf: true,
        cart: true,
      },
    });

    return res.status(200).json(users);
  },
  create: async (req, res) => {
    try {
      let user = req.body;
      const fill = filled(user);
      if (!fill.filled) {
        return res.status(422).json({ message: fill.message });
      }
      const valide = valideIfExists(user);
      if (valide) {
        return res
          .status(409)
          .json({ message: "Usuário com E-mail ou CPF já cadastrado!" });
      }
      const passHash = await generatePassHash();
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          password: passHash,
        },
      });
      return res.status(201).json({ message: "Usuário criado com sucesso!" });
    } catch (error) {
      console.log(error);

      return res.status(500).json({ message: "Erro inesperado no serviço!" });
    }
  },
  login: async (req, res) => {
    try {
      let { email, password } = req.body;

      const containsEmailAndPassword = containsEmailAndPassword({
        email,
        password,
      });
      if (!containsEmailAndPassword.contains) {
        return res
          .status(422)
          .json({ message: containsEmailAndPassword.message });
      }

      const valided = valideIfExists({ email });
      if (!valided) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
      }
      const user = findByEmail(email);

      const passVerify = comparePassword(password, user.password);

      if (!passVerify) {
        return res.status(422).json({ message: "Senha incorreta!" });
      }
      const token = generateToken({
        id: user.id,
      });
      return res
        .status(200)
        .json({ message: "Autenticação realizada com sucesso!", token });
    } catch (error) {
      console.log(error);

      return res.status(500).json({ message: "Erro inesperado no serviço!" });
    }
  },
  getById: async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    const objDecode = token ? decodeToken(token) : false;

    if (req.params.id !== objDecode.id || !objDecode) {
      return res.status(401).json({ message: "Acesso negado!" });
    }

    const user = await prisma.user.findUnique({
      select: {
        id: false,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        password: false,
        cpf: true,
        cart: true,
      },
      where: {
        id: objDecode.id,
      },
    });

    return res.status(200).json({ user });
  },
  updateById: async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const { id } = jwt.decode(token);

    const idParams = req.params.id;

    if (idParams !== id) {
      return res.status(401).json({ message: "Acesso negado!" });
    }

    const userRequest = req.body;

    const userCompare = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    const salt = await bcrypt.genSalt(12);
    const userUpdate = {
      name:
        userCompare.name != userRequest.name
          ? userRequest.name
          : userCompare.name,
      email:
        userCompare.email != userRequest.email
          ? userRequest.email
          : userCompare.email,
      password: (await bcrypt.compare(
        userRequest.password,
        userCompare.password
      ))
        ? userCompare.password
        : await bcrypt.hash(userRequest.password, salt),
      //cpf:
    };
  },
};

module.exports = controller;
