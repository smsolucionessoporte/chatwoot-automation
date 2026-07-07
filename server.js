const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json({ limit: "20mb" }));

app.post("/webhook/chatwoot", async (req, res) => {

    console.log("🔥 WEBHOOK RECIBIDO");

    try {

        const data = req.body.attributes;

        console.log("Evento:", data.event);
        console.log("Tipo mensaje:", data.message_type);
        console.log("Conversación:", data.conversation.id);

        if (!data) {
            console.log("Sin attributes");
            return res.sendStatus(200);
        }

            const mensaje = data.content || "";
            const conversationId = data.conversation?.id;

            console.log("Mensaje:", mensaje);
            console.log("Conversacion:", conversationId);

            if (data.message_type !== "incoming") {
                console.log("Mensaje no entrante, ignoro");
                return res.sendStatus(200);
            }

            const esPublicidad =
                mensaje.includes("Quiero más información") ||
                mensaje.includes("fb.me") ||
                mensaje.includes("ig.me");

            if (esPublicidad) { 
            console.log("📢 Publicidad detectada");


            // AGREGAR ETIQUETA

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

            console.log("🏷️ Etiqueta agregada");



        // ASIGNAR A RAFAEL

        console.log("Asignando conversación", conversationId, "a usuario", process.env.RAFAEL_ID);

        const asignacion = await axios.post(
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

        console.log("Respuesta asignación:");
        console.log(asignacion.data);

        console.log("👤 Asignado a Rafael");
                }


    } catch (e) {

        console.log("❌ ERROR");
        console.log(e.response?.data || e.message);

    }


    res.sendStatus(200);

});


app.get("/", (req,res)=>{
    res.send("Servidor funcionando");
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("Servidor iniciado en puerto " + PORT);
});