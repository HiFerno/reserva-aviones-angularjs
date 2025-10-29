angular.module('appVuelos')
    .controller('CancelarController', function(ApiServicio) {
        
        const vm = this;

        // --- Modelos ---
        vm.cancelacion = {
            cui: '',
            numero_asiento: ''
        };

        // --- Estados UI ---
        vm.cargando = false;
        vm.error = '';
        vm.exito = '';

        // --- Función de Envío ---
        vm.confirmarCancelacion = function() {
            vm.cargando = true;
            vm.error = '';
            vm.exito = '';

            ApiServicio.cancelarReserva(vm.cancelacion)
                .then(function(respuesta) {
                    vm.cargando = false;
                    vm.exito = respuesta.data.mensaje;
                    // Limpiamos el formulario
                    vm.cancelacion = {};
                })
                .catch(function(err) {
                    vm.cargando = false;
                    vm.error = err.data.error || 'No se pudo cancelar la reserva.';
                });
        };
    });