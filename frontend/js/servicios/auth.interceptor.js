angular.module('appVuelos')
    .factory('AuthInterceptor', function($window) {
        
        const interceptorFactory = {};

        // Esta función se ejecuta en cada PETICIÓN saliente
        interceptorFactory.request = function(config) {
            
            // 1. Obtenemos el token del localStorage
            const token = $window.localStorage.getItem('token-vuelos');

            // 2. Si el token existe, lo adjuntamos al header
            if (token) {
                // Añade el header 'Authorization: Bearer <token>'
                config.headers.Authorization = 'Bearer ' + token;
            }

            return config;
        };
        
        // (Aquí también se podría manejar el 'responseError', por ejemplo,
        // si la API devuelve 401, podríamos forzar un logout)

        return interceptorFactory;
    });