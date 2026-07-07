const express = require("express");

const app = express();

app.use(express.json({ limit: "20mb" }));

app.post("/webhook/chatwoot", (req, res) => {

    console.log("================================");
    console.log("WEBHOOK RECIBIDO");
    console.log("================================");

    console.log("EVENTO:", req.body.event);
    console.log("CONVERSACION:", req.body.id);

    console.log("MENSAJES:");

    console.log(JSON.stringify(req.body.messages, null, 2));

    res.sendStatus(200);

});

app.get("/", (req,res)=>{
    res.send("Servidor funcionando");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log("Servidor iniciado en puerto " + PORT);
});