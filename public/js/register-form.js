function registerForm() {
    let isValid = true;

    const firstName = $('#first_name').val().trim();
    const firstNameError = $('#first_name_error');
    if (!firstName || firstName.length > 80) {
        let msg = !firstName ? 'First name is required' : 'First name cannot exceed 80 characters';
        firstNameError.text(msg).addClass('error');
        isValid = false;
    }
    const lastName = $('#last_name').val().trim();
    const lastNameError = $('#last_name_error');
    if (!lastName || lastName.length > 80) {
        let msg = !lastName ? 'Last name is required' : 'Last name cannot exceed 80 characters';
        lastNameError.text(msg).addClass('error');
        isValid = false;
    }
    const email = $('#email').val().trim();
    const emailError = $('#email_error');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.length > 255 || !emailPattern.test(email)) {
        let msg = !email ? 'Email is required'
            : email.length > 255 ? 'Email cannot exceed 255 characters' : 'Please enter a valid email address';
        emailError.text(msg).addClass('error');
        isValid = false;
    }
    const username = $('#username').val().trim();
    const usernameError = $('#username_error');
    if (!username || username.length > 32) {
        let msg = !username ? 'Username is required' : 'Username cannot exceed 32 characters';
        usernameError.text(msg).addClass('error');
        isValid = false;
    }
    const password = $('#password').val().trim();
    const passwordError = $('#password_error');
    if (!password || password.length > 255) {
        let msg = !password ? 'Password is required' : 'Password cannot exceed 255 characters';
        passwordError.text(msg).addClass('error');
        isValid = false;
    }
    const confirmPassword = $('#confirm_password').val().trim();
    const confirmPasswordError = $('#confirm_password_error');
    if (confirmPassword !== password) {
        let msg = 'Password must match';
        confirmPasswordError.text(msg).addClass('error');
        isValid = false;
    }

    return isValid;
}

function submitRegisterForm() {
    const data = {
        first_name: $('#first_name').val().trim(),
        last_name: $('#last_name').val().trim(),
        email: $('#email').val().trim(),
        username: $('#username').val().trim(),
        password: $('#password').val().trim()
    };
    $.ajax({
        type: 'POST',
        url: '/register',
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
    $('#email').on('blur', function () {
        const email = $(this).val().trim();
        if (email.length > 0) {
            $.get('/check-email', { email : email }, function (data) {
                if (!data.available) {
                    $('#email_error').text('This email is already in use').addClass('error');
                } else {
                    $('#email_error').text('').removeClass('error');
                }
            });
        }
    });

    $('.input').on('focus', function () {
        const inputId = $(this).attr('id');
        const errorId = `#${inputId}_error`;
        $(errorId).text('').removeClass('error');
    });

    $('#register_form').on('submit', function (e) {
        e.preventDefault();
        $('#error_code').text('').removeClass('error');
        const emailError = $('#email_error');
        if (!registerForm() || emailError.hasClass('error')) {
            return;
        }
        submitRegisterForm();
    });
});