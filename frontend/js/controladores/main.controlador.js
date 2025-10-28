angular.module('appVuelos')
    .controller('MainController', function($rootScope, $location, AuthServicio) {
        
        const vm = this;
        vm.menuActivo = false; // Para el menú hamburguesa de Bulma

        // Función para el botón "CERRAR SESIÓN"
        vm.logout = function() {
            AuthServicio.logout();
            $location.path('/login');
        };

        // Función para el menú hamburguesa
        vm.toggleMenu = function() {
            vm.menuActivo = !vm.menuActivo;
        };

        // --- Observadores ---
        // Observamos el valor $rootScope.mostrarNavbar que definimos en app.js
        $rootScope.$watch('mostrarNavbar', function(nuevoValor) {
            vm.mostrarNavbar = nuevoValor;
        });

        // Si la ruta cambia (ej. hacemos clic en un link), cerramos el menú hamburguesa
        $rootScope.$on('$routeChangeSuccess', function() {
            vm.menuActivo = false;
        });
    });