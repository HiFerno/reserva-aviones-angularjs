// ACA REGISTRO EL CONTROLADOR DE REPORTES EN EL MODULO DE LA APP
angular.module('appVuelos')
// AQUI DEFINO EL CONTROLADOR 'REPORTESCONTROLLER' Y LE INYECTO EL SERVICIO API
    .controller('ReportesController', function(ApiServicio) {
        
        // GUARDO EN VM LA REFERENCIA AL CONTROLADOR PARA USAR EN LA VISTA
        const vm = this;
        // INICIALIZO EL OBJETO DONDE VOY A GUARDAR LAS ESTADISTICAS QUE VENGAN
        vm.stats = {};
        // FLAG PARA INDICAR QUE ESTOY CARGANDO LOS REPORTES, ARRANCA EN TRUE
        vm.cargando = true;
        // CADENA PARA GUARDAR MENSAJES DE ERROR, ARRANCA VACIA
        vm.error = '';

        // FUNCION QUE VA A PEDIR LOS REPORTES AL SERVIDOR
        function activar() {
            // LLAMO AL SERVICIO QUE HACE LA PETICION A LA API
            ApiServicio.obtenerReportes()
                // SI LA PETICION SALE BIEN, ENTRO ACÁ
                .then(function(respuesta) {
                    // QUITO EL INDICADOR DE CARGA
                    vm.cargando = false;
                    // GUARDO LOS DATOS QUE ME DEVOLVIO LA API EN vm.stats
                    vm.stats = respuesta.data;
                })
                // SI HAY UN ERROR EN LA PETICION, ENTRO ACÁ
                .catch(function(err) {
                    // TAMBIEN QUITO EL INDICADOR DE CARGA SI HUBO ERROR
                    vm.cargando = false;
                    // ARMAMOS UN MENSAJE DE ERROR USANDO LO QUE TRAIGA EL SERVIDOR O UNO POR DEFECTO
                    vm.error = 'Error al cargar los reportes: ' + (err.data.error || 'Error desconocido.');
                });
        }

        // EJECUTO LA FUNCION DE INICIALIZACION PARA QUE CARGUE AL ARRANCAR
        activar();
    });