angular.module('appVuelos')
    .controller('ArchivosController', function(ApiServicio, $window) {
        
        const vm = this;

        // --- Modelos ---
        vm.archivoXML = null;
        vm.resumenCarga = null;

        // --- Estados UI ---
        vm.cargandoDescarga = false;
        vm.errorDescarga = '';
        vm.cargandoCarga = false;
        vm.errorCarga = '';

        // --- Función para Descargar XML ---
        vm.descargarXML = function() {
            vm.cargandoDescarga = true;
            vm.errorDescarga = '';

            ApiServicio.descargarXML()
                .then(function(respuesta) {
                    vm.cargandoDescarga = false;
                    
                    // Magia para descargar un archivo 'blob'
                    const blob = new Blob([respuesta.data], { type: 'application/xml' });
                    const url = $window.URL.createObjectURL(blob);
                    
                    // Creamos un link fantasma para forzar la descarga
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'reservas.xml';
                    document.body.appendChild(a);
                    a.click();
                    
                    // Limpiamos
                    a.remove();
                    $window.URL.revokeObjectURL(url);
                })
                .catch(function(err) {
                    vm.cargandoDescarga = false;
                    vm.errorDescarga = 'Error al descargar el archivo XML.';
                });
        };

        // --- Función para Cargar XML ---
        vm.cargarXML = function() {
            if (!vm.archivoXML) {
                vm.errorCarga = 'Por favor, selecciona un archivo primero.';
                return;
            }

            vm.cargandoCarga = true;
            vm.errorCarga = '';
            vm.resumenCarga = null;

            ApiServicio.cargarXML(vm.archivoXML)
                .then(function(respuesta) {
                    vm.cargandoCarga = false;
                    vm.resumenCarga = respuesta.data;
                    vm.archivoXML = null; // Limpiamos el input
                    // Limpiamos el input visualmente (truco)
                    document.querySelector('input[type="file"]').value = null; 
                })
                .catch(function(err) {
                    vm.cargandoCarga = false;
                    vm.errorCarga = err.data.error || 'Error al procesar el archivo.';
                });
        };
    });