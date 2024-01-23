'use strict';

/**
 * type service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::type.type', ({ strapi }) => ({
  async find(ctx) {
    const params = this.getFetchParams(ctx);

    //jeżeli jest q to szukaj po q
    const { q } = params;
    if (q) {
      params.filters = {
        $or: [
          { title: { $containsi: q } },
          { series: { $containsi: q } },
          { commemorated_topic: { $containsi: q } },
        ],
      };
      delete params.q;
    }

    const types = await strapi.entityService.findMany('api::type.type', params);

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
