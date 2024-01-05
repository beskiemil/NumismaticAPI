'use strict';

/**
 * issuer service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::issuer.issuer');
