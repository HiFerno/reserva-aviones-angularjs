// ACA REGISTRO EL CONTROLADOR 'MODIFICARCONTROLLER' EN EL MODULO APPVUELOS
angular.module('appVuelos')
    // AQUI DEFINO EL CONTROLADOR Y LE INYECTO EL SERVICIO QUE HABLA CON LA API
    .controller('ModificarController', function(ApiServicio) {
        
        // GUARDO LA REFERENCIA AL CONTROLADOR EN VM PARA USARLA EN LA VISTA
        const vm = this;

        // --- MODELOS ---
        // AQUI DEFINO EL OBJETO QUE VOY A ENVIAR PARA MODIFICAR LA RESERVA
        vm.modificacion = {
            // CUI DEL PASAJERO, INICIALMENTE VACIO
            cui: '',
            // NUMERO DE ASIENTO ACTUAL QUE SE QUIERE CAMBIAR
            numero_asiento_actual: '',
            // NUMERO DE ASIENTO NUEVO AL QUE SE QUIERE CAMBIAR
            numero_asiento_nuevo: ''
        };

        // --- ESTADOS UI ---
        // FLAG PARA SABER SI ESTAMOS EN UNA PETICION (MUESTRA LOADING)
        vm.cargando = false;
        // TEXTO PARA MOSTRAR ERRORES DEVUELTOS POR EL SERVIDOR
        vm.error = '';
        // TEXTO PARA MOSTRAR MENSAJE DE EXITO CUANDO SALIO OK
        vm.exito = '';

        // --- FUNCION QUE MANDA LA MODIFICACION AL SERVIDOR ---
        vm.confirmarModificacion = function() {
            // PONGO EL LOADING EN TRUE PARA INDICAR QUE EMPEZO LA PETICION
            vm.cargando = true;
            // LIMPIO CUALQUIER ERROR ANTERIOR
            vm.error = '';
            // LIMPIO MENSAJE DE EXITO ANTERIOR
            vm.exito = '';

            // LLAMO AL SERVICIO API PARA MODIFICAR LA RESERVA PASANDO EL OBJETO VM.MODIFICACION
            ApiServicio.modificarReserva(vm.modificacion)
                .then(function(respuesta) {
                    // SI SALE BIEN, QUITO EL LOADING
                    vm.cargando = false;
                    // ARMOS EL MENSAJE DE EXITO CON LO QUE NOS DEVOLVIO EL BACKEND
                    vm.exito = respuesta.data.mensaje + 
                        ` Nuevo precio: Q${respuesta.data.nuevo_precio.toFixed(2)}`;
                    // LIMPIO EL FORMULARIO PARA QUE NO QUEDE NADA
                    vm.modificacion = {};
                })
                .catch(function(err) {
                    // SI HAY ERROR, TAMBIEN QUITO EL LOADING
                    vm.cargando = false;
                    // MUESTRO EL ERROR QUE VIENE DEL SERVIDOR O UN MENSAJE POR DEFECTO
                    vm.error = err.data.error || 'No se pudo modificar la reserva.';
                });
        };
    });