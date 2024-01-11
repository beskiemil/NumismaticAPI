'use strict';

const { errors } = require('@strapi/utils');
const { ApplicationError, BadRequestError, UnauthorizedError, TooManyR } =
  errors;
/**
 * type service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::type.type', ({ strapi }) => ({
  async findOne(id, params) {
    console.log('params', params);
    console.log('id', id);
    const { isNumistaResult } = params;

    if (!isNumistaResult) {
      delete params.isNumistaResult;
      return await strapi.entityService.findOne('api::type.type', params);
    }

    const response = await fetch(`${process.env.NUMISTA_API_URL}/types/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Numista-Api-Key': process.env.NUMISTA_API_KEY,
      },
    });
    if (!response.ok)
      switch (response.status) {
        case 400:
          throw new BadRequestError('Bad request');
        case 401:
          throw new UnauthorizedError('Unauthorized');
        case 404:
          throw new ApplicationError('Type not found', { id });
        case 429:
          throw new ApplicationError('Too many requests');
        default:
          throw new ApplicationError('Connection error', { numista_id });
      }
    return await response.json();
  },
  async find(ctx) {
    const params = this.getFetchParams(ctx);

    //jeżeli jest q to szukaj po q
    const { query, showNumistaResults } = params;
    if (query) {
      params.filters = {
        $or: [
          { title: { $containsi: query } },
          { series: { $containsi: query } },
          { commemorated_topic: { $containsi: query } },
        ],
      };
      delete params.query;
    }

    const types = await strapi.entityService.findMany('api::type.type', params);

    if (showNumistaResults) {
      try {
        const response = await fetch(
          `${process.env.NUMISTA_API_URL}/types?q=${query}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Numista-Api-Key': process.env.NUMISTA_API_KEY,
            },
          },
        );
        if (!response.ok)
          throw new ApplicationError('Connection error', { query });
        const data = await response.json();

        if (data.count > 0) {
          const { types: numistaTypes } = data;

          //transform numista response to match strapi response
          const transformedNumistaTypes = numistaTypes.map((type) => {
            return {
              ...type,
              id: type.id,
              numista_id: type.id,
              isNumistaType: true,
            };
          });
          types.push(...transformedNumistaTypes);

          types.sort((a, b) => {
            if (a.title < b.title) return -1;
            else if (a.title > b.title) return 1;
            else return 0;
          });
        }
      } catch (err) {
        console.log(err.details);
      }
    }
    //console.log(types);

    //handle pagination
    const page = parseInt(params?.pagination?.page) || 1;
    const pageSize = parseInt(params?.pagination?.pageSize) || 25;
    const { results, pagination } = handlePagination(types, page, pageSize);

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
