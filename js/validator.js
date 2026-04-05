const Joi = require('joi');

// Схема для регистрации пользователя (Users)
const userSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('Admin', 'User').default('User')
});

// Функция-прослойка (Middleware) для проверки
const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        // Пункт 4 ТЗ: выдаем понятную ошибку 400
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

module.exports = { validateUser };
