const { createCoreController } = require('@strapi/strapi').factories;
const { errors } = require('@strapi/utils');
const { ApplicationError, NotFoundError } = errors;

module.exports = createCoreController('api::issuer.issuer', ({ strapi }) => ({
  // eslint-disable-next-line no-unused-vars
  async find(ctx) {
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
      const { issuers: numistaIssuers } = data;

      if (data.count > 0) {
        const { issuers: numistaIssuers } = data;

        const transformedIssuers = numistaIssuers
          .map((issuer) => {
            return {
              code: issuer.code,
              name: issuer.name,
              parent: issuer.parent
                ? {
                    code: issuer.parent.code,
                    name: issuer.parent.name,
                  }
                : null,
            };
          })
          .filter(
            (issuer) => issuer.code !== 'tokens' && issuer.code !== 'exonumia',
          );

        const withChildren = transformedIssuers
          .filter((parent) => parent.parent === null)
          .map((parent) => {
            return {
              ...parent,
              children: findChildren(transformedIssuers, parent),
            };
          });

        const sanitizedIssuers = await this.sanitizeOutput(withChildren, ctx);
        ctx.body = {
          data: sanitizedIssuers,
          meta: { count: sanitizedIssuers.length },
        };
      } else ctx.body = [];
    } catch (e) {
      if (e instanceof ApplicationError)
        return ctx.internalServerError(e.message);
      if (e instanceof NotFoundError) return ctx.notFound(e.message);
    }
  },
}));

function findChildren(issuers, parent) {
  const children = issuers.filter(
    (issuer) => issuer?.parent?.code === parent.code,
  );
  if (children.length > 0) {
    const sortedChildren = children.sort((a, b) => {
      if (a.name < b.name) return -1;
      else if (a.name > b.name) return 1;
      else return 0;
    });
    return sortedChildren.map((child) => {
      return {
        ...child,
        children: findChildren(issuers, child),
      };
    });
  } else return [];
}
