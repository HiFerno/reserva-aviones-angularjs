/**
 * Genera el HTML completo para un correo, usando la plantilla de JetRoute.
 * @param {string} titulo - El título que va en el cabezal de la tarjeta
 * @param {string} cuerpoHtml - El contenido principal del correo (ej. <p>Detalles...</p>).
 * @returns {string} - El string HTML completo listo para enviar.
 */
const generarHtmlEmail = (titulo, cuerpoHtml) => {


    const LOGO_URL = 'https://i.imgur.com/y6PRqVG.png'; 

    // Colores 
    const colores = {
        negro: '#000000',
        naranja: '#F26838',
        crema: '#E8D8C9',
    };

    // Fuentes de respaldo (VT323 no funcionará en emails)
    const fuente = "font-family: 'Courier New', Courier, monospace;";

    return `
        <body style="margin: 0; padding: 0; background-color: ${colores.negro}; ${fuente}">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td style="padding: 20px 0 30px 0;">
                
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; border: 1px solid ${colores.naranja}; box-shadow: 0 0 10px ${colores.naranja};">
                            <tr>
                                <td align="center" style="padding: 20px 0 20px 0; border-bottom: 1px solid ${colores.naranja};">
                                    <img src="${LOGO_URL}" alt="JetRoute Logo" width="40" height="40" style="display: block; margin-bottom: 10px;">
                                    <span style="color: ${colores.naranja}; font-size: 28px; text-transform: uppercase;">JETROUTE</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 30px 40px 30px; color: ${colores.crema}; font-size: 16px; line-height: 1.6;">
                                    <h1 style="color: ${colores.naranja}; font-size: 24px; margin: 0 0 20px 0; text-transform: uppercase;">${titulo}</h1>
                                    ${cuerpoHtml}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px 30px 20px 30px; border-top: 1px solid ${colores.naranja};">
                                    <p style="margin: 0; color: ${colores.crema}; font-size: 14px; text-align: center; opacity: 0.7;">
                                        © 2025 JetRoute. Proyecto de Programación Web.
                                    </p>
                                </td>
                            </tr> 
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    `;
};

module.exports = {
    generarHtmlEmail
};