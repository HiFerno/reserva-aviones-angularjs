// ACA DEFINO EL CONTROLADOR DE AUTENTICACION DENTRO DEL MODULO DE LA APP
angular.module('appVuelos')
    // AQUI REGISTRO EL CONTROLADOR 'AUTHCONTROLLER' Y LE INYECTO $LOCATION Y AUTHSERVICIO
    .controller('AuthController', function($location, AuthServicio) {
        
        // 'VM' (VIEWMODEL) ES UNA REFERENCIA AL CONTROLADOR PARA USAR EN LA VISTA SIN CONFUSIONES
        const vm = this;

        // --- MODELOS DE DATOS ---
        // AQUI DEFINO EL OBJETO DE CREDENCIALES QUE VOY A ENVIAR AL LOGIN
        vm.credenciales = {
            // EMAIL DEL USUARIO (VACIO AL INICIO)
            correo_electronico: '',
            // CONTRASEÑA DEL USUARIO (VACIA AL INICIO)
            contrasena: ''
        };
        // AQUI DEFINO EL OBJETO PARA REGISTRAR UN USUARIO NUEVO
        vm.usuario = {
            // EMAIL PARA REGISTRO
            correo_electronico: '',
            // CONTRASEÑA PARA REGISTRO
            contrasena: '',
            // CAMPO PARA CONFIRMAR CONTRASEÑA
            confirmar_contrasena: ''
        };

        // --- ESTADOS DE LA UI ---
        // FLAG PARA INDICAR QUE ESTAMOS HACIENDO UNA PETICION
        vm.cargando = false;
        // TEXTO DE ERROR PARA MOSTRAR AL USUARIO
        vm.error = '';
        // TEXTO DE EXITO PARA MOSTRAR AL USUARIO
        vm.exito = '';

        // --- FUNCION PARA INICIAR SESION ---
        // ESTA FUNCION MANDA LAS CREDENCIALES AL SERVICIO Y MANEJA LA RESPUESTA
        vm.iniciarSesion = function() {
            // PONGO EL LOADING EN TRUE
            vm.cargando = true;
            // LIMPIO ERRORES ANTERIORES
            vm.error = '';

            // LLAMO AL SERVICIO DE AUTENTICACION PASANDO LAS CREDENCIALES
            AuthServicio.iniciarSesion(vm.credenciales)
                .then(function(respuesta) {
                    // SI TODO SALE BIEN, QUITO EL LOADING
                    vm.cargando = false;
                    // GUARDO EL TOKEN QUE ME DEVOLVIO LA API
                    AuthServicio.guardarToken(respuesta.data.token);
                    // REDIRIJO AL USUARIO A LA PANTALLA PRINCIPAL
                    $location.path('/principal');
                })
                .catch(function(err) {
                    // SI HAY ERROR, TAMBIEN QUITO EL LOADING
                    vm.cargando = false;
                    // MUESTRO EL MENSAJE DE ERROR QUE VINO DEL SERVIDOR O UNO POR DEFECTO
                    vm.error = err.data.error || 'No se pudo iniciar sesión.';
                });
        };

        // --- FUNCION PARA REGISTRAR USUARIO ---
        // ESTA FUNCION VALIDA LA CONTRASEÑA Y LLAMA AL SERVICIO DE REGISTRO
        vm.registrarUsuario = function() {
            // INDICO QUE ESTOY CARGANDO
            vm.cargando = true;
            // LIMPIO MENSAJES
            vm.error = '';
            vm.exito = '';

            // TRAIGO LA CONTRASEÑA A UNA VARIABLE PARA VALIDARLA FACIL
            const contrasena = vm.usuario.contrasena;

            // SI NO HAY CONTRASEÑA, CORTO Y MUESTRO ERROR
            if (!contrasena) {
                vm.cargando = false;
                vm.error = 'La contraseña es obligatoria.';
                return;
            }

            // ARRAY PARA ACUMULAR ERRORES DE VALIDACION
            const errores = [];
            // VALIDACION: MINIMO 8 CARACTERES
            if (contrasena.length < 8) {
                errores.push('Mínimo 8 caracteres.');
            }
            // VALIDACION: DEBE TENER UNA MINUSCULA
            if (!/[a-z]/.test(contrasena)) {
                errores.push('Debe tener una minúscula.');
            }
            // VALIDACION: DEBE TENER UNA MAYUSCULA
            if (!/[A-Z]/.test(contrasena)) {
                errores.push('Debe tener una mayúscula.');
            }
            // EXPRESION REGULAR PARA CARACTERES ESPECIALES
            const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
            // VALIDACION: DEBE TENER UN CARACTER ESPECIAL
            if (!specialCharRegex.test(contrasena)) {
                errores.push('Debe tener un caracter especial.');
            }

            // SI HAY ERRORES, LOS MUESTRO Y CORTO LA EJECUCION
            if (errores.length > 0) {
                vm.cargando = false;
                vm.error = 'Contraseña no segura: ' + errores.join(' ');
                return; // DETIENE LA EJECUCION
            }

            // VALIDACION SIMPLE: LAS CONTRASEÑAS DEBEN COINCIDIR
            if (vm.usuario.contrasena !== vm.usuario.confirmar_contrasena) {
                vm.cargando = false;
                vm.error = 'Las contraseñas no coinciden.';
                return;
            }

            // SI TODO ESTA BIEN, LLAMO AL SERVICIO PARA REGISTRAR AL USUARIO
            AuthServicio.registrarUsuario(vm.usuario)
                .then(function(respuesta) {
                    // EXITO: QUITO EL LOADING
                    vm.cargando = false;
                    // MUESTRO EL MENSAJE DE EXITO QUE VINO DEL SERVIDOR Y AVISO REDIRECCION
                    vm.exito = respuesta.data.mensaje + ' Serás redirigido al login.';
                    // LIMPIO EL FORMULARIO DE USUARIO
                    vm.usuario = {};
                    // REDIRIJO AL LOGIN DESPUES DE 2 SEGUNDOS
                    setTimeout(function() {
                        $location.path('/login');
                    }, 2000);
                })
                .catch(function(err) {
                    // ERROR EN EL REGISTRO: QUITO EL LOADING Y MUESTRO MENSAJE
                    vm.cargando = false;
                    vm.error = err.data.error || 'No se pudo completar el registro.';
                });
        };
    });