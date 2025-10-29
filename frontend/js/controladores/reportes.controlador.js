angular.module('appVuelos')
    .controller('ReportesController', function(ApiServicio) {
        
        const vm = this;
        vm.stats = {};
        vm.cargando = true;
        vm.error = '';

        function activar() {
            ApiServicio.obtenerReportes()
                .then(function(respuesta) {
                    vm.cargando = false;
                    vm.stats = respuesta.data;
                })
                .catch(function(err) {
                    vm.cargando = false;
                    vm.error = 'Error al cargar los reportes: ' + (err.data.error || 'Error desconocido.');
                });
        }

        activar();
    });