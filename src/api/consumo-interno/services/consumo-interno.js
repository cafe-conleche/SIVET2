'use strict';

/**
 * consumo-interno service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::consumo-interno.consumo-interno');
