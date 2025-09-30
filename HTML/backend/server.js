import express from "express"
const port = 3000
const app = express()
app.use(express.json())
let users = []
app.get("/usuarios",(req,res)=>{


    res.status(200).json({message:'Usuarios listado com sucesso😊'})
})

app.post('/usuarios/adicionar',(req,res)=>{
 const  {nome,equipe} = req.body;
    const dados = {
        nome,
        equipe
    }
    users.push(dados)

  res.status(200).json({ message: 'Usuario adicionado com sucesso' });
    
})
//http://localhost:3000

app.listen(port, ()=> console.log(`servidor rodando😊 na porta ${port} `))