'use strict';

/**
 * mint controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::mint.mint', ({ strapi }) => ({
  async create(ctx) {
    const newMint = await strapi.service('api::mint.mint').create(ctx);
    const sanitizedMint = await this.sanitizeOutput(newMint, ctx);

    ctx.body = sanitizedMint;
  },
}));
