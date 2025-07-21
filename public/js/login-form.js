function submitLoginForm() {
    const data = {
        email: $('#email').val().trim(),
        password: $('#password').val().trim()
    };
    $.ajax({
        type: 'POST',
        url: '/login',
        data: data,
        success: function () {
            window.location.href = '/chat';
        },
        error: function (xhr) {
            const error = xhr.responseJSON?.message || 'Something went wrong';
            $('#error_code').text(error).addClass('error');
        }
    });
}

$(document).ready(function () {
    $('#login_form').on('submit', function (e) {
        e.preventDefault();
        $('#error_code').text('').removeClass('error');
        submitLoginForm();
    });
});