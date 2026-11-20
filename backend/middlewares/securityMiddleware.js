// Middleware làm sạch dữ liệu đầu vào (chống XSS & kiểm tra tham số số nguyên chống SQL Injection)
const sanitizeString = (value) => {
    if (typeof value !== 'string') return value;
    return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .trim();
};

const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    const cleaned = {};
    for (const [key, val] of Object.entries(obj)) {
        if (typeof val === 'string') {
            cleaned[key] = sanitizeString(val);
        } else if (typeof val === 'object' && val !== null) {
            cleaned[key] = sanitizeObject(val);
        } else {
            cleaned[key] = val;
        }
    }
    return cleaned;
};

const inputSanitizer = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
    }
    next();
};

// Kiểm tra tham số :id trên URL phải là số nguyên dương hợp lệ
const validateNumericIdParam = (req, res, next) => {
    if (req.params && req.params.id !== undefined) {
        const idNum = Number(req.params.id);
        if (!Number.isInteger(idNum) || idNum <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Tham số ID trên đường dẫn không hợp lệ (Phải là số nguyên dương)'
            });
        }
        req.params.id = idNum;
    }
    next();
};

// Thiết lập các HTTP Security Headers cơ bản
const securityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.removeHeader('X-Powered-By');
    next();
};

module.exports = {
    inputSanitizer,
    validateNumericIdParam,
    securityHeaders
};