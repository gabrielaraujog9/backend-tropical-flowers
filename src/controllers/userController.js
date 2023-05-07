  const Prisma = require("@prisma/client");
  const jwt = require("jsonwebtoken");
  const bcrypt = require("bcrypt");

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

  function checkIdOfToken(req) {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    const objDecode = token ? decodeToken(token) : false;
  
    if (req.params.id !== objDecode.id || !objDecode) {
      return false;
    }
    return true;
  }
  const controller = {
    getAll: async (req, res) => {
      try {
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
      } catch (error) {
        console.log(error);

        return res.status(500).json({ message: "Erro inesperado no serviço!" });
      }
    },
    create: async (req, res) => {
      try {
        let user = req.body;
        const completedFields = filled(user);
        if (!completedFields.filled) {
          return res.status(422).json({ message: fill.message });
        }
        const valide = await valideIfExists(user);
        if (valide) {
          return res
            .status(409)
            .json({ message: "Usuário com E-mail ou CPF já cadastrado!" });
        }
        const passHash = await generatePassHash(user.password);
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

        const containsEmailAndPass = containsEmailAndPassword({
          email,
          password,
        });
        if (!containsEmailAndPass.contains) {
          return res.status(422).json({ message: containsEmailAndPass.message });
        }

        const valided = await valideIfExists({ email });
        if (!valided) {
          return res.status(404).json({ message: "Usuário não encontrado!" });
        }
        const user = await findByEmail(email);
        const passVerify = await comparePassword(password, user.password);

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
      try {
        const verifyToken = checkIdOfToken(req);
        if (!verifyToken) {
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
            id: req.params.id,
          },
        });

        return res.status(200).json({ user });
      } catch (error) {
        console.log(error);

        return res.status(500).json({ message: "Erro inesperado no serviço!" });
      }
    },
    updateById: async (req, res) => {
      try {
        const verifyToken = checkIdOfToken(req);
        if (!verifyToken) {
          return res.status(401).json({ message: "Acesso negado!" });
        }

        const { name, email, cpf, password } = req.body;

        const valideEmail = email ? await valideIfExists({ email }) : null;
        const valideCpf = cpf ? await valideIfExists({ cpf }) : null;

        if (valideEmail != null && valideEmail) {
          return res
            .status(409)
            .json({ message: "Usuário com E-mail já cadastrado!" });
        }
        if (valideCpf != null && valideCpf) {
          return res
            .status(409)
            .json({ message: "Usuário com CPF já cadastrado!" });
        }

        const updateUser = {};
        if (name) {
          updateUser.name = name;
        }
        if (email) {
          updateUser.email = email;
        }
        if (cpf) {
          updateUser.cpf = cpf;
        }
        if (password) {
          const passHash = await generatePassHash(password);
          updateUser.password = passHash;
        }

        await prisma.user.update({
          data: updateUser,
          where: {
            id: req.params.id,
          },
        });

        return res
          .status(200)
          .json({ message: "Usuário atualizado com sucesso!" });
      } catch (error) {
        console.log(error);

        return res.status(500).json({ message: "Erro inesperado no serviço!" });
      }
    },
    deleteById: async (req, res) => {
      try {
        const verifyToken = checkIdOfToken(req);
        if (!verifyToken) {
          return res.status(401).json({ message: "Acesso negado!" });
        }

        await prisma.user.delete({
          where: {
            id: req.params.id,
          },
        });

        return res.status(200).json({ message: "Usuário deletado!" });
      } catch (error) {
        console.log(error);

        return res.status(500).json({ message: "Erro inesperado no serviço!" });
      }
    },
  };

  module.exports = controller;
