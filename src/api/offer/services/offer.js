'use strict';
const { errors } = require('@strapi/utils');
const { ApplicationError, BadRequestError, UnauthorizedError } = errors;
const qs = require('qs');
/**
 * offer service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::offer.offer', ({ strapi }) => ({
  async find(ctx) {
    const params = this.getFetchParams(ctx);

    const entities = await strapi.entityService.findMany(
      'api::offer.offer',
      params,
    );

    const offers = await Promise.all(
      entities?.map(async (offer) => {
        if (offer?.item?.numista_id) {
          const response = await fetch(
            `${process.env.NUMISTA_API_URL}/types/${offer.item.numista_id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Numista-Api-Key': process.env.NUMISTA_API_KEY,
              },
            },
          );
          if (!response.ok) {
            switch (response.status) {
              case 400:
                throw new BadRequestError('Bad request');
              case 401:
                throw new UnauthorizedError('Unauthorized');
              case 404:
                throw new ApplicationError('Type not found', {
                  id: offer.item.numista_id,
                });
              case 429:
                throw new ApplicationError('Too many requests');
              default:
                throw new ApplicationError('Connection error', {
                  id: offer.item.numista_id,
                });
            }
          }
          offer.item.type = await response.json();
          offer.item.type.isNumistaType = true;
          return offer;
        }
        return offer;
      }),
    );

    const page = parseInt(params?.pagination?.page) || 1;
    const pageSize = parseInt(params?.pagination?.pageSize) || 25;
    const { results, pagination } = handlePagination(offers, page, pageSize);
    return { results, pagination };
  },
}));

function handlePagination(data, page, pageSize) {
  const total = data?.length;
  const pageCount = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const results = data.slice(start, end);
  return {
    results,
    pagination: {
      page,
      pageSize,
      pageCount,
      total,
    },
  };
}
