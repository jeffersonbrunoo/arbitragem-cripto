// backend/src/middlewares/validate.js

export default (schema) => {
    return (req, res, next) => {
      // valida req.body contra o Joi schema, mas não para no primeiro erro
      const { error } = schema.validate(req.body, { abortEarly: false });
  
      if (error) {
        // extrai só as mensagens
        const messages = error.details.map(detail => detail.message);
        return res.status(400).json({ errors: messages });
      }
  
      // tudo ok: segue adiante
      next();
    };
  };
  