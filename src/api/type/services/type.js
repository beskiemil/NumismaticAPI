'use strict';

/**
 * type service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::type.type', ({ strapi }) => ({
  async find(ctx) {
    const params = this.getFetchParams(ctx);
    console.log('params: ', params);

    //jeżeli jest q to szukaj po q
    const { q, ...restParams } = params;
    console.log('q: ', q);
    console.log('restParams: ', restParams);
    if (q) {
      const { results, pagination } = await strapi
        .service('api::type.type')
        .findByQ(ctx);
      return { results, pagination };
    }

    // jeżeli nie ma q to zwróć wszystkie
    const types = await strapi.entityService.findMany('api::type.type', {
      ...restParams,
    });

    //handle pagination
    const page = parseInt(params?.pagination.page) || 1;
    const pageSize = parseInt(params?.pagination.pageSize) || 25;
    const { results, pagination } = handlePagination(types, page, pageSize);

    console.log('results: ', results);
    console.log('pagination: ', pagination);
    return { results, pagination };
  },

  async findByQ(ctx) {
    const params = this.getFetchParams(ctx);
    console.log('params: ', params);

    //jeżeli jest q to szukaj po q
    const { q, ...restParams } = params;
    console.log('q: ', q);
    console.log('restParams: ', restParams);

    const types = await strapi.entityService.findMany('api::type.type', {
      restParams,
      filters: {
        $or: [
          { title: { $contains: q } },
          { series: { $contains: q } },
          { commemorated_topic: { $contains: q } },
        ],
      },
    });

    const page = parseInt(params?.pagination.page) || 1;
    const pageSize = parseInt(params?.pagination.pageSize) || 25;
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
