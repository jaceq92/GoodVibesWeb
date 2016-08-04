function checkPasswordMatch() {
    var password = document.getElementById("registerpassword").value;
    var confirmPassword = document.getElementById("verifypassword").value;
    if (password != confirmPassword) {
        return false;
    }
    else {
        return true;
    }
}
$(function () {
    $("input#username").on({
        keydown: function (e) {
            if (e.which === 32)
                return false;
        },
        change: function () {
            this.value = this.value.replace(/\s/g, "");
        }
    });
});

$(function () {
    $('#loginform').on('submit', function (e) {
            e.preventDefault();
            $.ajax({
                url: "../api/auth/",
                type: "PUT",
                data: $("#loginform").serialize(),
                dataType: "text",
                success: function (data, status, jqXHR) {
                    window.location.replace("../GV/Index");
                },
                error: function (res) {
                    var responsetext = res.responseText;
                    noty({ text: responsetext, type: 'error', layout: 'topCenter', timeout: 3000 });
                }
            });       
    });
});

$(function () {
    $('#registerform').on('submit', function (e) {
        e.preventDefault();
        var check = checkPasswordMatch();
        if (check == true) {
            e.preventDefault();
            $.ajax({
                url: "../api/createuser/",
                type: "POST",
                data: $("#registerform").serialize(),
                dataType: "text",
                success: function (data, status, jqXHR) {
                    var responsetext = jqXHR.responseText;
                    noty({ text: responsetext, type: 'success', layout: 'topCenter', timeout: 3000 });
                    $('#registerModal').modal('hide');
                },
                error: function (res) {
                    var responsetext = res.responseText;
                    noty({ text: responsetext, type: 'error', layout: 'topCenter', timeout: 3000 });
                }
            });
        }
        else {
            noty({ text: "Passwords do not match!", type: 'error', layout: 'topCenter', timeout: 3000 });
        }
    });
});