// ACA CREO EL MODULO ANGULAR PARA LA APP DE VUELOS Y LE METO EL CONTROLADOR DE ARCHIVOS
angular.module('appVuelos')
    .controller('ArchivosController', function(ApiServicio, $window) {
        
        // GUARDO LA REFERENCIA DEL CONTROLADOR EN VM PARA NO CONFUNDIRME
        const vm = this;

        // ESTAS SON LAS VARIABLES QUE VOY A USAR PARA GUARDAR LOS ARCHIVOS Y EL RESUMEN
        vm.archivoXML = null;
        vm.resumenCarga = null;

        // ESTAS VARIABLES SON PARA CONTROLAR LOS ESTADOS DE CARGA Y ERRORES
        vm.cargandoDescarga = false;
        vm.errorDescarga = '';
        vm.cargandoCarga = false;
        vm.errorCarga = '';

        // ESTA FUNCION ES PARA DESCARGAR EL XML, RE COPADA
        vm.descargarXML = function() {
            // PONGO EL LOADING EN TRUE Y LIMPIO ERRORES ANTERIORES
            vm.cargandoDescarga = true;
            vm.errorDescarga = '';

            // LLAMO AL SERVICIO QUE ME TRAE EL XML
            ApiServicio.descargarXML()
                .then(function(respuesta) {
                    // CUANDO TERMINA, SACO EL LOADING
                    vm.cargandoDescarga = false;
                    
                    // CREO UN BLOB CON LA DATA DEL XML
                    const blob = new Blob([respuesta.data], { type: 'application/xml' });
                    const url = $window.URL.createObjectURL(blob);
                    
                    // CREO UN LINK INVISIBLE PARA HACER LA DESCARGA, RE TURBIO PERO FUNCIONA
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'reservas.xml';
                    document.body.appendChild(a);
                    a.click();
                    
                    // LIMPIO TODO PARA NO DEJAR BASURA EN EL DOM
                    a.remove();
                    $window.URL.revokeObjectURL(url);
                })
                .catch(function(err) {
                    // SI ALGO SALE MAL, MUESTRO EL ERROR
                    vm.cargandoDescarga = false;
                    vm.errorDescarga = 'Error al descargar el archivo XML.';
                });
        };

        // ESTA FUNCION ES PARA SUBIR EL XML
        vm.cargarXML = function() {
            // ME FIJO SI HAY ARCHIVO SELECCIONADO, SI NO HAY TIRO ERROR
            if (!vm.archivoXML) {
                vm.errorCarga = 'Por favor, selecciona un archivo primero.';
                return;
            }

            // PONGO EL LOADING Y LIMPIO TODO
            vm.cargandoCarga = true;
            vm.errorCarga = '';
            vm.resumenCarga = null;

            // MANDO EL ARCHIVO AL SERVIDOR
            ApiServicio.cargarXML(vm.archivoXML)
                .then(function(respuesta) {
                    // CUANDO TERMINA, ACTUALIZO TODO
                    vm.cargandoCarga = false;
                    vm.resumenCarga = respuesta.data;
                    vm.archivoXML = null; 
                    
                    // LIMPIO EL INPUT DE ARCHIVO, SINO QUEDA EL NOMBRE AHI
                    document.querySelector('input[type="file"]').value = null; 
                })
                .catch(function(err) {
                    // SI ALGO SALE MAL, MUESTRO EL ERROR QUE VIENE DEL SERVIDOR
                    vm.cargandoCarga = false;
                    vm.errorCarga = err.data.error || 'Error al procesar el archivo.';
                });
        };
    });