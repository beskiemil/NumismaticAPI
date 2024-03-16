'use strict';
const { errors } = require('@strapi/utils');
const { ApplicationError, BadRequestError, UnauthorizedError } = errors;

/**
 * item service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::item.item', ({ strapi }) => ({
  async find(ctx) {
    const params = this.getFetchParams(ctx);

    //find all items
    const entities = await strapi.entityService.findMany(
      'api::item.item',
      params,
    );

    //if there is numista_id in item, fetch type details from numista api
    const items = await Promise.all(
      entities?.map(async (item) => {
        if (item?.numista_id) {
          const response = await fetch(
            `${process.env.NUMISTA_API_URL}/types/${item.numista_id}`,
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
                  id: item.numista_id,
                });
              case 429:
                throw new ApplicationError('Too many requests');
              default:
                throw new ApplicationError('Connection error', {
                  id: item.numista_id,
                });
            }
          }
          item.type = await response.json();
          item.type.isNumistaType = true;
          return item;
        }
        return item;
      }),
    );

    const page = parseInt(params?.pagination?.page) || 1;
    const pageSize = parseInt(params?.pagination?.pageSize) || 25;
    const { results, pagination } = handlePagination(items, page, pageSize);
    return { results, pagination };
  },
  async findOne(id, params) {
    console.log(id, params);
    const item = await strapi.entityService.findOne(
      'api::item.item',
      id,
      params,
    );
    if (item?.numista_id) {
      const response = await fetch(
        `${process.env.NUMISTA_API_URL}/types/${item.numista_id}`,
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
              id: item.numista_id,
            });
          case 429:
            throw new ApplicationError('Too many requests');
          default:
            throw new ApplicationError('Connection error', {
              id: item.numista_id,
            });
        }
      }
      item.type = await response.json();
      item.type.isNumistaType = true;
    }
    return item;
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
