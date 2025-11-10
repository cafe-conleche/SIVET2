'use strict';

/**
 * movimiento-stock service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::movimiento-stock.movimiento-stock');
