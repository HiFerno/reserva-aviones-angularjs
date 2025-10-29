// ACA DEFINO EL MODULO PRINCIPAL Y LE INYECTO NGROUTE, LO BASICO PARA LA APP
angular.module('appVuelos', ['ngRoute'])

// CONSTANTE CON LA URL BASE DE LA API, CAMBIAR SI CORRE EL BACKEND EN OTRO LUGAR
.constant('API_URL', 'http://localhost:4000/api')

// ACÁ CONFIGURO LAS RUTAS, LOS CONTROLLERS Y QUIEN PUEDE VER CADA UNA
.config(function($routeProvider, $httpProvider) {
    $routeProvider
        .when('/login', {
            templateUrl: 'vistas/inicio-sesion.html',
            controller: 'AuthController',
            controllerAs: 'vm',
            proteger: false,
            mostrarNavbar: false // NO MOSTRAR NAVBAR EN LOGIN, ASÍ NO SE VE LA BARRA
        })
        .when('/registro', {
            templateUrl: 'vistas/registro.html',
            controller: 'AuthController',
            controllerAs: 'vm',
            proteger: false,
            mostrarNavbar: false // TAMPOCO EN REGISTRO
        })
        .when('/principal', {
            templateUrl: 'vistas/principal.html',
            controller: 'PrincipalController',
            controllerAs: 'vm',
            proteger: true, // ESTA RUTA SIEMPRE PIDE TOKEN
            mostrarNavbar: true // MOSTRAR LA NAVBAR CUANDO ESTEMOS ADENTRO
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
        // RUTA POR DEFECTO, SI NO ENCUENTRA NADA REDIRIJO AL LOGIN
        .otherwise({
            redirectTo: '/login'
        });
    // AQUI AGREGO EL INTERCEPTOR QUE SE ENCARGA DEL TOKEN EN LAS PETICIONES
    $httpProvider.interceptors.push('AuthInterceptor');
})

// ESTA PARTE SE EJECUTA UNA VEZ AL ARRANQUE, LA USO PARA CONTROLAR ACCESO Y NAVBAR
.run(function($rootScope, $location, $window) {
    
    // CUANDO VA A CAMBIAR LA RUTA, LO CHEQUEO
    $rootScope.$on('$routeChangeStart', function(event, nextRoute) {
        
        // SI LA RUTA ESTA PROTEGIDA, ME FIJO SI HAY TOKEN EN LOCALSTORAGE
        if (nextRoute.proteger) {
            const token = $window.localStorage.getItem('token-vuelos');
            if (!token) {
                // SI NO HAY TOKEN, FORZO AL USUARIO A IR AL LOGIN
                $location.path('/login');
            }
        }

        // ACTUALIZO LA VARIABLE GLOBAL PARA MOSTRAR U OCULTAR LA NAVBAR (LA USA MAINCONTROLLER)
        $rootScope.mostrarNavbar = nextRoute.mostrarNavbar;
    });
});


/* ESTE DIRECTIVE LO USO PARA ENLAZAR INPUT FILE CON UNA VARIABLE EN EL SCOPE
   ANGULAR NO LO HACE DIRECTO, ASI QUE LO MANEJO A MANO */
angular.module('appVuelos')
    .directive('fileModel', function($parse) {
        return {
            restrict: 'A', // USAR COMO ATRIBUTO: <input file-model="vm.archivo" />
            link: function(scope, element, attrs) {
                const model = $parse(attrs.fileModel);
                const modelSetter = model.assign;
                
                // CUANDO CAMBIA EL INPUT (SELECCIONAN UN ARCHIVO) ACTUALIZO LA VARIABLE
                element.bind('change', function() {
                    scope.$apply(function() {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    });