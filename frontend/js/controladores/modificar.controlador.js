angular.module('appVuelos')
    .controller('ModificarController', function(ApiServicio) {
        
        const vm = this;

        // --- Modelos ---
        vm.modificacion = {
            cui: '',
            numero_asiento_actual: '',
            numero_asiento_nuevo: ''
        };

        // --- Estados UI ---
        vm.cargando = false;
        vm.error = '';
        vm.exito = '';

        // --- Función de Envío ---
        vm.confirmarModificacion = function() {
            vm.cargando = true;
            vm.error = '';
            vm.exito = '';

            ApiServicio.modificarReserva(vm.modificacion)
                .then(function(respuesta) {
                    vm.cargando = false;
                    vm.exito = respuesta.data.mensaje + 
                        ` Nuevo precio: Q${respuesta.data.nuevo_precio.toFixed(2)}`;
                    // Limpiamos el formulario
                    vm.modificacion = {};
                })
                .catch(function(err) {
                    vm.cargando = false;
                    vm.error = err.data.error || 'No se pudo modificar la reserva.';
                });
        };
    });