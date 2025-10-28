// Definimos el servicio (factory) dentro de nuestro módulo 'appVuelos'
angular.module('appVuelos')
    .factory('AuthServicio', function($http, $window, API_URL) {
        
        // El objeto que retornará nuestro servicio
        const authFactory = {};

        // Función para guardar el token en el localStorage del navegador
        authFactory.guardarToken = function(token) {
            $window.localStorage.setItem('token-vuelos', token);
        };

        // Función para obtener el token
        authFactory.obtenerToken = function() {
            return $window.localStorage.getItem('token-vuelos');
        };

        // Función para cerrar sesión (borrar el token)
        authFactory.logout = function() {
            $window.localStorage.removeItem('token-vuelos');
        };

        // Función para iniciar sesión (llama a la API)
        authFactory.iniciarSesion = function(credenciales) {
            // $http.post retorna una "promesa"
            return $http.post(API_URL + '/auth/login', credenciales);
        };

        // Función para registrar un usuario (llama a la API)
        authFactory.registrarUsuario = function(usuario) {
            return $http.post(API_URL + '/auth/registro', usuario);
        };

        return authFactory;
    });