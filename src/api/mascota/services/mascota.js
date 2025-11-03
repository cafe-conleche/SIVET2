'use strict';

/**
 * mascota service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::mascota.mascota');
