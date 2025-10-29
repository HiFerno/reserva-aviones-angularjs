// ACA CREO EL MODULO DE LA APP Y LE METO LA FABRICA DE SERVICIOS API
angular.module('appVuelos')
    .factory('ApiServicio', function($http, API_URL) {
        
        // CREO UN OBJETO VACIO PARA METER TODAS LAS FUNCIONES DE LA API
        const apiFactory = {};

        // ESTA FUNCION ME TRAE TODOS LOS ASIENTOS DISPONIBLES
        // EL INTERCEPTOR YA ME METE EL TOKEN ASI QUE NI ME PREOCUPO
        apiFactory.obtenerAsientos = function() {
            return $http.get(API_URL + '/asientos');
        };

        // ESTA ES PARA CREAR UNA RESERVA NUEVA CON LOS DATOS QUE LE MANDE
        apiFactory.crearReserva = function(datosReserva) {
            return $http.post(API_URL + '/reservas', datosReserva);
        };

        // ACA MODIFICO UNA RESERVA QUE YA EXISTE
        apiFactory.modificarReserva = function(datosModificacion) {
            return $http.patch(API_URL + '/reservas', datosModificacion);
        };

        // ESTA ES PARA CANCELAR UNA RESERVA
        // EL DELETE ES MEDIO RARO PORQUE LOS DATOS VAN EN LOS PARAMS
        apiFactory.cancelarReserva = function(datosCancelacion) {
            return $http.delete(API_URL + '/reservas', { params: datosCancelacion });
        };

        // ESTA ME TRAE TODOS LOS REPORTES QUE HAYA
        apiFactory.obtenerReportes = function() {
            return $http.get(API_URL + '/reportes');
        };

        // ACA BAJO EL XML CON TODAS LAS RESERVAS
        // LE DIGO QUE ME VA A DEVOLVER UN ARCHIVO (BLOB) Y NO JSON
        apiFactory.descargarXML = function() {
            return $http.get(API_URL + '/archivos/descargar-xml', {
                responseType: 'blob' 
            });
        };

        // ESTA ES PARA SUBIR UN ARCHIVO XML
        // USO FORMDATA PORQUE ES LA FORMA CORRECTA DE MANDAR ARCHIVOS
        apiFactory.cargarXML = function(archivo) {
            const fd = new FormData();
            fd.append('archivo', archivo); // EL NOMBRE 'archivo' TIENE QUE SER IGUAL QUE EN EL BACKEND

            // ESTOS SON UNOS TRUQUITOS PARA QUE ANGULAR NO SE VUELVA LOCO CON EL FORMDATA
            return $http.post(API_URL + '/archivos/cargar-xml', fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            });
        };

        // DEVUELVO EL OBJETO CON TODAS LAS FUNCIONES
        return apiFactory;
    });