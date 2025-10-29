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

        // --- AÑADIR: REPORTES ---
        apiFactory.obtenerReportes = function() {
            return $http.get(API_URL + '/reportes');
        };

        // --- AÑADIR: DESCARGAR XML ---
        apiFactory.descargarXML = function() {
            // Le pedimos a Angular que espere una respuesta tipo 'blob' (un archivo)
            // en lugar de JSON.
            return $http.get(API_URL + '/archivos/descargar-xml', {
                responseType: 'blob' 
            });
        };

        // --- AÑADIR: CARGAR XML ---
        apiFactory.cargarXML = function(archivo) {
            // FormData es la forma estándar de enviar archivos en HTTP
            const fd = new FormData();
            fd.append('archivo', archivo); // 'archivo' debe coincidir con el backend

            return $http.post(API_URL + '/archivos/cargar-xml', fd, {
                // Trucos para que Angular maneje FormData correctamente:
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            });
        };

        return apiFactory;
    });