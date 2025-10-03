import prisma from "@prisma/client";

import express from "express";
const port = 3000;
const app = express();
app.use(express.json());

app.get("/equipe", async (req, res) => {

  res.status(200).json({ message: "servidor rodando 😊" });
});

app.listen(port, ()=>{
    console.log('servidor rodando😊')
})
//http://localhost:3000/equipe
