const express = require('express');
const router = express.Router();

// POST /api/face/detect
router.post('/detect', async (req, res) => {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
        return res.status(400).json({ error: 'No se proporcionó la imagen para el análisis.' });
    }

    const endpoint = process.env.AZURE_FACE_ENDPOINT || process.env.VITE_AZURE_FACE_ENDPOINT;
    const apiKey = process.env.AZURE_FACE_KEY || process.env.VITE_AZURE_FACE_KEY;

    if (!endpoint || !apiKey) {
        return res.status(500).json({ 
            error: 'Credenciales de Azure Face no configuradas en el archivo .env del backend.' 
        });
    }

    try {
        // Convertir la imagen en Base64 a un Buffer de bytes
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Construir la URL completa para Azure Face API v1.0
        const cleanEndpoint = endpoint.replace(/\/$/, '');
        const azureUrl = `${cleanEndpoint}/face/v1.0/detect?returnFaceAttributes=headPose,glasses,occlusion,blur,exposure,noise`;

        // Petición HTTP directa a Microsoft Azure
        const azureResponse = await fetch(azureUrl, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey,
                'Content-Type': 'application/octet-stream',
            },
            body: imageBuffer,
        });

        const data = await azureResponse.json();

        if (!azureResponse.ok) {
            console.error('Error desde Azure Face:', data);
            return res.status(azureResponse.status).json({ error: 'Error en la respuesta de Azure Face API', details: data });
        }

        return res.json({ success: true, faces: data });

    } catch (error) {
        console.error('Error en el servicio Face:', error);
        return res.status(500).json({ error: 'Error interno en el servidor al procesar el reconocimiento facial.' });
    }
});

module.exports = router;