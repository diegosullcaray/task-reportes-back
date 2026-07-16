const { Router } = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = require('./swagger.definition');

/**
 * Documentación interactiva Swagger, montada en /api-docs por infrastructure/server/routes.js.
 */
const router = Router();

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDefinition, {
  customSiteTitle: 'Backend de Reportes - API Docs'
}));

module.exports = router;
