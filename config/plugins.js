module.exports = ({ env }) => ({
  // Configuración del plugin de autenticación
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET', 'default-jwt-secret-key'),
    },
  },
});
