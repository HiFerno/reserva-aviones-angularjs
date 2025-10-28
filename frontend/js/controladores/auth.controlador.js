angular.module('appVuelos')
    .controller('AuthController', function($location, AuthServicio) {
        
        // 'vm' (ViewModel) es una variable que usaremos para referirnos al controlador
        const vm = this;

        // --- Modelos de datos ---
        vm.credenciales = {
            correo_electronico: '',
            contrasena: ''
        };
        vm.usuario = {
            correo_electronico: '',
            contrasena: '',
            confirmar_contrasena: ''
        };

        // --- Estados de la UI ---
        vm.cargando = false;
        vm.error = '';
        vm.exito = '';

        // --- Función para Iniciar Sesión ---
        vm.iniciarSesion = function() {
            vm.cargando = true;
            vm.error = '';

            AuthServicio.iniciarSesion(vm.credenciales)
                .then(function(respuesta) {
                    // ÉXITO: La API devolvió un 200 OK
                    vm.cargando = false;
                    // Guardamos el token que nos envió la API
                    AuthServicio.guardarToken(respuesta.data.token);
                    // Redirigimos al usuario a la página principal
                    $location.path('/principal');
                })
                .catch(function(err) {
                    // ERROR: La API devolvió un 401, 500, etc.
                    vm.cargando = false;
                    vm.error = err.data.error || 'No se pudo iniciar sesión.';
                });
        };

        // --- Función para Registrar Usuario ---
        vm.registrarUsuario = function() {
            vm.cargando = true;
            vm.error = '';
            vm.exito = '';

            // Pequeña validación en el frontend
            if (vm.usuario.contrasena !== vm.usuario.confirmar_contrasena) {
                vm.cargando = false;
                vm.error = 'Las contraseñas no coinciden.';
                return;
            }

            AuthServicio.registrarUsuario(vm.usuario)
                .then(function(respuesta) {
                    // ÉXITO
                    vm.cargando = false;
                    vm.exito = respuesta.data.mensaje + ' Serás redirigido al login.';
                    // Limpiamos el formulario
                    vm.usuario = {};
                    // Redirigimos al login después de 2 segundos
                    setTimeout(function() {
                        $location.path('/login');
                    }, 2000);
                })
                .catch(function(err) {
                    // ERROR
                    vm.cargando = false;
                    vm.error = err.data.error || 'No se pudo completar el registro.';
                });
        };
    });