'use strict';
const { errors } = require('@strapi/utils');
const { ApplicationError } = errors;
/**
 * issuer service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::issuer.issuer', ({ strapi }) => ({
  async find(ctx) {
    const params = this.getFetchParams(ctx);
    const { query, showNumistaResults } = params;

    const issuers = await strapi.entityService.findMany(
      'api::issuer.issuer',
      params,
    );

    if (showNumistaResults === 'true') {
      try {
        const response = await fetch(`${process.env.NUMISTA_API_URL}/issuers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Numista-Api-Key': process.env.NUMISTA_API_KEY,
          },
        });
        if (!response.ok)
          throw new ApplicationError('Connection error', { query });
        const data = await response.json();

        if (data.count > 0) {
          const { issuers: numistaIssuers } = data;

          //transform numista response to match strapi response
          const transformedNumistaIssuers = numistaIssuers.map((issuer) => {
            return {
              code: issuer.code,
              name: issuer.name,
              parent: issuer.parent
                ? {
                    code: issuer.parent.code,
                    name: issuer.parent.name,
                  }
                : null,
              isNumistaResult: true,
            };
          });
          issuers.push(...transformedNumistaIssuers);

          issuers.sort((a, b) => {
            if (a.name < b.name) return -1;
            else if (a.name > b.name) return 1;
            else return 0;
          });
        }
      } catch (err) {
        console.log(err.details);
      }
    }

    if (params?.pagination) {
      const page = parseInt(params?.pagination?.page) || 1;
      const pageSize = parseInt(params?.pagination?.pageSize) || 25;
      const { results, pagination } = handlePagination(issuers, page, pageSize);

      return { results, pagination };
    }

    return {
      results: issuers,
      pagination: {
        page: 1,
        pageSize: issuers?.length,
        total: issuers?.length,
        pageCount: 1,
      },
    };
    //handle pagination
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
