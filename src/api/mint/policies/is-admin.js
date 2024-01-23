// eslint-disable-next-line no-unused-vars
module.exports = (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;
  console.log('user', user);
  //return error if user is not authenticated by jwt
  if (!user) return false;

  if (user.role.name === 'Admin') return true;

  return false;
};
