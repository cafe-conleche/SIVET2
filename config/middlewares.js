/** ESTO ESTABA ANTES */
/**   
module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
*/

/** NUEVA MODIFICACION PARA QUE EL NAVEGADOR NO BLOQUEE LAS PETICIONES DEL LOGIN */

module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      //enabled: true,
      headers: '*',
      origin: [
        'http://localhost:3000',     // Frontend con Live Server
        'http://127.0.0.1:3000',     // Alternativa
        'http://localhost:5500',     // Otro puerto común
        'http://127.0.0.1:5500',     // Alternativa
        'http://localhost:8080'      // Otro puerto posible
      ]
    }
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];