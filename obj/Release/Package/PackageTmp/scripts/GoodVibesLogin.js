
$(function () {
    $('#loginform').on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            url: "../api/auth/",
            type: "PUT",
            data: $("#loginform").serialize(),
            dataType: "text",
            success: function (data) {
                window.location.replace("../Home/Index");
            },
            error: function (data) {
                $("#result").css('color', 'red');
                $('#result').text("Incorrect username or password. Try again!");
            }
        });
    });
});

$(function () {
    $('#registerform').on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            url: "../api/createuser/",
            type: "POST",
            data: $("#registerform").serialize(),
            dataType: "text",
            success: function (data) {
                $('#registerModal').modal('hide');
                $("#result").css('color', 'green');
                $('#result').text("User creation succesful. You may now log in!");
            },
            error: function (data) {
                $('#registerModal').modal('hide');
                $("#result").css('color', 'red');
                $('#result').text("User creation failed. Reload page and try again!");
            }
        });
    });
});