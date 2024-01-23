'use strict';

/**
 * type controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::type.type', ({ strapi }) => ({
  async find(ctx) {
    await this.validateQuery(ctx);

    const sanitizedQueryParams = await this.sanitizeQuery(ctx);
    const { results, pagination } = await strapi
      .service('api::type.type')
      .find(sanitizedQueryParams);

    //console.log(sanitizedQueryParams);
    const sanitizedResults = await this.sanitizeOutput(results, ctx);
    return this.transformResponse(sanitizedResults, { pagination });
  },
}));
