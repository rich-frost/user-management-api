const checkAuthorization = (request) => {
    const { headers } = request;

    if (headers['x-api-key'] === 'secretkey') {
        return true;
    }
    return false;
};

const checkSUAuthorization = (request) => {
    const { headers } = request;

    if (headers['x-api-key'] === 'supersecretkey') {
        return true;
    }
    return false;
};

module.exports = {
    checkAuthorization,
    checkSUAuthorization,
};
