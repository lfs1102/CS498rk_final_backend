module.exports = function (router, passport) {
    require('./user')(router, passport)
    require('./post')(router);
    return router;
};