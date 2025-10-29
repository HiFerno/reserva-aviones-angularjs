// AQUI REGISTRO EL CONTROLADOR PRINCIPAL EN EL MODULO DE LA APP
angular.module('appVuelos')
// DEFINO EL CONTROLADOR 'PRINCIPALCONTROLLER' E INYECTO EL SERVICIO API
    .controller('PrincipalController', function(ApiServicio) {
        
        // GUARDO LA REFERENCIA AL CONTROLADOR EN VM PARA USAR EN LA VISTA
        const vm = this;

        // --- MODELOS DE DATOS ---
        // MAPA PARA TENER LOS ASIENTOS INDEXADOS POR NUMERO (ASI LOS BUSCO RAPIDO)
        vm.mapaAsientos = {}; // UN OBJETO/MAPA PARA ACCESO RAPIDO
        // ASIENTO SELECCIONADO ACTUAL, NULL SI NO HAY
        vm.asientoSeleccionado = null;
        // OBJETO QUE REPRESENTA AL PASAJERO QUE ESTAMOS RESERVANDO
        vm.pasajero = {
            nombre_pasajero: '',
            cui: '',
            con_equipaje: false
        };

        // --- ESTADOS DE LA UI ---
        // FLAG PARA MOSTRAR QUE ESTAMOS CONFIRMANDO UNA RESERVA
        vm.cargandoReserva = false;
        // TEXTO PARA MOSTRAR ERRORES EN LA PANTALLA DE RESERVAS
        vm.errorReserva = '';
        // TEXTO PARA MOSTRAR MENSAJE DE EXITO EN LA PANTALLA DE RESERVAS
        vm.exitoReserva = '';

        // --- FUNCION DE INICIALIZACION ---
        // ESTA FUNCION CARGA LOS ASIENTOS DESDE LA API Y LOS PONE EN UN MAPA
        function activar() {
            console.log('Cargando asientos...');
            // LLAMO AL SERVICIO PARA OBTENER EL ARRAY DE ASIENTOS
            ApiServicio.obtenerAsientos()
                .then(function(respuesta) {
                    // SI LLEGA LA RESPUESTA, CONVIERTO EL ARRAY A UN MAPA (NUMERO -> ASIENTO)
                    vm.mapaAsientos = respuesta.data.reduce((map, asiento) => {
                        map[asiento.numero_asiento] = asiento;
                        return map;
                    }, {});
                })
                .catch(function(err) {
                    // SI HAY ERROR, LO GUARDO EN errorReserva PARA MOSTRARLO
                    vm.errorReserva = 'Error al cargar el mapa de asientos. ' + (err.data.error || '');
                });
        }
        
        // --- FUNCIONES QUE USA LA VISTA ---

        // OBTIENE LAS CLASES CSS PARA UN ASIENTO SEGUN SU ESTADO (USADO POR ng-class)
        vm.obtenerClaseAsiento = function(numeroAsiento) {
            const asiento = vm.mapaAsientos[numeroAsiento];
            // SI AUN NO CARGO LOS ASIENTOS, DEVUELVO CADENA VACIA
            if (!asiento) return ''; // AUN NO HA CARGADO

            // DEVUELVO UN OBJETO CON LAS CLASES APLICABLES SEGUN EL ESTADO
            return {
                'disponible': asiento.estado === 'disponible',
                'ocupado': asiento.estado === 'ocupado',
                'seleccionado': vm.asientoSeleccionado && vm.asientoSeleccionado.numero_asiento === numeroAsiento
            };
        };

        // MANEJA CLICK EN UN ASIENTO (SELECCIONAR / DESELECCIONAR)
        vm.seleccionarAsiento = function(numeroAsiento) {
            // LIMPIO MENSAJES ANTES DE NADA
            vm.errorReserva = '';
            vm.exitoReserva = '';
            const asiento = vm.mapaAsientos[numeroAsiento];

            // SI EL ASIENTO ESTA OCUPADO, NO DEJO SELECCIONAR Y AVISO
            if (asiento.estado === 'ocupado') {
                vm.errorReserva = 'Este asiento ya está ocupado.';
                vm.asientoSeleccionado = null;
                return;
            }

            // SI SE CLICKEA EL MISMO ASIENTO QUE YA ESTA SELECCIONADO, LO DESELECCIONO
            if (vm.asientoSeleccionado && vm.asientoSeleccionado.numero_asiento === numeroAsiento) {
                vm.asientoSeleccionado = null;
            } else {
                // SINO, LO SELECCIONO Y RESETEO EL FORMULARIO DE PASAJERO
                vm.asientoSeleccionado = asiento;
                vm.pasajero = { nombre_pasajero: '', cui: '', con_equipaje: false };
            }
        };

        // CONFIRMA LA RESERVA (LLAMA A LA API)
        vm.confirmarReserva = function() {
            // SI NO HAY ASIENTO SELECCIONADO, YA FRENAMOS
            if (!vm.asientoSeleccionado) {
                vm.errorReserva = 'No hay ningún asiento seleccionado.';
                return;
            }

            // PONGO LOS FLAGS DE CARGA Y LIMPIO MENSAJES
            vm.cargandoReserva = true;
            vm.errorReserva = '';
            vm.exitoReserva = '';

            // ARMAMOS LOS DATOS QUE LA API NECESITA PARA CREAR LA RESERVA
            const datosReserva = {
                asiento_id: vm.asientoSeleccionado.asiento_id,
                nombre_pasajero: vm.pasajero.nombre_pasajero,
                cui: vm.pasajero.cui,
                con_equipaje: vm.pasajero.con_equipaje || false
            };

            // LLAMO AL SERVICIO PARA CREAR LA RESERVA
            ApiServicio.crearReserva(datosReserva)
                .then(function(respuesta) {
                    // SI TODO SALE BIEN, ACTUALIZO LOS ESTADOS Y MUESTRO MENSAJE
                    vm.cargandoReserva = false;
                    vm.exitoReserva = respuesta.data.mensaje + ` (Asiento: ${respuesta.data.asiento})`;
                    
                    // LIMPIO LA SELECCION Y EL FORM
                    vm.asientoSeleccionado = null;
                    vm.pasajero = {};

                    // VUELVO A CARGAR EL MAPA DE ASIENTOS PARA REFLEJAR EL CAMBIO
                    activar(); 
                })
                .catch(function(err) {
                    // SI HAY ERROR, LO MUESTRO Y QUITO EL LOADING
                    vm.cargandoReserva = false;
                    vm.errorReserva = 'Error al confirmar: ' + (err.data.error || 'Error desconocido.');
                });
        };


        // --- EJECUTO LA INICIALIZACION ---
        activar();
    });