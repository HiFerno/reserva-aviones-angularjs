// 1. Definir el módulo principal (appVuelos) e inyectar 'ngRoute'
angular.module('appVuelos', ['ngRoute'])

// 2. Definir constantes (URL de la API)
.constant('API_URL', 'http://localhost:4000/api')

// 3. Configurar las rutas
.config(function($routeProvider, $httpProvider) {
    $routeProvider
        .when('/login', {
            templateUrl: 'vistas/inicio-sesion.html',
            controller: 'AuthController',
            controllerAs: 'vm',
            proteger: false,
            mostrarNavbar: false // Ocultar navbar en login
        })
        .when('/registro', {
            templateUrl: 'vistas/registro.html',
            controller: 'AuthController',
            controllerAs: 'vm',
            proteger: false,
            mostrarNavbar: false // Ocultar navbar en registro
        })
        .when('/principal', {
            templateUrl: 'vistas/principal.html',
            controller: 'PrincipalController',
            controllerAs: 'vm',
            proteger: true, // Esta ruta SÍ está protegida
            mostrarNavbar: true // Mostrar navbar
        })
        .when('/modificar', {
            templateUrl: 'vistas/modificar.html',
            controller: 'ModificarController',
            controllerAs: 'vm',
            proteger: true,
            mostrarNavbar: true
        })
        .when('/cancelar', {
            templateUrl: 'vistas/cancelar.html',
            controller: 'CancelarController',
            controllerAs: 'vm',
            proteger: true,
            mostrarNavbar: true
        })
        .when('/reportes', {
            templateUrl: 'vistas/reportes.html',
            controller: 'ReportesController',
            controllerAs: 'vm',
            proteger: true,
            mostrarNavbar: true
        })
        .when('/archivos', {
            templateUrl: 'vistas/archivos.html',
            controller: 'ArchivosController',
            controllerAs: 'vm',
            proteger: true,
            mostrarNavbar: true
        })
        // Ruta por defecto
        .otherwise({
            redirectTo: '/login'
        });
    $httpProvider.interceptors.push('AuthInterceptor');
})

// 4. Configurar la seguridad (el .run se ejecuta 1 vez al inicio)
.run(function($rootScope, $location, $window) {
    
    // Escuchar cada vez que la ruta esté a punto de cambiar
    $rootScope.$on('$routeChangeStart', function(event, nextRoute) {
        
        // 1. Verificar si la ruta está protegida
        if (nextRoute.proteger) {
            // 2. Si está protegida, buscar el token en localStorage
            const token = $window.localStorage.getItem('token-vuelos');
            if (!token) {
                // 3. Si no hay token, redirigir al login
                $location.path('/login');
            }
        }

        // 4. Mostrar u ocultar el Navbar según la configuración de la ruta
        // (Esto se usará en MainController)
        $rootScope.mostrarNavbar = nextRoute.mostrarNavbar;
    });
});


angular.module('appVuelos')
    .directive('fileModel', function($parse) {
        return {
            restrict: 'A', // Solo usar como atributo
            link: function(scope, element, attrs) {
                const model = $parse(attrs.fileModel);
                const modelSetter = model.assign;
                
                // Cuando el valor del input cambia...
                element.bind('change', function() {
                    // ...actualiza la variable en el scope.
                    scope.$apply(function() {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    });