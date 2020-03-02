$(function () {
    var socket = io();
    var instance = new SocketIOFileUpload(socket);
    instance.listenOnSubmit(document.getElementById("send"), document.getElementById("file_input"));
    var x = prompt("Login:");
    var contadorLineas = 0
    if (x == null || x == '') {
        location.reload();
    }
    socket.emit('usuario', x);
    $('form').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        if ($('#m').val()) {
            socket.emit('chat message', [$('#m').val(), $('#file_input').prop('files')]);
        }
        $('#m').val('');
        return false;
    });
    $('#m').keydown(function (e) {
        if (e.keyCode != 13) {
            tiempo = null
            socket.emit('escribiendo', x + ' está escribiendo');
            socket.on('typing', function (datos) {
                $('#typing').text(datos);
                $('#typing').addClass('bg-warning');
                let tiempo = setTimeout(function () {
                    $('#typing').text('');
                }, 5000);
            });
        }
    });
    socket.on('chat message', function (msg) {
        contadorLineas++;
        if (msg[0] == x) {
            $('#messages').append("<li class=\"" + contadorLineas + "mensaje carta mt-2\">")
            $('.' + contadorLineas + 'mensaje').append("<div class=\"card esta bg-info\"><div class=\"card-body\"><h6 class=\"font-weight-bold\">" + msg[0] + "</h6><p>" + msg[1] + "</p></div></div>")
        }
        else {
            $('#messages').append("<li class=\"" + contadorLineas + "mensaje carta ml-auto mt-2\">")
            $('.' + contadorLineas + 'mensaje').append("<div class=\"card esta bg-success\"><div class=\"card-body\"><h6 class=\"font-weight-bold\">" + msg[0] + "</h6><p>" + msg[1] + "</p></div></div>")
        }
        $('#typing').text('');
        $("html, body").animate({ scrollTop: $(document).height() - $(window).height() });
    });
    socket.on('chat image', function (imagen) {
        if (imagen.name.includes("jpg") || imagen.name.includes("png") || imagen.name.includes("jpeg")) {
            $("li:last-child .card .card-body").append("<br/><a target=\"_blank\" href=\"./files/" + imagen.name + "\"><img class=\"imagen\" src=\"./files/" + imagen.name + "\"/></a>")
            $('#file_input').val('')
        }
        else {
            $("li:last-child .card .card-body").append("<br/><a target=\"_blank\" href=\"./files/" + imagen.name + "\"><img class=\"imagen\" src=\"./files/fichero.png\"/></a>")
            $('#file_input').val('')
        }

    })
    socket.on('update', function (users) {
        userList = users;
        $('.cantidadUsers').text("Hay " + userList.length + " usuarios conectados")
        $('#users').empty();
        for (var i = 0; i < userList.length; i++) {
            str = userList[i].replace(/\s/g, '')
            $('#users').append('<div class=\"col-12 card ' + str + 'nuevo\">')
            $("." + str + "nuevo").append('<div class=\"' + str + ' card-body font-weight-bold\">' + userList[i] + '</div>')
        }
    });
});