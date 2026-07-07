const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json({ limit: "20mb" }));

app.post("/webhook/chatwoot", async (req, res) => {

    try {

        const mensaje =
            req.body.messages?.[0]?.content_attributes?.processed_message_content || "";

        const conversationId = req.body.id;

        if (
            mensaje.includes("¡Hola! Quiero más información") ||
            mensaje.includes("fb.me") ||
            mensaje.includes("ig.me")
        ) {

            console.log("Publicidad detectada");

            // Agregar etiqueta
            await axios.post(
                `${process.env.CHATWOOT_URL}/api/v1/accounts/${process.env.ACCOUNT_ID}/conversations/${conversationId}/labels`,
                {
                    labels: [
                        "redes-pos-cliente"
                    ]
                },
                {
                    headers: {
                        api_access_token: process.env.CHATWOOT_TOKEN
                    }
                }
            );

            console.log("Etiqueta agregada");

            // Asignar agente
            await axios.post(
                `${process.env.CHATWOOT_URL}/api/v1/accounts/${process.env.ACCOUNT_ID}/conversations/${conversationId}/assignments`,
                {
                    assignee_id: Number(process.env.RAFAEL_ID)
                },
                {
                    headers: {
                        api_access_token: process.env.CHATWOOT_TOKEN
                    }
                }
            );

            console.log("Asignado a Rafael");
        }

    } catch (e) {

        console.log("ERROR");
        console.log(e.response?.data || e.message);

    }

    res.sendStatus(200);

});

app.get("/", (req, res) => {
    res.send("Servidor funcionando");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor iniciado en puerto " + PORT);
});