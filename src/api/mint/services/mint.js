'use strict';

/**
 * mint service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::mint.mint', ({ strapi }) => ({
  async create(ctx) {
    const { data: mint } = ctx.request.body;
    console.log('body: ', ctx.request.body);
    console.log('mint: ', mint);

    //find issuer with specific numista_code
    if (mint?.issuer?.code) {
      const issuers = await strapi.entityService.findMany(
        'api::issuer.issuer',
        {
          filters: {
            numista_code: mint.issuer.code,
          },
        },
      );
      const { id: issuer_id } = issuers[0];

      const newMint = {
        ...mint,
        issuer: issuer_id,
      };

      return await strapi.entityService.create('api::mint.mint', {
        data: newMint,
      });
    }

    return await strapi.entityService.create('api::mint.mint', {
      data: mint,
    });
  },
}));
