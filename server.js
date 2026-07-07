const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json({ limit: "20mb" }));


app.post("/webhook/chatwoot", async (req, res) => {

    console.log("🔥 WEBHOOK RECIBIDO");

    try {

        console.log(JSON.stringify(req.body, null, 2));


        const data = req.body;

        if (!data) {
            console.log("⚠️ No existe attributes");
            return res.sendStatus(200);
        }


        console.log("Evento:", data.event);

        // ─── NUEVO: alta automática de prospecto por etiqueta ───
if (data.event === "conversation_updated") {
    const labels = data.labels || data.conversation?.labels || [];

    console.log("🏷️ Etiquetas en conversation_updated:", labels);

    const conversationId = data.id || data.conversation?.id;
    const contacto = data.meta?.sender || data.contact || {};
    const telefono = contacto.phone_number;
    const nombreContacto = contacto.name;

    let origen = null;
    let chatwootAgentId = null;

    if (labels.includes("prospecto-redes")) {
        console.log("📱 Etiqueta prospecto-redes detectada");
        origen = "prospecto-redes";
        chatwootAgentId = null; // siempre Rafael, no hace falta el agente
    }

    if (labels.includes("prospecto-interno")) {
        console.log("💬 Etiqueta prospecto-interno detectada");
        origen = "prospecto-interno";
        chatwootAgentId = data.conversation?.assignee_id || data.meta?.assignee?.id || null;
    }

    if (!origen) {
        console.log("Sin etiquetas de prospecto relevantes, se ignora");
        return res.sendStatus(200);
    }

    console.log("DEBUG telefono:", telefono, "| nombreContacto:", nombreContacto);
    console.log('DEBUG origen:', origen, '| chatwoot_agent_id:', chatwootAgentId);

    if (!telefono) {
        console.log("⚠️ No se encontró teléfono en el payload, no se puede crear el prospecto");
        return res.sendStatus(200);
    }

    try {
        const resp = await axios.post(
            `${process.env.PROSPECTOS_SM_URL}/api/prospectos/auto-crear`,
            { nombre_contacto: nombreContacto, telefono, origen, chatwoot_agent_id: chatwootAgentId },
            { headers: { 'x-api-key': process.env.PROSPECTOS_SM_API_KEY } }
        );
        console.log("✅ Prospecto creado/verificado en prospectos-sm:", resp.data);
    } catch (err) {
        console.log("❌ Error creando prospecto en prospectos-sm:", err.response?.data || err.message);
    }

    return res.sendStatus(200);
}
        console.log("Tipo mensaje:", data.message_type);
        console.log("Conversación:", data.conversation?.id);


        // Solo procesar mensajes nuevos de clientes

        if (data.event !== "message_created") {
            console.log("Evento ignorado:", data.event);
            return res.sendStatus(200);
        }


        if (data.message_type !== "incoming") {
            console.log("Mensaje no entrante, ignorado");
            return res.sendStatus(200);
        }


        const mensaje = data.content || "";
        const conversationId = data.conversation?.id;


        console.log("Mensaje:", mensaje);
        console.log("ID conversación:", conversationId);



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

            console.log(
                "Asignando conversación",
                conversationId,
                "a usuario",
                process.env.RAFAEL_ID
            );


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

            // ENVIAR MENSAJE AUTOMÁTICO

await axios.post(
    `${process.env.CHATWOOT_URL}/api/v1/accounts/${process.env.ACCOUNT_ID}/conversations/${conversationId}/messages`,
    {
        content: `¡Hola! 👋 Gracias por comunicarte con *SM Soluciones*.

Para poder asesorarte mejor, contanos:

✅ ¿Qué tipo de negocio tenés?

✅ ¿Qué necesitás gestionar?
- Stock
- Ventas
- Facturación
- Cuentas corrientes clientes/proveedores
- Imprimir etiquetas
- Vinculación con códigos de barra de balanza
- Otro

Además podemos coordinar una demostración gratuita por Zoom para mostrarte el funcionamiento del sistema.

📅 ¿Qué día y horario te queda cómodo?`,
        message_type: "outgoing",
        private: false
    },
    {
        headers: {
            api_access_token: process.env.CHATWOOT_TOKEN
        }
    }
);

console.log("💬 Mensaje enviado");

        } else {

            console.log("No es publicidad");

        }



    } catch (e) {

        console.log("❌ ERROR");

        console.log(
            e.response?.data || e.message
        );

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