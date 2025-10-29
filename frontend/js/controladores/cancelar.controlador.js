// ACA AGREGO EL CONTROLADOR DE CANCELACION AL MODULO DE LA APP
angular.module('appVuelos')
    // REGISTRO EL CONTROLADOR Y LE INYECTO EL SERVICIO QUE HABLA CON LA API
    .controller('CancelarController', function(ApiServicio) {
        
        // GUARDO LA REFERENCIA AL CONTROLADOR EN VM PARA USARLA EN LA VISTA SIN EMBROLLARME
        const vm = this;

        // --- MODELOS ---
        // OBJETO QUE CONTIENE LOS DATOS QUE VOY A ENVIAR PARA CANCELAR
        vm.cancelacion = {
            // CUI DEL PASAJERO, VACIO AL PRINCIPIO
            cui: '',
            // NUMERO DE ASIENTO A CANCELAR, VACIO AL PRINCIPIO
            numero_asiento: ''
        };

        // --- ESTADOS UI ---
        // FLAG PARA MOSTRAR QUE ESTAMOS HACIENDO UNA PETICION
        vm.cargando = false;
        // TEXTO PARA MOSTRAR ERRORES
        vm.error = '';
        // TEXTO PARA MOSTRAR MENSAJE DE EXITO
        vm.exito = '';

        // --- FUNCION QUE CONFIRMA LA CANCELACION Y LA MANDA AL SERVIDOR ---
        vm.confirmarCancelacion = function() {
            // PONGO EL LOADING EN TRUE
            vm.cargando = true;
            // LIMPIO MENSAJES ANTERIORES
            vm.error = '';
            vm.exito = '';

            // LLAMO AL SERVICIO PARA CANCELAR LA RESERVA PASANDO EL OBJETO VM.CANCELACION
            ApiServicio.cancelarReserva(vm.cancelacion)
                .then(function(respuesta) {
                    // SI LA PETICION FUE OK, QUITO EL LOADING
                    vm.cargando = false;
                    // GUARDO EL MENSAJE DE EXITO QUE VINO DEL BACKEND
                    vm.exito = respuesta.data.mensaje;
                    // LIMPIO EL FORMULARIO PARA QUE NO QUEDEN DATOS
                    vm.cancelacion = {};
                })
                .catch(function(err) {
                    // SI HUBO ERROR, QUITO EL LOADING
                    vm.cargando = false;
                    // MUESTRO EL ERROR QUE VIENE DEL SERVIDOR O UNO POR DEFECTO
                    vm.error = err.data.error || 'No se pudo cancelar la reserva.';
                });
        };
    });