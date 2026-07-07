const express = require("express");

const app = express();

app.use(express.json({ limit: "20mb" }));

app.post("/webhook/chatwoot", (req, res) => {

    console.log("================================");
    console.log("WEBHOOK RECIBIDO");
    console.log("================================");

    console.log(JSON.stringify(req.body, null, 2));

    res.sendStatus(200);

});

app.get("/", (req,res)=>{
    res.send("Servidor funcionando");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log("Servidor iniciado en puerto " + PORT);
});