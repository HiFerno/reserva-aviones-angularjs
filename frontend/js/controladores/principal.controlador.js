angular.module('appVuelos')
    .controller('PrincipalController', function(ApiServicio) {
        
        const vm = this;

        // --- Modelos de datos ---
        vm.mapaAsientos = {}; // Un objeto/mapa para acceso rápido
        vm.asientoSeleccionado = null;
        vm.pasajero = {
            nombre_pasajero: '',
            cui: '',
            con_equipaje: false
        };

        // --- Estados de la UI ---
        vm.cargandoReserva = false;
        vm.errorReserva = '';
        vm.exitoReserva = '';

        // --- Función de Inicialización ---
        function activar() {
            console.log('Cargando asientos...');
            ApiServicio.obtenerAsientos()
                .then(function(respuesta) {
                    // Convertimos el array de asientos en un mapa
                    // para búsquedas más rápidas (ej. 'A1' -> {datos...})
                    vm.mapaAsientos = respuesta.data.reduce((map, asiento) => {
                        map[asiento.numero_asiento] = asiento;
                        return map;
                    }, {});
                })
                .catch(function(err) {
                    vm.errorReserva = 'Error al cargar el mapa de asientos. ' + (err.data.error || '');
                });
        }
        
        // --- Funciones de la Vista ---

        // (Llamada por ng-class en el HTML)
        vm.obtenerClaseAsiento = function(numeroAsiento) {
            const asiento = vm.mapaAsientos[numeroAsiento];
            if (!asiento) return ''; // Aún no ha cargado

            return {
                'disponible': asiento.estado === 'disponible',
                'ocupado': asiento.estado === 'ocupado',
                'seleccionado': vm.asientoSeleccionado && vm.asientoSeleccionado.numero_asiento === numeroAsiento
            };
        };

        // (Llamada por ng-click en el HTML)
        vm.seleccionarAsiento = function(numeroAsiento) {
            vm.errorReserva = '';
            vm.exitoReserva = '';
            const asiento = vm.mapaAsientos[numeroAsiento];

            if (asiento.estado === 'ocupado') {
                vm.errorReserva = 'Este asiento ya está ocupado.';
                vm.asientoSeleccionado = null;
                return;
            }

            // Si se selecciona el mismo asiento, se des-selecciona
            if (vm.asientoSeleccionado && vm.asientoSeleccionado.numero_asiento === numeroAsiento) {
                vm.asientoSeleccionado = null;
            } else {
                vm.asientoSeleccionado = asiento;
                // Reseteamos el formulario
                vm.pasajero = { nombre_pasajero: '', cui: '', con_equipaje: false };
            }
        };

        // (Llamada por ng-submit en el HTML)
        vm.confirmarReserva = function() {
            if (!vm.asientoSeleccionado) {
                vm.errorReserva = 'No hay ningún asiento seleccionado.';
                return;
            }

            vm.cargandoReserva = true;
            vm.errorReserva = '';
            vm.exitoReserva = '';

            // Preparamos los datos para la API
            const datosReserva = {
                asiento_id: vm.asientoSeleccionado.asiento_id,
                nombre_pasajero: vm.pasajero.nombre_pasajero,
                cui: vm.pasajero.cui,
                con_equipaje: vm.pasajero.con_equipaje || false
            };

            ApiServicio.crearReserva(datosReserva)
                .then(function(respuesta) {
                    // ÉXITO
                    vm.cargandoReserva = false;
                    vm.exitoReserva = respuesta.data.mensaje + ` (Asiento: ${respuesta.data.asiento})`;
                    
                    // Limpiamos todo
                    vm.asientoSeleccionado = null;
                    vm.pasajero = {};

                    // ¡IMPORTANTE! Volvemos a cargar el mapa de asientos
                    // para que el asiento recién reservado aparezca como 'ocupado'
                    activar(); 
                })
                .catch(function(err) {
                    // ERROR
                    vm.cargandoReserva = false;
                    vm.errorReserva = 'Error al confirmar: ' + (err.data.error || 'Error desconocido.');
                });
        };


        // --- Ejecutar la inicialización ---
        activar();
    });