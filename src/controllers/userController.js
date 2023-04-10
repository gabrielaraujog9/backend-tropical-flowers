require('dotenv').config()
const Prisma = require('@prisma/client');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const prisma = new Prisma.PrismaClient()

var controller = {
  //Get All Users
  getAllUsers: async (req, res) => {

    const users = await prisma.user.findMany({
      select:{
        id: false,
        password: false,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        cpf: true,
        cart: true
      }
    })
  
    return res.status(200).json(users)
  },

  //Create User
  createUser: async (req, res) => {

    let {name, email, cpf, password} = req.body
    
    if(!name){
      return res.status(422).json({message: "O nome não foi preenchido!"})
    }
    if(!email){
      return res.status(422).json({message: "O email não foi preenchido!"})
    }
    if(!cpf){
      return res.status(422).json({message: "O cpf não foi preenchido!"})
    }
    if(!password){
      return res.status(422).json({message: "A senha não foi preenchido!"})
    }

    const userEmailVerify = await prisma.user.findMany({
      select:{
        name: true,
        email: true,
        cpf: true
      },
      where: {
        OR: [
          {
            email
          },
          {
            cpf
          }
        ]
        
      }

    })
    
    if(userEmailVerify.length > 0){
      return res.status(409).json({message: "Usuário com E-mail ou CPF já cadastrado!"})
    }

    const salt = await bcrypt.genSalt(12)
    const passHash = await bcrypt.hash(password, salt)

    try{
      await prisma.user.create({data: {
        name,
        email,
        cpf,
        password: passHash
      }})

      return res.status(201).json({message: "Usuário criado com sucesso!"})
    }catch(error){
      console.log(error)

      return res.status(500).json({message: "Erro inesperado no serviço!"})
    }
  },

  //Login
  loginUser: async (req, res) =>{
    let {email, password} = req.body
  
    if(!email || email == ""){
      return res.status(422).json({message: "O email não foi preenchido!"})
    }
    if(!password || password == ""){
      return res.status(422).json({message: "A senha não foi preenchido!"})
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email    
      }
    })
    
    if(!user){
      return res.status(404).json({message: "Usuário não encontrado!"})
    }

    const passVerify = await bcrypt.compare(password, user.password)
    
    if(!passVerify){
      return res.status(422).json({message: "Senha incorreta!"})
    }
    
    try {
      const secret = process.env.SECRET
      const idSalf = await bcrypt.genSalt(12)
      const idHash = await bcrypt.hash(user.id, idSalf)
      
      const token = jwt.sign({
          id: idHash
        }, 
        secret
      )
      
      return res.status(200).json({message: "Autenticação realizada com sucesso!", token})

    } catch (error) {
      console.log(error)

      return res.status(500).json({message: "Erro inesperado no serviço!"})
    }
  },

  getUserById: async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    const {id} = jwt.decode(token)

    const idParams = req.params.id;
    
    if(idParams !== id){
      return res.status(401).json({message: "Acesso negado!"}) 
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
        cart: true
      },
      where:{
        id
      }
    })

    return res.status(200).json({user})
  },

  updateUserById: async (req, res) => {
    
  }
};




module.exports = controller;