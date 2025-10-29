angular.module('appVuelos')
    .factory('ApiServicio', function($http, API_URL) {
        
        const apiFactory = {};

        // --- Asientos ---
        apiFactory.obtenerAsientos = function() {
            // (Gracias al interceptor, esto ya lleva el token)
            return $http.get(API_URL + '/asientos');
        };

        // --- Reservas ---
        apiFactory.crearReserva = function(datosReserva) {
            return $http.post(API_URL + '/reservas', datosReserva);
        };

        apiFactory.modificarReserva = function(datosModificacion) {
            // (PATCH /api/reservas)
            return $http.patch(API_URL + '/reservas', datosModificacion);
        };

        // --- AÑADIR ESTA FUNCIÓN ---
        apiFactory.cancelarReserva = function(datosCancelacion) {
            // (DELETE /api/reservas)
            // $http.delete es especial, los datos van en un objeto 'config'
            return $http.delete(API_URL + '/reservas', { params: datosCancelacion });
        };

        // (Añadiremos reportes y archivos aquí después)

        return apiFactory;
    });