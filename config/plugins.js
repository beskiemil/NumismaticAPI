module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: 'numismatic@beskiemil.tech',
        defaultReplyTo: 'numismatic@beskiemil.tech',
      },
    },
  },
});
