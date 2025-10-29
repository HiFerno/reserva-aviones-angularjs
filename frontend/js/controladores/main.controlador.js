// ACA REGISTRO EL CONTROLADOR PRINCIPAL 'MAINCONTROLLER' EN EL MODULO APPVUELOS
// INYECTO $ROOTSCOPE, $LOCATION Y AUTHSERVICIO PARA PODER CONTROLAR RUTAS Y SESION
angular.module('appVuelos')
    .controller('MainController', function($rootScope, $location, AuthServicio) {
        
        // GUARDO LA REFERENCIA DEL CONTROLADOR EN VM PARA USARLA EN LA VISTA SIN CONFUSIONES
        const vm = this;
        // VARIABLE PARA CONTROLAR EL ESTADO DEL MENU HAMBURGUESA DE BULMA, ARRANCA CERRADO
        vm.menuActivo = false; // PARA EL MENÚ HAMBURGUESA DE BULMA

        // FUNCION PARA CERRAR SESION: LE DIGO AL SERVICIO QUE BORRE LO NECESARIO Y REDIRIJO
        vm.logout = function() {
            // LE PIDO AL SERVICIO DE AUTENTICACION QUE HAGA LOGOUT (BORRE TOKEN, ETC)
            AuthServicio.logout();
            // REDIRIJO AL LOGIN PARA QUE EL USUARIO VUELVA A IDENTIFICARSE
            $location.path('/login');
        };

        // FUNCION PARA TOOGLEAR EL MENU HAMBURGUESA (ABRIR / CERRAR)
        vm.toggleMenu = function() {
            // CAMBIO EL VALOR A SU CONTRARIO, ASI ABRE O CIERRA EL MENU
            vm.menuActivo = !vm.menuActivo;
        };

        // --- OBSERVADORES --- 
        // VIGILO $ROOTSCOPE.MOSTRARNAVBAR (LO DEFINIMOS EN APP.JS) PARA MOSTRAR/OCULTAR LA NAVBAR
        $rootScope.$watch('mostrarNavbar', function(nuevoValor) {
            // ACTUALIZO LA PROPIEDAD EN VM PARA QUE LA VISTA SE ENTERE DEL CAMBIO
            vm.mostrarNavbar = nuevoValor;
        });

        // SI CAMBIA LA RUTA (POR EJEMPLO HACEMOS CLICK EN UN LINK), CERRAMOS EL MENU HAMBURGUESA
        $rootScope.$on('$routeChangeSuccess', function() {
            // ASEGURO QUE EL MENU QUEDE CERRADO AL NAVEGAR
            vm.menuActivo = false;
        });
    });
