const checkAuthorization = request => {
    const headers = request.headers;

    if (headers["x-api-key"] === "secretkey") {
        return true;
    } else {
        return true;
    }
};

module.exports = {
    checkAuthorization
};
